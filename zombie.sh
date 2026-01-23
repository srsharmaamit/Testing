#!/usr/bin/env bash
# Airflow Scheduler & Zombie Task Debug Script
# Description: Gathers logs, DB info, and system metrics to diagnose scheduler heartbeat failures and zombie tasks.
# Usage: Run inside the Airflow scheduler pod (UBI8 container) with env vars for DB access. Output goes to console and a Markdown report file.

# Exit on any error, unset var, or pipeline error. Use trap for error handling.
set -Eeuo pipefail
trap 'echo "Error on line $LINENO: $BASH_COMMAND" >&2' ERR

# Configuration
LOG_BASE="${AIRFLOW_LOG_BASE:-/usr/local/airflow/pvc/logs}"  # Base path for Airflow logs (can be overridden by env AIRFLOW_LOG_BASE)
REPORT_FILE="airflow_debug_report_$(date +%Y%m%d_%H%M%S).md"

# Functions for dual logging (to console and report file)
info() {
  echo -e "$*" | tee -a "$REPORT_FILE"
}
err() {
  echo -e "$*" >> "$REPORT_FILE"
  echo -e "$*" >&2
}

section() {
  # Print a section heading (##) in Markdown
  info "\n## $*"
}

collect_system_metrics() {
  section "System Metrics"
  # CPU Load and cores
  local load_avg cores
  load_avg=$(uptime | awk -F'load average:' '{print $2}' | cut -d, -f1 | sed 's/^ *//')
  cores=$(grep -c ^processor /proc/cpuinfo || nproc)
  info "- **CPU Cores:** $cores"
  info "- **Load Average (1 min):** $load_avg"
  # Flag high CPU load
  if [[ $(echo "$load_avg > $cores" | bc -l) -eq 1 ]]; then
    err "  - ⚠️ CPU load is high relative to core count (possible scheduler lag)."
    summary_observations+=("High CPU load (load avg ~$load_avg on $cores cores)")
    summary_actions+=("Scale up or optimize: high CPU can stall the scheduler:contentReference[oaicite:7]{index=7}")
  fi

  # Memory usage
  local mem_total mem_used mem_used_pct
  read -r _ mem_total _ < <(free -m | grep -i Mem:)
  read -r _ mem_used _ < <(free -m | grep -i Mem:)
  mem_used_pct=$(( mem_used * 100 / mem_total ))
  info "- **Memory Used:** ${mem_used}MB / ${mem_total}MB (${mem_used_pct}% used)"
  if (( mem_used_pct >= 90 )); then
    err "  - ⚠️ Memory usage above 90% (risk of OOM kills)."
    summary_observations+=("High memory usage (${mem_used_pct}% of RAM)")
    summary_actions+=("Increase memory or investigate leaks – OOM can cause zombie tasks:contentReference[oaicite:8]{index=8}")
  fi

  # Disk usage (especially logs directory)
  if df -h "$LOG_BASE" &>/dev/null; then
    local log_disk_usage
    log_disk_usage=$(df -h "$LOG_BASE" | tail -1 | awk '{print $5}')
    info "- **Disk Usage (Airflow logs volume):** $log_disk_usage"
    local usage_pct=${log_disk_usage%\%}
    if [[ $usage_pct -ge 90 ]]; then
      err "  - ⚠️ Log volume is above 90% capacity."
      summary_observations+=("Low disk space on Airflow logs volume ($log_disk_usage used)")
      summary_actions+=("Clear old logs or expand storage to prevent failures due to full disk")
    fi
  fi

  # Network stats (brief)
  if command -v ifconfig &>/dev/null; then
    local iface rx tx
    iface=$(ifconfig | grep -E '^(e|c|eth0)' | awk '{print $1}' | head -1)
    if [[ -n "$iface" ]]; then
      rx=$(ifconfig "$iface" | grep "RX packets" | awk '{print $5,$6}')
      tx=$(ifconfig "$iface" | grep "TX packets" | awk '{print $5,$6}')
      info "- **Network ($iface):** RX $rx, TX $tx"
    fi
  fi

  # Process tree (Airflow and system processes)
  info "\n**Process Tree:**"
  info '```'
  if ps ax -o pid,ppid,cmd --forest &>/dev/null; then
    ps ax -o pid,ppid,cmd --forest | tee -a "$REPORT_FILE"
  else
    pstree -ap || ps -ef | tee -a "$REPORT_FILE"
  fi
  info '```'
}

collect_supervisor_status() {
  section "Supervisor/Process Status"
  # If supervisorctl is available, get status of processes
  if command -v supervisorctl &>/dev/null; then
    info "**Supervisor Processes:**"
    info '```'
    supervisorctl status | tee -a "$REPORT_FILE"
    info '```'
  else
    info "*Supervisor not found.*"
  fi
  # Show key Airflow processes (scheduler, webserver, etc.)
  info "\n**Airflow Services:**"
  if pgrep -f "airflow scheduler" &>/dev/null; then
    info "- Scheduler: **running** (PID $(pgrep -f 'airflow scheduler' | head -1))"
  else
    err "- Scheduler: **not running**"
    summary_observations+=("Airflow Scheduler process is not running")
    summary_actions+=("Ensure the scheduler is up or investigate crash logs")
  fi
  if pgrep -f "airflow webserver" &>/dev/null; then
    info "- Webserver: **running**"
  else
    info "- Webserver: not running or not applicable"
  fi
  if pgrep -f "airflow kerberos" &>/dev/null; then
    info "- Kerberos: **running**"
  fi
  if pgrep -f "airflow triggerer" &>/dev/null; then
    info "- Triggerer: **running**"
  fi
}

collect_logs() {
  section "Airflow Logs Analysis"
  # Find scheduler log file (if stored on local filesystem)
  local sched_log
  # Try common locations for scheduler log
  if [[ -f "$LOG_BASE/airflow-scheduler.log" ]]; then
    sched_log="$LOG_BASE/airflow-scheduler.log"
  elif [[ -f "$LOG_BASE/scheduler.log" ]]; then
    sched_log="$LOG_BASE/scheduler.log"
  else
    # e.g., Helm chart might store under logs/scheduler/*
    sched_log=$(find "$LOG_BASE" -type f -name "*scheduler*.log" | head -1 || true)
  fi

  if [[ -n "${sched_log:-}" && -f "$sched_log" ]]; then
    info "- **Scheduler Log File:** $sched_log"
    # Check for any "zombie" mentions or errors in scheduler log
    local zombie_hits err_hits
    zombie_hits=$(grep -ic "zombie" "$sched_log" || true)
    err_hits=$(grep -ic "ERROR" "$sched_log" || true)
    info "  - Occurrences of 'zombie' in log: $zombie_hits"
    info "  - Occurrences of 'ERROR' in log: $err_hits"
    if (( zombie_hits > 0 )); then
      summary_observations+=("Scheduler log shows $zombie_hits zombie incidents")
      summary_actions+=("Examine scheduler logs & tune heartbeat settings (zombie detection) to mitigate repeats")
    fi
    # Include last ~30 lines of scheduler log for context
    info "\n**Recent Scheduler Log Entries (last 30 lines):**"
    info '```'
    tail -n 30 "$sched_log" | tee -a "$REPORT_FILE"
    info '```'
  else
    err "- Scheduler log file not found in $LOG_BASE"
  fi

  # If there’s a frequently failing task (to be identified in DB queries), show its log snippet
  if [[ -n "${top_fail_dag:-}" && -n "${top_fail_task:-}" ]]; then
    local task_log
    # Find the latest log file for that task (assuming logs organized by dag_id/task_id/execution_date)
    task_log=$(find "$LOG_BASE/$top_fail_dag/$top_fail_task" -type f -name "*.log" 2>/dev/null | sort | tail -1 || true)
    if [[ -n "$task_log" && -f "$task_log" ]]; then
      info "\n**Sample Task Log:** ${top_fail_dag}.${top_fail_task} (last attempt)"
      info '```'
      tail -n 20 "$task_log" | tee -a "$REPORT_FILE"
      info '```'
    fi
  fi
}

query_db_heartbeat() {
  section "Metadata DB: Scheduler Heartbeat"
  if ! command -v psql &>/dev/null; then
    err "psql command not found. Skipping database queries."
    return
  fi
  # Check latest scheduler job heartbeats (assuming env PGHOST, PGUSER, etc. are set for psql)
  info "- **Recent SchedulerJob Entries (job table):**"
  info '```sql'
  psql -X -A -t -c "SELECT start_date, end_date, state, ROUND(EXTRACT(EPOCH FROM (now() - latest_heartbeat))::numeric,1) AS \"seconds_since_last_heartbeat\" 
FROM job 
WHERE job_type='SchedulerJob' 
ORDER BY start_date DESC 
LIMIT 3;" | tee -a "$REPORT_FILE"
  info '```'
  # Analyze scheduler state from the query results (simple heuristic)
  local last_gap
  last_gap=$(psql -X -A -t -c "SELECT EXTRACT(EPOCH FROM (now() - MAX(latest_heartbeat))) FROM job WHERE job_type='SchedulerJob';")
  last_gap=${last_gap%%.*}  # integer part
  if [[ -n "$last_gap" ]]; then
    if (( last_gap > 60 )); then
      err "  - ⚠️ Last scheduler heartbeat was ${last_gap}s ago."
      summary_observations+=("Scheduler heartbeat delay (${last_gap}s since last heartbeat)")
      summary_actions+=("Scheduler may be stalled or down – check scheduler logs and resource usage:contentReference[oaicite:9]{index=9}")
    else
      info "  - Scheduler heartbeat is recent (${last_gap}s ago)."
    end
  fi
}

query_db_tasks() {
  section "Metadata DB: Task Failure Patterns"
  # Top failing DAGs in last 7 days
  info "**Top 5 DAGs by failed task count (last 7 days):**"
  info '| DAG ID | Failed Tasks |'
  info '|--------|--------------|'
  psql -X -A -F '|' -t -c "SELECT dag_id, count(*) AS failures 
FROM task_instance 
WHERE state='failed' AND execution_date > now() - interval '7 days' 
GROUP BY dag_id 
ORDER BY failures DESC 
LIMIT 5;" | while IFS='|' read -r dag fail_count; do
    [[ -z "$dag" ]] && continue
    info "| \`${dag}\` | ${fail_count} |"
    # capture top failing DAG for log snippet
    if [[ -z "${top_fail_dag:-}" ]]; then
      top_fail_dag="$dag"
    fi
  done

  # Frequent task failures (individual task level)
  info "\n**Top 5 Task instances by failure count (last 7 days):**"
  info '| DAG ID | Task ID | Failures |'
  info '|--------|---------|----------|'
  psql -X -A -F '|' -t -c "SELECT dag_id, task_id, count(*) AS failures 
FROM task_instance 
WHERE state='failed' AND execution_date > now() - interval '7 days' 
GROUP BY dag_id, task_id 
ORDER BY failures DESC 
LIMIT 5;" | while IFS='|' read -r dag task fail_count; do
    [[ -z "$dag" ]] && continue
    info "| \`${dag}\` | \`${task}\` | ${fail_count} |"
    # capture top failing task (for log analysis)
    if [[ -z "${top_fail_task:-}" && "$dag" == "$top_fail_dag" ]]; then
      top_fail_task="$task"
    fi
  done

  # Failures by hour of day (trend)
  info "\n**Failure Count by Hour of Day (last 7 days):**"
  info '| Hour (0-23) | Failed Tasks |'
  info '|-------------|--------------|'
  local hour_failures
  hour_failures=$(psql -X -A -F '|' -t -c "SELECT EXTRACT(HOUR FROM execution_date) AS hr, count(*) 
FROM task_instance 
WHERE state='failed' AND execution_date > now() - interval '7 days' 
GROUP BY hr ORDER BY hr;")
  if [[ -z "$hour_failures" ]]; then
    info "| _No failures in timeframe_ |  |"
  else
    local max_hour="" max_fail=0
    while IFS='|' read -r hr fails; do
      info "| $hr | $fails |"
      if (( fails > max_fail )); then
        max_fail=$fails; max_hour=$hr;
      fi
    done <<< "$hour_failures"
    # Note potential peak hour for summary
    if [[ -n "$max_hour" ]]; then
      summary_observations+=("Failures peak around hour $max_hour (past week)")
      summary_actions+=("Investigate load or issues at ~$max_hour:00 (high failure rate time)")
    fi
  fi

  # Identify any tasks with multiple retry attempts (flaky tasks)
  info "\n**Tasks with Retries > 0 (flaky tasks in last 7 days):**"
  info '| DAG ID | Task ID | Max Attempts |'
  info '|--------|---------|--------------|'
  psql -X -A -F '|' -t -c "SELECT dag_id, task_id, MAX(try_number) AS max_try 
FROM task_instance 
WHERE execution_date > now() - interval '7 days' 
GROUP BY dag_id, task_id 
HAVING MAX(try_number) > 1 
ORDER BY max_try DESC 
LIMIT 5;" | while IFS='|' read -r dag task max_try; do
    [[ -z "$dag" ]] && continue
    info "| \`${dag}\` | \`${task}\` | ${max_try} |"
  done
}

generate_summary() {
  section "Summary (Observations & Recommendations)"
  info "| **Observation** | **Recommended Action** |"
  info "|-----------------|------------------------|"
  local count=${#summary_observations[@]}
  if (( count == 0 )); then
    info "| _No significant issues detected_ | _No action required_ |"
  else
    for i in "${!summary_observations[@]}"; do
      info "| ${summary_observations[i]} | ${summary_actions[i]} |"
    done
  fi
}

# Main Script Execution
summary_observations=()
summary_actions=()
info "# Airflow Debug Report - $(date)"
info "*(Environment: $(hostname), $(date))*"
collect_system_metrics
collect_supervisor_status
query_db_heartbeat
query_db_tasks
collect_logs
generate_summary

# End of script
