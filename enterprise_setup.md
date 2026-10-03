# Enterprise setup prompt - Fabric Platform Brain

How to use it: create an empty folder with no spaces in its path, for example `C:\work\fabric-brain` or `~/work/fabric-brain`. Open Claude Code there and paste everything below the line as your first message. Claude builds the project, then hands you three commands to run. Nothing in this prompt connects to Azure, Fabric, Power BI or Git.

---

You are setting up **Fabric Platform Brain** in the current, empty folder. It is a Claude Code project for one senior data engineer working on an enterprise, multi-tenant Azure + Microsoft Fabric lakehouse that the team deploys with Terraform. The project is a **read-only advisor**: learn, recall, quiz, validate claims, review architecture, Terraform and code, capture meetings, documents and discussions, and challenge decisions against multi-tenant, enterprise and production-grade standards. Claude never runs anything; the user runs every step.

## Non-negotiable rules for you while building
1. **Company configuration first.** The company's Claude configuration (managed settings, approved connectors, permissions) always wins. Never override it, loosen it or work around it. If something below conflicts with it, stop and tell me; don't improvise.
2. **No connections to Fabric, Azure, Power BI or Git.** Don't call their connectors, plugins, CLIs or APIs. Don't run `git` at all, don't commit, and don't fetch anything from the internet to build this project.
3. **Create the files exactly as given** in the File manifest: same paths, same content. Change only what the "Adapt" section names. The hooks and settings are security controls; don't "improve" them.
4. **Don't run the tools yourself.** When the files exist, give me the commands in section "Hand-over" and stop.

## Step 1 - ask me first (one AskUserQuestion call, 4 questions at most)
1. **Shell:** Windows Command Prompt, or bash (WSL / Linux / macOS)?
2. **Infra repo paths** Claude may read (read-only), or "none yet".
3. **Internal names to keep out of web searches:** company DNS suffixes (e.g. `corp.example.com`) and code names or tenant aliases (lower-case). "None" is fine.
4. **Fabric library source:** (a) I'll download the public ZIP of github.com/microsoft/skills-for-fabric in my browser and extract it; (b) the `fabric-skills` plugin is already installed by my company; (c) skip the library for now.

Also check, read-only, whether a company managed-settings file exists. Windows: `C:\Program Files\ClaudeCode\managed-settings.json`. Linux/WSL: `/etc/claude-code/managed-settings.json`. macOS: `/Library/Application Support/ClaudeCode/managed-settings.json`. If you can read it, look for:
- `allowManagedHooksOnly: true` - the project hooks won't run. Tell me: the permission deny rules still apply, but the canary will warn every session, so I need IT to approve the hooks.
- `disableAllHooks`, or a forced `defaultMode` other than `default` - tell me.
- A denied or force-enabled `fabric-skills` plugin - fine either way; just report it.
If you can't read it, say so and continue.

## Step 2 - Adapt (the only allowed changes)
**If the shell is Windows Command Prompt**, change exactly these strings:
- `CLAUDE.md`, the **Shell.** paragraph becomes: "The user's terminal is Windows Command Prompt (cmd.exe): `set VAR=value`, `%VAR%`, `^` for line continuation, backslash paths. No bash syntax."
- `CLAUDE.md` guardrail 2 and `.claude/output-styles/recall-coach.md`: `RUN THIS YOURSELF (bash)` becomes `RUN THIS YOURSELF (Command Prompt)`, and `<bash commands>` becomes `<cmd.exe commands>`.
- `.claude/agents/tf-reviewer.md`: "(bash syntax;" becomes "(Command Prompt syntax;".
- `.claude/skills/platform-review/references/terraform.md`: "(bash, inside the infra repo;" becomes "(Command Prompt, inside the infra repo;".
- `README.md`: in Setup, use `python` instead of `python3` and backslash paths, and use `start.cmd` instead of `./start.sh`.

**Internal names** (from question 3) go into `.claude/hooks/guard_config.py`: `COMPANY_INTERNAL_SUFFIXES = ("corp.example.com",)` and `INTERNAL_TERMS = ("codename",)`. Leave both empty if the answer was none.

**Leave alone:** the `{{PYTHON}}`, `{{PROJECT_DIR}}`, `{{INFRA_REPO_DIR}}` and `{{INFRA_REPO_POSIX}}` placeholders in `.claude/settings.json`. `tools/setup_paths.py` fills them on the user's machine.

**Empty files to create:** `inbox/.gitkeep`, `kb/meetings/.gitkeep`, `kb/templates/.gitkeep`, `kb/sources/.gitkeep`.

## Step 3 - Hand-over (print this, adapted to the shell, then stop)
```
RUN THIS YOURSELF - Risk: LOCAL CHANGE
python3 tools/setup_paths.py --infra <infra repo path>                          (omit --infra if none yet)
python3 tools/sync_fabric_library.py --source <extracted skills-for-fabric folder>   (option a; option b: no --source; option c: skip)
python3 tools/selftest.py
./start.sh                                                                       (Windows: start.cmd)
Expect: selftest ends "All NN checks passed". With option c, the two library checks fail until you sync.
Then: accept the trust prompt, check the KB-GUARD ACTIVE banner, run /bootstrap.
```
Explain the important points in five lines or fewer:
- The project disables the `fabric-skills` plugin, because its MCP servers fetch Azure tokens and its skills call Fabric APIs. It learns from the offline `library/` instead.
- Never choose "continue without" on a Settings Error dialog; that drops every guard.
- If the plugin is installed at user level, it still connects in other folders. Disabling it there is the user's choice.

## What the project contains (for your orientation; the manifest is authoritative)
- **Guardrails:** `CLAUDE.md` (always loaded), plus `.claude/settings.json` deny rules:
  - no shell, PowerShell, MCP to Fabric, Power BI or GitHub, or outbound publishing tools
  - Azure, Entra, Fabric and Power BI domains denied; secret files denied; config and infra repo read-only
  - Manual mode; auto and bypass modes disabled
- **Hooks:** Python standard library only.
  - `guard_tools.py` checks every tool call and fails closed.
  - `guard_prompt.py` blocks prompts that contain secrets and restates policy every turn.
  - `session_start.py` shows the banner and KB state.
  - `kb_lint.py` enforces KB caps and frontmatter.
  - `statusline.py` shows the status line.
- **KB in `kb/`:** the only place Claude writes, after approval. Concept cards use Leitner spaced repetition. Also ADRs, meeting and source digests, and claims, lessons, open-items and findings registers.
- **26 commands:**
  - Learning: /teach /recall /quiz /capture /correct /validate /visual /cheatsheet /gaps /wrap
  - Reviews: /review-tf /review-arch /platform-check /bootstrap /adr
  - Notes and decisions: /meeting /doc /note /challenge /decisions
  - Fabric library: /fabric /map /review-code /lab /size /path
- **Skills:** teaching-method, visual-explain, claim-check, platform-review (architecture, terraform, design-patterns rubrics), kb-conventions, fabric-library.
- **Read-only subagents:** tf-reviewer, arch-reviewer, claim-checker, meeting-scribe, fabric-librarian, decision-challenger.
- **Tools the user runs:** `setup_paths.py`, `sync_fabric_library.py` (local copy only, scripts stripped) and `selftest.py` (51 checks).

## File manifest - create every file below exactly

### `CLAUDE.md`
````markdown
# Fabric Platform Brain - operating rules

You are the learning, recall, review and knowledge-capture assistant for one engineer working on an enterprise, multi-tenant Azure + Microsoft Fabric lakehouse that the team deploys with Terraform. You advise. You never build or run anything.

## 0. Guardrails - non-negotiable, check them before EVERY response

### BLOCKED: Fabric, Azure, Power BI and Git - the top rule
1. **Company configuration first.** The company's Claude configuration (managed settings, approved connectors and permissions) always applies. Never override it, loosen it or work around it.
2. **Never connect to Fabric, Azure, Power BI or Git, not even read-only.** This covers Microsoft Fabric/OneLake, Azure, Entra ID, Power BI, Azure DevOps, GitHub, GitLab and Bitbucket. Never call their connectors, MCP tools, plugins (`fabric-skills:*` is disabled; Fabric knowledge comes from the offline `library/`), APIs, portals or login endpoints. Never use a URL that carries a token, key or signature.
3. **Never commit or push code.** Never run `git` (Bash is denied) or edit any repo. Code changes are snippets the user applies on a branch and raises as a merge request themselves.
4. **Don't hand these connections to the user either.** RUN THIS YOURSELF blocks never contain `az`, `fab`, `sqlcmd`, PowerShell Az, Power BI or Fabric REST calls, `terraform plan/apply/import/refresh` or a backend `init`, `git clone/fetch/pull/push/commit`, `gh` or `glab`. Explain what such a step does instead.
5. **Allowed:** reading local files, anonymous public documentation lookups with generalised queries, and code the user types into their own notebook or editor (PySpark, SQL, KQL, DAX, M). If a task seems to need one of the blocked services, stop and say so. Never look for a workaround.

### Other guardrails
1. **No execution.** Never run, schedule or delegate commands, scripts, terraform, az, PowerShell or git - not directly, and not through subagents, skills or workflows. Those tools are denied in settings and blocked by hooks.
2. **The user runs every step.** When something must be run, write a block headed `RUN THIS YOURSELF (bash)` with a risk label (READ-ONLY / LOCAL CHANGE / DESTRUCTIVE), the exact local commands, then `Expect:`, `Verify:` and, where relevant, `Undo:`. Wait for the pasted output. Never say or imply that you ran it.
3. **Web is anonymous lookup only.** Before any WebSearch or WebFetch, strip internal names, hostnames, IPs, subscription/tenant/workspace IDs, people and code. Ask the general question.
4. **Write only under `kb/`, and only after approval.** The infra repo(s) are read-only. Never edit `.claude/`, `CLAUDE.md`, `README.md`, `library/`, `inbox/` or `tools/`. Suggest code changes as snippets the user applies in a merge request.
5. **No secrets.** Don't open state files, `.terraform/`, tfvars, keys or credential stores. If a secret appears anywhere, stop, tell the user to rotate it, and never repeat it.

**Canary.** Hooks add a `KB-GUARD ACTIVE` note at session start and on every user turn. If it is missing, start your reply with one line - `WARNING: KB-GUARD hooks not detected - check the Python path in .claude/settings.json (README > Troubleshooting)` - and stay in explain-only mode.

**Shell.** The user's terminal is bash in WSL Ubuntu: `export VAR=value`, `$VAR`, `\` for line continuation, forward-slash paths. Use Command Prompt syntax only if the user says they are on Windows cmd.

## 1. Who you are working with
Senior data engineer/architect. Deep on-prem stack: Spark, Iceberg, Nessie, Kubernetes, StorageGRID, Vault, Keycloak, PostgreSQL, Airflow, Starburst/Trino. Newer to Azure, Microsoft Fabric and agentic AI. Understands concepts while reading but forgets or misapplies them later - so optimise for recall at the moment of need, not for coverage.
Platform facts live in `kb/platform.md`. If it still says "TODO: run /bootstrap", suggest `/bootstrap` once.

## 2. Roles
Coach (teach, recall, quiz, labs, learning paths) - Skeptic (validate claims, correct misunderstandings) - Reviewer (architecture, Terraform, platform) - Scribe (capture meetings, documents and discussions; ADRs). Challenger (stress-test decisions against multi-tenant, enterprise, production-grade, configurable design - constructively, with better alternatives). Advisor only, never the builder.

## 3. How to answer
- Answer or verdict first. Plain words; expand every acronym once.
- Anchor new Azure/Fabric ideas to the on-prem equivalent and say where the analogy breaks (`teaching-method` skill).
- Label what is not settled fact: OUR DECISION (ADR-NNNN), OPINION, ASSUMPTION, UNVERIFIED. Fast-moving specifics (preview/GA status, limits, SKUs, regions, provider resource names) need a source and a checked date, or the UNVERIFIED label (`claim-check` skill).
- When the user, a meeting or a document is wrong or incomplete, open with `CORRECTION:` - specific and kind - then offer to log it.
- Challenge decisions by default: if a decision in any input is weak on multi-tenancy, configurability, production readiness or decision quality, say so with a better option, even when not asked. Steelman first; never just agree.
- Fabric specifics come from `library/` first (cite `library/<path>:<line>`), then Microsoft Learn for anything fast-moving. Map them to the on-prem stack.
- Diagrams only on request (`/visual`, or the words diagram, visual, mind map, draw). Then give Mermaid code plus a detailed walkthrough (`visual-explain` skill).
- Default length: recall 12 lines or fewer; teaching about one screen; go deeper only when asked.

## 4. Continuity - check the KB first
Before answering a platform or concept question, Grep `kb/` for the topic and its synonyms and build on what is there. Link cards as [[slug]] and decisions as ADR-NNNN. If the KB contradicts current docs, say so and propose the fix.

## 5. Knowledge base map - one topic, one home
| Path | Holds | Cap |
|---|---|---|
| `kb/platform.md` | tenancy model, environments, repos, identity, network, Fabric, CI/CD, conventions | 80 lines |
| `kb/concepts/<slug>.md` | one recall card per concept | 45 lines (saved diagram excluded) |
| `kb/decisions/ADR-NNNN-<slug>.md` | architecture decisions | 70 lines |
| `kb/meetings/YYYY-MM-DD-<type>-<topic>.md` | meeting digests, never raw transcripts | 40 lines |
| `kb/sources/YYYY-MM-DD-<document\|discussion>-<topic>.md` | document and discussion digests, never pasted text | 40 lines |
| `kb/claims.md` | claims and verdicts (no person names) | table |
| `kb/lessons.md` | the user's corrected misconceptions | table |
| `kb/open.md` | questions, risks, actions, verify-later items | table |
| `kb/findings.md` | review findings and decision challenges (F-DEC-NN) | table |
| `library/` | Microsoft skills-for-fabric snapshot - reference, never written | read-only |

Update in place; never create a second file for a topic that already has one. Formats and templates: `kb-conventions` skill. A PostToolUse hook lints caps and frontmatter.

## 6. Commands
/teach /recall /quiz /capture /correct /validate /visual /adr /meeting /cheatsheet /gaps /review-tf /review-arch /platform-check /bootstrap /wrap
Fabric library: /fabric /map /review-code /lab /size /path
Notes and decisions: /doc /note /challenge /decisions

## 7. Delegation
Heavy reading goes to subagents so this conversation stays small: `tf-reviewer` (Terraform), `arch-reviewer` (designs), `claim-checker` (sourced verdicts), `meeting-scribe` (notes to KB plan), `fabric-librarian` (library research, cited), `decision-challenger` (verdicts and better alternatives). They return results; only this conversation writes to `kb/`, after the user approves.
````

### `.claude/settings.json`
````json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "outputStyle": "Recall Coach",
  "autoMemoryEnabled": false,
  "enableArtifact": false,
  "disableSkillShellExecution": true,
  "enableAllProjectMcpServers": false,
  "enabledPlugins": {
    "fabric-skills@fabric-collection": false
  },
  "disableAllHooks": false,
  "permissions": {
    "defaultMode": "default",
    "disableBypassPermissionsMode": "disable",
    "disableAutoMode": "disable",
    "additionalDirectories": [
      "{{INFRA_REPO_DIR}}"
    ],
    "allow": [
      "WebSearch",
      "WebFetch(domain:learn.microsoft.com)",
      "WebFetch(domain:techcommunity.microsoft.com)",
      "WebFetch(domain:azure.microsoft.com)",
      "WebFetch(domain:blog.fabric.microsoft.com)",
      "WebFetch(domain:roadmap.fabric.microsoft.com)",
      "WebFetch(domain:registry.terraform.io)",
      "WebFetch(domain:developer.hashicorp.com)",
      "WebFetch(domain:github.com)",
      "WebFetch(domain:raw.githubusercontent.com)",
      "WebFetch(domain:azure.github.io)",
      "WebFetch(domain:microsoft.github.io)",
      "WebFetch(domain:docs.gitlab.com)",
      "WebFetch(domain:delta.io)",
      "WebFetch(domain:iceberg.apache.org)"
    ],
    "deny": [
      "Bash",
      "PowerShell",
      "Monitor",
      "Workflow",
      "NotebookEdit",
      "CronCreate",
      "ScheduleWakeup",
      "RemoteTrigger",
      "Artifact",
      "ShareOnboardingGuide",
      "SendUserFile",
      "PushNotification",
      "SendMessage",
      "EnterWorktree",
      "ListMcpResourcesTool",
      "ReadMcpResourceTool",
      "ArtifactComments",
      "ArtifactData",
      "DesignSync",
      "ListAgents",
      "mcp__plugin_fabric-skills_FabricIQ",
      "mcp__plugin_fabric-skills_powerbi-modeling-mcp",
      "mcp__plugin_fabric-skills_fabric-sqlendpoint",
      "mcp__plugin_engineering_github",
      "Agent(isolation:worktree)",
      "Agent(fabric-skills:FabricAdmin)",
      "Agent(fabric-skills:FabricAppDev)",
      "Agent(fabric-skills:FabricDataEngineer)",
      "Agent(fabric-skills:FabricIQ)",
      "WebFetch(domain:azure.com)",
      "WebFetch(domain:*.azure.com)",
      "WebFetch(domain:azure.net)",
      "WebFetch(domain:*.azure.net)",
      "WebFetch(domain:windows.net)",
      "WebFetch(domain:*.windows.net)",
      "WebFetch(domain:*.microsoftonline.com)",
      "WebFetch(domain:graph.microsoft.com)",
      "WebFetch(domain:api.fabric.microsoft.com)",
      "WebFetch(domain:app.fabric.microsoft.com)",
      "WebFetch(domain:*.dfs.fabric.microsoft.com)",
      "WebFetch(domain:*.blob.fabric.microsoft.com)",
      "WebFetch(domain:*.datawarehouse.fabric.microsoft.com)",
      "WebFetch(domain:*.kusto.fabric.microsoft.com)",
      "WebFetch(domain:*.powerbi.com)",
      "WebFetch(domain:*.visualstudio.com)",
      "WebFetch(domain:*.azurewebsites.net)",
      "WebFetch(domain:*.azure-api.net)",
      "WebFetch(domain:*.azurecr.io)",
      "WebFetch(domain:*.loganalytics.io)",
      "WebFetch(domain:*.applicationinsights.io)",
      "WebFetch(domain:*.cloud.microsoft)",
      "WebFetch(domain:*.analysis.windows.net)",
      "Read(//**/*.tfstate)",
      "Read(//**/*.tfstate.*)",
      "Read(//**/.terraform/**)",
      "Read(//**/*.tfvars)",
      "Read(//**/*.tfvars.json)",
      "Read(//**/.env)",
      "Read(//**/.env.*)",
      "Read(//**/*.pem)",
      "Read(//**/*.pfx)",
      "Read(//**/*.p12)",
      "Read(//**/*.key)",
      "Read(~/.azure/**)",
      "Read(~/.ssh/**)",
      "Read(~/.git-credentials)",
      "Read(~/AppData/Roaming/terraform.d/**)",
      "Read(~/AppData/Roaming/terraform.rc)",
      "Edit(/.claude/**)",
      "Edit(/CLAUDE.md)",
      "Edit(/README.md)",
      "Edit(/COPILOT-PROMPT.md)",
      "Edit(/start.cmd)",
      "Edit(/start.sh)",
      "Edit(/library/**)",
      "Edit(/inbox/**)",
      "Edit(/tools/**)",
      "Edit(//{{INFRA_REPO_POSIX}}/**)"
    ]
  },
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "{{PYTHON}}",
            "args": [
              "${CLAUDE_PROJECT_DIR}/.claude/hooks/session_start.py"
            ],
            "timeout": 15
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "{{PYTHON}}",
            "args": [
              "${CLAUDE_PROJECT_DIR}/.claude/hooks/guard_prompt.py"
            ],
            "timeout": 10
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "{{PYTHON}}",
            "args": [
              "${CLAUDE_PROJECT_DIR}/.claude/hooks/guard_tools.py"
            ],
            "timeout": 10
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "{{PYTHON}}",
            "args": [
              "${CLAUDE_PROJECT_DIR}/.claude/hooks/kb_lint.py"
            ],
            "timeout": 10
          }
        ]
      }
    ]
  },
  "statusLine": {
    "type": "command",
    "command": "{{PYTHON}} {{PROJECT_DIR}}/.claude/hooks/statusline.py",
    "padding": 0
  }
}
````

### `.claude/hooks/guard_config.py`
````python
"""Shared policy for the KB-GUARD hooks. Edit the lists here, not in the hook scripts.

Standard library only. Works on Windows (Command Prompt) and Linux/macOS.
"""
import os
import re
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parents[2]
KB_DIR = PROJECT_DIR / "kb"
SETTINGS_FILE = PROJECT_DIR / ".claude" / "settings.json"
LIBRARY_DIR = PROJECT_DIR / "library"  # offline Microsoft skills-for-fabric snapshot, read-only

# The fabric-skills plugin drives live Fabric/Power BI endpoints (az/fab CLI, MCP servers that fetch
# Azure tokens). It is disabled for this project; its knowledge is used offline from library/.
# Company Claude configuration (managed settings, approved connectors) governs everything else.
# On top of it this project blocks every connection to Fabric, Azure, Power BI and Git hosting.
PLUGINS_OFF = ("fabric-skills@fabric-collection",)
BLOCKED_AGENT_PREFIXES = ("fabric-skills:",)
# MCP tools whose server or tool name contains one of these words are blocked (split on _ - and .).
BLOCKED_SERVICE_WORDS = {
    "fabric", "fabriciq", "onelake", "powerbi", "pbi", "kusto", "synapse",
    "azure", "az", "entra", "arm", "devops", "azdo", "ado",
    "git", "github", "gitlab", "bitbucket", "githubcopilot",
}
# Skills that exist to work with Git hosting (commits, PRs) through a connector.
BLOCKED_SKILLS = {"engineering:standup", "standup"}
# Query parameters that carry credentials: a URL with one would act on someone's account.
CREDENTIAL_PARAM_RE = re.compile(
    r"(?i)[?&#](access_token|id_token|refresh_token|token|api[_-]?key|apikey|auth|code|client_secret|password|sig|signature|session)="
)

# Claude may create or edit files only inside these folders.
WRITABLE_DIRS = [KB_DIR]

# Tools that run code, schedule autonomous work, or push data off the laptop.
BLOCKED_TOOLS = {
    "Bash", "PowerShell", "Monitor", "Workflow", "NotebookEdit",
    "CronCreate", "ScheduleWakeup", "RemoteTrigger",
    "Artifact", "ShareOnboardingGuide", "SendUserFile", "PushNotification", "SendMessage",
    "EnterWorktree", "ListMcpResourcesTool", "ReadMcpResourceTool",
    "ArtifactComments", "ArtifactData", "DesignSync", "ListAgents",
}
# Unknown or future tools whose names contain one of these fragments are treated as execution-capable.
BLOCKED_NAME_FRAGMENTS = ("bash", "shell", "exec", "terminal", "command", "computer", "browser")

WRITE_TOOLS = {"Write", "Edit", "MultiEdit", "NotebookEdit"}
READ_TOOLS = {"Read", "Grep", "Glob", "LSP"}

# Azure, Entra, Fabric and Power BI control-plane, data-plane, login and portal hosts (suffix match).
BLOCKED_HOST_SUFFIXES = (
    "azure.com", "azure.net", "windows.net", "microsoftonline.com", "microsoftonline-p.com",
    "graph.microsoft.com", "fabric.microsoft.com", "powerbi.com",
    "azurewebsites.net", "azure-api.net", "azurecr.io", "azuredatabricks.net", "azuresynapse.net",
    "azurefd.net", "azurehdinsight.net", "azure-devices.net", "azmk8s.io",
    "loganalytics.io", "applicationinsights.io", "visualstudio.com",
    "cloud.microsoft", "analysis.windows.net", "kusto.windows.net", "azuresynapse.net",
)
# Public documentation sites that sit under a blocked suffix.
DOCS_HOST_EXCEPTIONS = (
    "blog.fabric.microsoft.com", "roadmap.fabric.microsoft.com", "community.fabric.microsoft.com",
)
# Never fetch internal hosts. Add your company's internal DNS suffixes, e.g. "corp.example.com".
INTERNAL_HOST_SUFFIXES = ("local", "internal", "corp", "lan", "intranet", "home.arpa")
COMPANY_INTERNAL_SUFFIXES = ()
# Lower-case words that must never leave the laptop in a search query or URL
# (project code names, internal product names, subscription aliases). Example: ("falcon", "tenant-x")
INTERNAL_TERMS = ()

GUID_RE = re.compile(r"\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b")

SECRET_PATTERNS = [
    (re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"), "private key"),
    (re.compile(r"(?i)AccountKey=[A-Za-z0-9+/=]{20,}"), "storage account key"),
    (re.compile(r"(?i)SharedAccessKey=[A-Za-z0-9+/=]{20,}"), "shared access key"),
    (re.compile(r"(?i)[?&]sig=[A-Za-z0-9%+/=]{20,}"), "SAS signature"),
    (re.compile(r"[A-Za-z0-9_~.]{3}\dQ~[A-Za-z0-9_~.\-]{31,34}"), "Entra client secret"),
    (re.compile(r"(?i)client[_-]?secret\s*[:=]\s*[\"']?[A-Za-z0-9_~.\-]{16,}"), "client secret"),
    (re.compile(r"(?i)password\s*[:=]\s*[\"'][^\"'\s]{8,}[\"']"), "password"),
    (re.compile(r"glpat-[A-Za-z0-9_\-]{20,}"), "GitLab token"),
    (re.compile(r"gh[pousr]_[A-Za-z0-9]{36,}"), "GitHub token"),
    (re.compile(r"eyJ[A-Za-z0-9_\-]{10,}\.eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}"), "access token (JWT)"),
    (re.compile(r"xox[baprs]-[A-Za-z0-9\-]{10,}"), "Slack token"),
]

# Files Claude must never open, matched against a lower-case, forward-slash absolute path.
# Set ALLOW_TFVARS = True only if your tfvars hold no secrets or IDs, and also delete the two
# "Read(//**/*.tfvars...)" deny rules in .claude/settings.json.
ALLOW_TFVARS = False
SECRET_PATH_PATTERNS = [
    "*.tfstate", "*.tfstate.*", "*/.terraform/*",
    "*/.env", "*/.env.*", "*.pem", "*.pfx", "*.p12", "*.key", "*.kdbx",
    "*/.azure/*", "*/.ssh/*", "*/.git-credentials", "*/terraform.d/*", "*/terraform.rc", "*/.terraformrc",
]
if not ALLOW_TFVARS:
    SECRET_PATH_PATTERNS += ["*.tfvars", "*.tfvars.json"]

# The same idea for glob patterns passed to Glob/Grep.
SECRET_GLOB_RE = re.compile(
    r"\.tfstate|(^|[/\\])\.terraform([/\\]|$)|(^|[/\\])\.env(\.|$)|\.pem$|\.pfx$|\.p12$|\.key$"
    r"|(^|[/\\])\.(azure|ssh)([/\\]|$)|git-credentials|terraform\.(rc|d)"
    + ("" if ALLOW_TFVARS else r"|\.tfvars"),
    re.IGNORECASE,
)

POLICY_LINE = (
    "advisor-only session - no command execution (the user runs every step, local commands only); "
    "no connection to Fabric, Azure, Power BI or Git hosting and no git commits or pushes - by Claude or through "
    "commands it suggests; everything else follows the company Claude configuration; "
    "Azure and Fabric endpoints are blocked; web access is pull-only for public documentation with "
    "generalised queries; writes happen only under kb/ after user approval; technical claims carry a "
    "source and checked date or the UNVERIFIED label; the fabric-skills plugin is off - Fabric knowledge "
    "comes from the offline library/ (fabric-library skill), and its CLI/REST/MCP steps are explained, "
    "never run or handed over as commands"
)


def norm_path(path):
    """Absolute, symlink-resolved, case-normalised path (lower-case backslashes on Windows)."""
    return os.path.normcase(os.path.realpath(os.path.abspath(str(path))))


def is_within(child, parent):
    c, p = norm_path(child), norm_path(parent)
    try:
        return os.path.commonpath([c, p]) == p
    except ValueError:  # different drives on Windows
        return False
````

### `.claude/hooks/guard_prompt.py`
````python
#!/usr/bin/env python3
"""KB-GUARD UserPromptSubmit hook.

Blocks a prompt that contains a secret (without echoing it back). Otherwise prints the guardrail note,
which Claude Code adds to Claude's context for this turn - the "before every response" check.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import guard_config as cfg  # noqa: E402


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    try:
        data = json.loads(sys.stdin.buffer.read().decode("utf-8", errors="replace") or "{}")
        prompt = data.get("prompt") or ""
    except Exception:
        prompt = ""
    for rx, kind in cfg.SECRET_PATTERNS:
        if rx.search(prompt):
            print(json.dumps({
                "decision": "block",
                "reason": (
                    f"KB-GUARD: this prompt looks like it contains a secret ({kind}). Remove or mask it and send again. "
                    "If it is a real credential, rotate it - the text may remain in local prompt history."
                ),
                "hookSpecificOutput": {"hookEventName": "UserPromptSubmit", "suppressOriginalPrompt": True},
            }))
            return 0
    print(f"KB-GUARD ACTIVE (turn). Project policy for this turn: {cfg.POLICY_LINE}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
````

### `.claude/hooks/guard_tools.py`
````python
#!/usr/bin/env python3
"""KB-GUARD PreToolUse hook.

Enforces: no execution, no Azure/Fabric connectivity, pull-only public web, writes only under kb/,
no secret files, no secrets or IDs leaving the laptop.
Exit 2 blocks the tool call and shows the reason to Claude. Any unexpected error also blocks (fail closed).
"""
import fnmatch
import ipaddress
import json
import os
import re
import sys
from urllib.parse import urlparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import guard_config as cfg  # noqa: E402


class Blocked(Exception):
    pass


def _host_matches(host, suffix):
    return host == suffix or host.endswith("." + suffix)


def check_text(text, what):
    if not text:
        return
    if cfg.GUID_RE.search(text):
        raise Blocked(f"{what} contains a GUID (tenant, subscription or workspace ID?). Generalise it and retry.")
    for rx, kind in cfg.SECRET_PATTERNS:
        if rx.search(text):
            raise Blocked(f"{what} appears to contain a secret ({kind}). Secrets must never leave the laptop.")
    low = text.lower()
    for term in cfg.INTERNAL_TERMS:
        if term and term.lower() in low:
            raise Blocked(f"{what} contains the internal term '{term}'. Generalise it and retry.")
    for suffix in cfg.COMPANY_INTERNAL_SUFFIXES:
        if suffix and suffix.lower() in low:
            raise Blocked(f"{what} mentions an internal domain. Generalise it and retry.")


def check_url(url):
    u = urlparse(url or "")
    if u.scheme not in ("http", "https"):
        raise Blocked("Only http(s) documentation URLs may be fetched.")
    if u.username or u.password:
        raise Blocked("URLs with embedded credentials are not allowed.")
    if cfg.CREDENTIAL_PARAM_RE.search(url or ""):
        raise Blocked("The URL carries a token or key parameter - that acts on an account. Only anonymous public lookups are allowed.")
    host = (u.hostname or "").lower().rstrip(".")
    if not host or "." not in host or host == "localhost":
        raise Blocked("Local or internal hosts are not allowed (pull-only public documentation).")
    try:
        ipaddress.ip_address(host)
        is_ip = True
    except ValueError:
        is_ip = False
    if is_ip:
        raise Blocked("IP-address URLs are not allowed (pull-only public documentation).")
    internal = tuple(cfg.INTERNAL_HOST_SUFFIXES) + tuple(cfg.COMPANY_INTERNAL_SUFFIXES)
    if any(s and _host_matches(host, s.lower()) for s in internal):
        raise Blocked(f"{host} is an internal host. Only public documentation may be fetched.")
    if host not in cfg.DOCS_HOST_EXCEPTIONS and any(_host_matches(host, s) for s in cfg.BLOCKED_HOST_SUFFIXES):
        raise Blocked(
            f"{host} is an Azure/Entra/Fabric endpoint and all Azure and Fabric connectivity is blocked. "
            "Use public documentation (learn.microsoft.com) or give the user a command to run."
        )
    check_text(url, "URL")


def check_write(tool, ti):
    path = ti.get("file_path") or ti.get("notebook_path") or ""
    if not path:
        raise Blocked(f"{tool} called without a file path.")
    if not any(cfg.is_within(path, d) for d in cfg.WRITABLE_DIRS):
        raise Blocked(
            f"Writes are allowed only under kb/. Refused: {path}. The infra repo and project config are "
            "read-only - show the user the change as a snippet instead."
        )
    texts = [ti.get("content"), ti.get("new_string")]
    texts += [e.get("new_string") for e in (ti.get("edits") or []) if isinstance(e, dict)]
    for text in texts:
        if not text:
            continue
        for rx, kind in cfg.SECRET_PATTERNS:
            if rx.search(text):
                raise Blocked(f"The new text contains a secret ({kind}). Remove it - the KB must never store secrets.")


def check_read(tool, ti):
    for key in ("file_path", "path", "notebook_path"):
        value = ti.get(key)
        if not value:
            continue
        p = cfg.norm_path(value).replace("\\", "/").lower()
        for pat in cfg.SECRET_PATH_PATTERNS:
            if fnmatch.fnmatch(p, pat):
                raise Blocked(f"{value} may hold secrets (state, tfvars, keys or credentials) and is off-limits.")
    globs = [ti.get("glob") or ""]
    if tool == "Glob":
        globs.append(ti.get("pattern") or "")
    for g in globs:
        if g and cfg.SECRET_GLOB_RE.search(g):
            raise Blocked(f"The pattern '{g}' targets secret-bearing files (state, tfvars, keys, credentials).")


def decide(data):
    tool = data.get("tool_name") or ""
    ti = data.get("tool_input") or {}
    low = tool.lower()
    if tool in cfg.BLOCKED_TOOLS or any(f in low for f in cfg.BLOCKED_NAME_FRAGMENTS):
        raise Blocked(
            f"'{tool}' can execute or send data out, and this project is advisor-only. "
            "Give the user a 'RUN THIS YOURSELF' block instead (never for Azure/Fabric/Power BI connections)."
        )
    if low.startswith("mcp__"):
        words = set(re.split(r"[_\-.]+", low))
        hit = words & cfg.BLOCKED_SERVICE_WORDS
        if hit:
            raise Blocked(
                f"'{tool}' connects to Fabric, Azure, Power BI or Git ({', '.join(sorted(hit))}); those connections "
                "are blocked in this project. Use library/, public docs, or give the user an explanation."
            )
    if tool == "Agent" and ti.get("isolation"):
        raise Blocked("Subagents may not create git worktrees here.")
    if tool == "Agent" and str(ti.get("subagent_type") or "").startswith(cfg.BLOCKED_AGENT_PREFIXES):
        raise Blocked(
            "fabric-skills agents connect to live Fabric/Power BI. Use the fabric-librarian subagent "
            "(offline library/) instead."
        )
    skill = str(ti.get("skill") or "").lstrip("/")
    if tool == "Skill" and skill.startswith("fabric-skills:"):
        raise Blocked(
            "fabric-skills skills drive live Fabric/Power BI endpoints. Use the fabric-library skill "
            "(offline copy in library/) instead."
        )
    if tool == "Skill" and skill in cfg.BLOCKED_SKILLS:
        raise Blocked(f"The '{skill}' skill works through Git hosting; Git connections are blocked in this project.")
    if tool == "WebFetch":
        check_url(ti.get("url", ""))
    elif tool == "WebSearch":
        check_text(ti.get("query", ""), "Search query")
    elif tool in cfg.WRITE_TOOLS:
        check_write(tool, ti)
    elif tool in cfg.READ_TOOLS:
        check_read(tool, ti)


def main():
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    try:
        raw = sys.stdin.buffer.read().decode("utf-8", errors="replace")
        decide(json.loads(raw or "{}"))
        return 0
    except Blocked as exc:
        sys.stderr.write(f"KB-GUARD blocked this call: {exc}\n")
        return 2
    except Exception as exc:  # fail closed
        sys.stderr.write(
            f"KB-GUARD internal error ({type(exc).__name__}: {exc}); blocked to stay safe. "
            "Ask the user to run: python3 tools/selftest.py\n"
        )
        return 2


if __name__ == "__main__":
    sys.exit(main())
````

### `.claude/hooks/kb_lint.py`
````python
#!/usr/bin/env python3
"""KB-GUARD PostToolUse hook: keeps kb/ small and well-formed (the anti-documentation-overload guard).

Checks line caps (Mermaid blocks excluded), required frontmatter and raw-transcript dumps.
Exit 2 sends the problems back to Claude so it tightens the file. Never blocks on its own errors.
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import guard_config as cfg  # noqa: E402

CAPS = {"concepts": 45, "decisions": 70, "meetings": 40, "sources": 40}
PLATFORM_CAP = 80
REQUIRED = {
    "concepts": ("title", "tags", "box", "next_review", "updated"),
    "decisions": ("id", "title", "status", "date"),
    "meetings": ("date", "type"),
    "sources": ("date", "kind", "title"),
}
SPEAKER_RE = re.compile(r"^\s*(\[?\d{1,2}:\d{2}(:\d{2})?\]?\s*)?[A-Z][A-Za-z0-9.,'\- ]{1,40}:\s+\S")
VTT_RE = re.compile(r"^\s*(<v\s|\d{1,2}:\d{2}(:\d{2})?([.,]\d+)?\s+-->)")


def counted_lines(text):
    lines, in_mermaid = [], False
    for line in text.splitlines():
        s = line.strip()
        if s.startswith("```mermaid"):
            in_mermaid = True
            continue
        if in_mermaid:
            if s.startswith("```"):
                in_mermaid = False
            continue
        lines.append(line)
    return lines


def frontmatter_keys(text):
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    if end == -1:
        return None
    return {
        line.split(":", 1)[0].strip()
        for line in text[3:end].splitlines()
        if ":" in line and not line.startswith((" ", "\t", "-", "#"))
    }


def lint(path):
    if not path.lower().endswith(".md"):
        return []
    rel = os.path.relpath(cfg.norm_path(path), cfg.norm_path(cfg.KB_DIR)).replace("\\", "/")
    kind = rel.split("/", 1)[0] if "/" in rel else ""
    with open(path, encoding="utf-8", errors="replace") as fh:
        text = fh.read()
    problems = []
    lines = counted_lines(text)
    cap = CAPS.get(kind) or (PLATFORM_CAP if rel == "platform.md" else None)
    if cap and len(lines) > cap:
        problems.append(
            f"{rel} has {len(lines)} lines (cap {cap}, Mermaid blocks excluded). "
            "Tighten it: cut words, keep facts, move detail into a linked card."
        )
    if kind in REQUIRED:
        keys = frontmatter_keys(text)
        if keys is None:
            problems.append(f"{rel} needs YAML frontmatter (kb-conventions skill templates).")
        else:
            missing = [k for k in REQUIRED[kind] if k not in keys]
            if missing:
                problems.append(f"{rel} frontmatter is missing: {', '.join(missing)}.")
    speakers = sum(1 for line in lines if SPEAKER_RE.match(line) or VTT_RE.match(line))
    if speakers > 8:
        problems.append(f"{rel} looks like a raw transcript ({speakers} speaker lines). Store a digest instead.")
    return problems


def main():
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    try:
        data = json.loads(sys.stdin.buffer.read().decode("utf-8", errors="replace") or "{}")
        path = (data.get("tool_input") or {}).get("file_path") or ""
        if not path or not os.path.isfile(path) or not cfg.is_within(path, cfg.KB_DIR):
            return 0
        problems = lint(path)
    except Exception:
        return 0  # the lint must never break a session
    if problems:
        sys.stderr.write("KB lint: " + " ".join(problems) + "\n")
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
````

### `.claude/hooks/kb_state.py`
````python
"""Read-only helpers that summarise the knowledge base for the SessionStart hook and the status line."""
import datetime as dt
import json
import re

import guard_config as cfg


def frontmatter(path):
    """Top-level 'key: value' pairs from a Markdown file's YAML frontmatter."""
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return {}
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end == -1:
        return {}
    meta = {}
    for line in text[3:end].splitlines():
        if ":" in line and not line.startswith((" ", "\t", "-", "#")):
            key, value = line.split(":", 1)
            meta[key.strip()] = value.split("#", 1)[0].strip().strip("\"'")
    return meta


def due_cards(today=None):
    """Titles of concept cards whose next_review is today or earlier, oldest first."""
    today = today or dt.date.today()
    due = []
    for path in sorted((cfg.KB_DIR / "concepts").glob("*.md")):
        meta = frontmatter(path)
        try:
            nxt = dt.date.fromisoformat(meta.get("next_review", ""))
        except ValueError:
            continue
        if nxt <= today:
            due.append((nxt, meta.get("title") or path.stem))
    due.sort()
    return [title for _, title in due]


def _rows(name, prefix):
    try:
        lines = (cfg.KB_DIR / name).read_text(encoding="utf-8", errors="replace").splitlines()
    except OSError:
        return []
    rx = re.compile(r"^\|\s*" + re.escape(prefix))
    return [line for line in lines if rx.match(line)]


def counts():
    status_open = re.compile(r"\|\s*open\s*\|", re.IGNORECASE)
    high = re.compile(r"\|\s*(CRITICAL|HIGH)\s*\|")
    return {
        "open_items": sum(1 for r in _rows("open.md", "O-") if status_open.search(r)),
        "unverified_claims": sum(1 for r in _rows("claims.md", "C-") if "UNVERIFIED" in r),
        "open_high_findings": sum(1 for r in _rows("findings.md", "F-") if high.search(r) and status_open.search(r)),
    }


def needs_bootstrap():
    try:
        return "TODO: run /bootstrap" in (cfg.KB_DIR / "platform.md").read_text(encoding="utf-8", errors="replace")
    except OSError:
        return True


def setup_warnings():
    """Problems that weaken the guardrails. Empty list means the setup looks right."""
    try:
        raw = cfg.SETTINGS_FILE.read_text(encoding="utf-8")
        settings = json.loads(raw)
    except Exception as exc:
        return [f".claude/settings.json unreadable ({type(exc).__name__})"]
    warnings = []
    if "{{" in raw:
        warnings.append("placeholders left in .claude/settings.json - run tools/setup_paths.py")
    perms = settings.get("permissions", {})
    deny = set(perms.get("deny", []))
    for rule in ("Bash", "PowerShell", "mcp__plugin_engineering_github", "mcp__plugin_fabric-skills_FabricIQ"):
        if rule not in deny:
            warnings.append(f"deny rule missing: {rule}")
    if perms.get("defaultMode") != "default":
        warnings.append("permissions.defaultMode is not 'default' (Manual)")
    for rule in ("Agent(fabric-skills:FabricIQ)", "Edit(/library/**)"):
        if rule not in deny:
            warnings.append(f"deny rule missing: {rule}")
    for plugin in cfg.PLUGINS_OFF:
        if settings.get("enabledPlugins", {}).get(plugin) is not False:
            warnings.append(f"enabledPlugins must set {plugin} to false")
    local = cfg.SETTINGS_FILE.with_name("settings.local.json")
    if local.is_file():
        warnings.append(".claude/settings.local.json exists - it can re-enable tools, plugins or connectors; delete it")
    if not (cfg.LIBRARY_DIR / "INDEX.md").is_file():
        warnings.append("library/ missing - run tools/sync_fabric_library.py")
    elif any(p.is_file() and p.suffix != ".md" and p.name != "LICENSE" for p in cfg.LIBRARY_DIR.rglob("*")):
        warnings.append("library/ contains non-Markdown files - re-run tools/sync_fabric_library.py")
    hooks = settings.get("hooks", {})
    for event in ("PreToolUse", "UserPromptSubmit"):
        if event not in hooks:
            warnings.append(f"{event} hook missing")
    if not cfg.KB_DIR.is_dir():
        warnings.append("kb/ folder missing")
    return warnings


def library_version():
    """'0.3.18 synced 2026-10-03' from library/INDEX.md, or '' when the library is missing."""
    try:
        line = (cfg.LIBRARY_DIR / "INDEX.md").read_text(encoding="utf-8").splitlines()[1]
    except (OSError, IndexError):
        return ""
    m = re.search(r"skills-for-fabric (\S+) .*synced (\S+?)\.", line)
    return f"{m.group(1)} synced {m.group(2)}" if m else ""
````

### `.claude/hooks/session_start.py`
````python
#!/usr/bin/env python3
"""KB-GUARD SessionStart hook (startup, resume, /clear and after compaction).

Shows you a one-line banner, re-states the guardrails for Claude, checks the setup and summarises
the knowledge base: cards due for review, open items, unverified claims, open high findings.
"""
import datetime as dt
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import guard_config as cfg  # noqa: E402
import kb_state  # noqa: E402


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    try:
        data = json.loads(sys.stdin.buffer.read().decode("utf-8", errors="replace") or "{}")
    except Exception:
        data = {}
    source = data.get("source") or "startup"
    today = dt.date.today()

    due = kb_state.due_cards(today)
    c = kb_state.counts()
    bootstrap = kb_state.needs_bootstrap()
    warnings = kb_state.setup_warnings()

    lib = kb_state.library_version()
    banner = "KB-GUARD ACTIVE: no execution | Fabric/Azure/Power BI/Git BLOCKED | no commits | company config applies | web anonymous lookup only | writes kb/ only"
    banner += f" | Fabric library {lib}" if lib else " | Fabric library MISSING"
    banner += f" || due for review: {len(due)}" + (" (/quiz)" if due else "")
    if bootstrap:
        banner += " || platform map empty (/bootstrap)"
    if warnings:
        banner += " || SETUP WARNING: " + "; ".join(warnings)

    due_text = f" ({', '.join(due[:3])}{', ...' if len(due) > 3 else ''})" if due else ""
    context = [
        f"KB-GUARD ACTIVE (session {source}). Project policy: {cfg.POLICY_LINE}.",
        (
            f"KB state on {today.isoformat()}: {len(due)} concept card(s) due for review{due_text}; "
            f"{c['open_items']} open item(s) in kb/open.md; {c['unverified_claims']} unverified claim(s); "
            f"{c['open_high_findings']} open high/critical finding(s)."
        ),
    ]
    if lib:
        context.append(
            f"Offline Fabric library: library/ (microsoft/skills-for-fabric {lib}). Use the fabric-library skill "
            "or the fabric-librarian subagent; cite library paths; it is a dated snapshot, so preview/GA, "
            "limits and prices still need the claim-check protocol."
        )
    if bootstrap:
        context.append("kb/platform.md has not been bootstrapped yet; /bootstrap builds it.")
    if warnings:
        context.append("Setup warnings the user should fix: " + "; ".join(warnings) + ".")

    print(json.dumps({
        "systemMessage": banner,
        "hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": "\n".join(context)},
    }))
    return 0


if __name__ == "__main__":
    sys.exit(main())
````

### `.claude/hooks/statusline.py`
````python
#!/usr/bin/env python3
"""Status line: a permanent reminder of the guard mode plus the number of cards due for review."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def main():
    try:
        if not sys.stdin.isatty():
            sys.stdin.read()  # Claude Code sends session JSON; it isn't needed here
    except Exception:
        pass
    try:
        import kb_state
        due = len(kb_state.due_cards())
        warn = " | SETUP WARNING" if kb_state.setup_warnings() else ""
        print(f"KB-GUARD on | no-exec | no Fabric/Azure/PBI/Git | no commits | writes: kb/ | due: {due}{warn}")
    except Exception:
        print("KB-GUARD: status unavailable - run python3 tools/selftest.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
````

### `tools/selftest.py`
````python
#!/usr/bin/env python3
"""Prove the guardrails work - you run this; Claude never does.

Usage (from the project folder):  python3 tools/selftest.py
Feeds sample tool calls to the hooks and prints PASS/FAIL. Writes nothing, contacts nothing.
"""
import json
import subprocess
import sys
from pathlib import Path

P = Path(__file__).resolve().parents[1]
HOOKS = P / ".claude" / "hooks"
OUTSIDE = P.parent / "platform-infra-example"  # stands in for your Terraform repo

TOOL_CASES = [
    ("block", "Bash: terraform apply", {"tool_name": "Bash", "tool_input": {"command": "terraform apply -auto-approve"}}),
    ("block", "PowerShell command", {"tool_name": "PowerShell", "tool_input": {"command": "Get-AzSubscription"}}),
    ("block", "Monitor (background command)", {"tool_name": "Monitor", "tool_input": {"command": "az monitor log-analytics query"}}),
    ("block", "MCP connector tool", {"tool_name": "mcp__azure__list_resources", "tool_input": {}}),
    ("block", "Subagent in a git worktree", {"tool_name": "Agent", "tool_input": {"isolation": "worktree", "prompt": "x"}}),
    ("block", "WebFetch management.azure.com", {"tool_name": "WebFetch", "tool_input": {"url": "https://management.azure.com/subscriptions?api-version=2022-12-01"}}),
    ("block", "WebFetch Fabric REST API", {"tool_name": "WebFetch", "tool_input": {"url": "https://api.fabric.microsoft.com/v1/workspaces"}}),
    ("block", "WebFetch OneLake", {"tool_name": "WebFetch", "tool_input": {"url": "https://onelake.dfs.fabric.microsoft.com/ws/lh.Lakehouse/Files"}}),
    ("block", "WebFetch Entra login", {"tool_name": "WebFetch", "tool_input": {"url": "https://login.microsoftonline.com/common/oauth2/v2.0/token"}}),
    ("block", "WebFetch Key Vault", {"tool_name": "WebFetch", "tool_input": {"url": "https://kv-example.vault.azure.net/secrets/x"}}),
    ("block", "WebFetch private IP", {"tool_name": "WebFetch", "tool_input": {"url": "http://10.20.30.40/status"}}),
    ("allow", "WebFetch Microsoft Learn", {"tool_name": "WebFetch", "tool_input": {"url": "https://learn.microsoft.com/en-us/fabric/security/security-overview"}}),
    ("allow", "WebFetch Fabric blog", {"tool_name": "WebFetch", "tool_input": {"url": "https://blog.fabric.microsoft.com/en-us/blog/"}}),
    ("block", "WebSearch containing a GUID", {"tool_name": "WebSearch", "tool_input": {"query": "fabric workspace 0f8fad5b-d9cb-469f-a165-70867728950e error"}}),
    ("allow", "WebSearch, generic question", {"tool_name": "WebSearch", "tool_input": {"query": "Fabric managed private endpoint limitations"}}),
    ("allow", "Write a kb card", {"tool_name": "Write", "tool_input": {"file_path": str(P / "kb" / "concepts" / "example.md"), "content": "hello"}}),
    ("block", "Write CLAUDE.md", {"tool_name": "Write", "tool_input": {"file_path": str(P / "CLAUDE.md"), "content": "x"}}),
    ("block", "Edit .claude/settings.json", {"tool_name": "Edit", "tool_input": {"file_path": str(P / ".claude" / "settings.json"), "old_string": "a", "new_string": "b"}}),
    ("block", "Write into the infra repo", {"tool_name": "Write", "tool_input": {"file_path": str(OUTSIDE / "main.tf"), "content": "x"}}),
    ("block", "Write a secret into kb/", {"tool_name": "Write", "tool_input": {"file_path": str(P / "kb" / "x.md"), "content": "AccountKey=" + "A" * 40}}),
    ("block", "Read terraform.tfstate", {"tool_name": "Read", "tool_input": {"file_path": str(OUTSIDE / "terraform.tfstate")}}),
    ("block", "Read .terraform/ folder", {"tool_name": "Read", "tool_input": {"file_path": str(OUTSIDE / ".terraform" / "terraform.tfstate")}}),
    ("block", "Glob for state files", {"tool_name": "Glob", "tool_input": {"pattern": "**/*.tfstate"}}),
    ("allow", "Read a .tf file", {"tool_name": "Read", "tool_input": {"file_path": str(OUTSIDE / "main.tf")}}),
    ("allow", "Read kb/platform.md", {"tool_name": "Read", "tool_input": {"file_path": str(P / "kb" / "platform.md")}}),
    # fabric-skills plugin and the offline library
    ("block", "Skill fabric-skills:spark-cli", {"tool_name": "Skill", "tool_input": {"skill": "fabric-skills:spark-cli"}}),
    ("block", "Agent fabric-skills:FabricIQ", {"tool_name": "Agent", "tool_input": {"subagent_type": "fabric-skills:FabricIQ", "prompt": "x"}}),
    ("block", "MCP FabricIQ ExecuteQuery", {"tool_name": "mcp__plugin_fabric-skills_FabricIQ__ExecuteQuery", "tool_input": {}}),
    ("block", "WebFetch FabricIQ MCP endpoint", {"tool_name": "WebFetch", "tool_input": {"url": "https://fabriciq.svc.cloud.microsoft/v1/mcp/fabriciq"}}),
    ("block", "WebFetch Power BI API", {"tool_name": "WebFetch", "tool_input": {"url": "https://api.powerbi.com/v1.0/myorg/groups"}}),
    ("block", "Write into library/", {"tool_name": "Write", "tool_input": {"file_path": str(P / "library" / "INDEX.md"), "content": "x"}}),
    ("allow", "Read library/INDEX.md", {"tool_name": "Read", "tool_input": {"file_path": str(P / "library" / "INDEX.md")}}),
    ("allow", "Skill fabric-library (offline)", {"tool_name": "Skill", "tool_input": {"skill": "fabric-library"}}),
    # Fabric, Azure, Power BI and Git are blocked; other company-approved connectors follow company policy
    ("block", "MCP GitHub connector", {"tool_name": "mcp__plugin_engineering_github__create_issue", "tool_input": {}}),
    ("block", "MCP git server commit", {"tool_name": "mcp__git__git_commit", "tool_input": {}}),
    ("block", "MCP Azure DevOps connector", {"tool_name": "mcp__azure-devops__list_repos", "tool_input": {}}),
    ("block", "MCP Power BI connector", {"tool_name": "mcp__powerbi__execute_query", "tool_input": {}}),
    ("allow", "MCP Slack connector (company policy decides)", {"tool_name": "mcp__plugin_engineering_slack__search", "tool_input": {}}),
    ("block", "Skill engineering:standup (Git hosting)", {"tool_name": "Skill", "tool_input": {"skill": "engineering:standup"}}),
    ("block", "WebFetch with access_token in URL", {"tool_name": "WebFetch", "tool_input": {"url": "https://api.github.com/user/repos?access_token=abc"}}),
    ("allow", "WebFetch public GitHub page (lookup)", {"tool_name": "WebFetch", "tool_input": {"url": "https://github.com/microsoft/skills-for-fabric"}}),
    ("allow", "Agent fabric-librarian", {"tool_name": "Agent", "tool_input": {"subagent_type": "fabric-librarian", "prompt": "x"}}),
]


def run(script, payload):
    proc = subprocess.run(
        [sys.executable, str(HOOKS / script)],
        input=json.dumps(payload).encode("utf-8"),
        capture_output=True,
        timeout=30,
    )
    return proc.returncode, proc.stdout.decode("utf-8", "replace"), proc.stderr.decode("utf-8", "replace")


def main():
    results = []

    for expect, name, payload in TOOL_CASES:
        code, _, err = run("guard_tools.py", dict(payload, hook_event_name="PreToolUse"))
        got = "block" if code == 2 else "allow" if code == 0 else f"error {code}"
        results.append((got == expect, f"{expect:5}  {name}", "" if got == expect else (err.strip() or got)))

    code, out, _ = run("guard_prompt.py", {"hook_event_name": "UserPromptSubmit", "prompt": "explain private endpoints"})
    results.append((code == 0 and "KB-GUARD ACTIVE" in out, "note   per-turn guardrail note added", out.strip()[:120]))
    code, out, _ = run("guard_prompt.py", {"hook_event_name": "UserPromptSubmit", "prompt": "my key AccountKey=" + "B" * 44})
    blocked = code == 0 and '"decision": "block"' in out
    results.append((blocked, "block  prompt containing a secret", "" if blocked else out.strip()[:120]))

    code, out, _ = run("session_start.py", {"hook_event_name": "SessionStart", "source": "startup"})
    try:
        banner = json.loads(out).get("systemMessage", "")
    except ValueError:
        banner = ""
    results.append((banner.startswith("KB-GUARD ACTIVE"), "note   session-start banner", banner[:160]))

    card = P / "kb" / "concepts" / "managed-identity.md"
    code, _, err = run("kb_lint.py", {"hook_event_name": "PostToolUse", "tool_name": "Write", "tool_input": {"file_path": str(card)}})
    results.append((code == 0, "lint   example card passes the KB lint", err.strip()[:160]))

    raw = (P / ".claude" / "settings.json").read_text(encoding="utf-8")
    try:
        json.loads(raw)
        valid = True
    except ValueError:
        valid = False
    results.append((valid, "setup  settings.json is valid JSON", ""))
    settings = json.loads(raw) if valid else {}
    off = settings.get("enabledPlugins", {}).get("fabric-skills@fabric-collection") is False
    results.append((off, "setup  fabric-skills plugin disabled for this project", 'set "enabledPlugins": {"fabric-skills@fabric-collection": false}'))
    lib = P / "library"
    extra = [p.relative_to(P).as_posix() for p in lib.rglob("*") if p.is_file() and p.suffix != ".md" and p.name != "LICENSE"]
    results.append(((lib / "INDEX.md").is_file(), "lib    library/ present", "run: python3 tools/sync_fabric_library.py"))
    results.append((not extra, "lib    library/ holds Markdown only (no scripts)", ", ".join(extra[:5])))
    results.append(("{{" not in raw, "setup  no placeholders left in settings.json", "run: python3 tools/setup_paths.py --infra <repo>"))

    failed = 0
    for ok, label, detail in results:
        print(("PASS  " if ok else "FAIL  ") + label + ("" if ok or not detail else f"\n      -> {detail}"))
        failed += 0 if ok else 1
    print()
    if failed:
        print(f"{failed} check(s) FAILED - fix them before starting Claude.")
        return 1
    print(f"All {len(results)} checks passed - the guardrails are active.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
````

### `tools/setup_paths.py`
````python
#!/usr/bin/env python3
"""Fill the machine-specific paths in .claude/settings.json. You run this; Claude never does.

Usage (from the project folder):
    python3 tools/setup_paths.py --infra ~/work/platform-infra [--infra ~/work/another-repo]

Sets:
    {{PYTHON}}            -> this Python interpreter (sys.executable)
    {{PROJECT_DIR}}       -> this project folder (status line only)
    {{INFRA_REPO_DIR}}    -> each --infra folder (Claude may READ it)
    {{INFRA_REPO_POSIX}}  -> the same folders as deny rules (Claude may never EDIT them)
Safe to re-run; keeps a settings.json.bak copy.
"""
import argparse
import json
import shutil
import sys
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
SETTINGS = PROJECT / ".claude" / "settings.json"
HOOK_MARK = "/.claude/hooks/"


def fwd(path):
    return str(path).replace("\\", "/")


def edit_deny_rule(path):
    s = fwd(path)
    if len(s) > 1 and s[1] == ":":  # C:/work/x -> c/work/x
        s = s[0].lower() + s[2:]
    return "Edit(//" + s.lstrip("/") + "/**)"


def main():
    ap = argparse.ArgumentParser(description="Fill the paths in .claude/settings.json")
    ap.add_argument("--infra", action="append", default=[], help="infra repo folder Claude may read (repeatable)")
    args = ap.parse_args()

    settings = json.loads(SETTINGS.read_text(encoding="utf-8"))
    python = Path(sys.executable).resolve()
    if "windowsapps" in str(python).lower():
        print("WARNING: this python.exe looks like the Microsoft Store alias. Run 'py -0p' and use a real interpreter.")
    py, proj = fwd(python), fwd(PROJECT)

    hooks = 0
    for groups in settings.get("hooks", {}).values():
        for group in groups:
            for handler in group.get("hooks", []):
                if any(HOOK_MARK in arg for arg in handler.get("args", [])):
                    handler["command"] = py
                    hooks += 1

    if " " in py or " " in proj:
        settings.pop("statusLine", None)
        print("NOTE: a path contains spaces, so the optional status line was removed (cosmetic only).")
    else:
        settings["statusLine"] = {"type": "command", "command": f"{py} {proj}/.claude/hooks/statusline.py", "padding": 0}

    perms = settings.setdefault("permissions", {})
    deny = perms.setdefault("deny", [])
    if args.infra:
        dirs = []
        for raw in args.infra:
            folder = Path(raw).expanduser().resolve()
            if not folder.is_dir():
                sys.exit(f"ERROR: infra folder not found: {raw}")
            dirs.append(folder)
        perms["additionalDirectories"] = [fwd(d) for d in dirs]
        deny[:] = [r for r in deny if not r.startswith("Edit(//")] + [edit_deny_rule(d) for d in dirs]
    elif any("{{" in str(x) for x in perms.get("additionalDirectories", [])):
        perms["additionalDirectories"] = []
        deny[:] = [r for r in deny if "{{" not in r]
        print("NOTE: no --infra given - Claude can't read your Terraform repo until you re-run with --infra.")

    text = json.dumps(settings, indent=2, ensure_ascii=False) + "\n"
    json.loads(text)  # sanity check before writing
    shutil.copyfile(SETTINGS, SETTINGS.with_name("settings.json.bak"))
    SETTINGS.write_text(text, encoding="utf-8")

    print(f"Python:       {py}  ({hooks} hook handlers)")
    print(f"Project:      {proj}")
    print(f"Infra (read): {', '.join(perms.get('additionalDirectories', [])) or 'none'}")
    if "{{" in text:
        print("WARNING: placeholders remain in .claude/settings.json - fix them before starting Claude.")
        return 1
    print("Done. Next: python3 tools/selftest.py  then  ./start.sh")
    return 0


if __name__ == "__main__":
    sys.exit(main())
````

### `tools/sync_fabric_library.py`
````python
#!/usr/bin/env python3
"""Copy the Microsoft skills-for-fabric knowledge into library/ as an OFFLINE, read-only reference.
You run this; Claude never does. It reads local files only - no network, no Azure, no Fabric.

Usage (from the project folder):
    python3 tools/sync_fabric_library.py                 # finds the installed fabric-skills plugin
    python3 tools/sync_fabric_library.py --source <dir>  # or point at a plugin/repo folder

What it keeps: Markdown under skills/ and common/.
What it drops: every script (.py .sh .ps1 .cs ...), skills that only drive remote services
(EXCLUDED_SKILLS), and the agent-only preambles that tell an assistant to call Fabric APIs.
Re-run after `/plugin update` to refresh. Replaces library/ completely each time.
"""
import argparse
import datetime as dt
import json
import re
import shutil
import sys
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
LIBRARY = PROJECT / "library"
PLUGIN_ID = "fabric-skills@fabric-collection"
MARKETPLACE = "fabric-collection"
# Skills with no learning value offline: they only orchestrate remote services or look up live items.
EXCLUDED_SKILLS = {"project-osmos", "search-consumption-cli"}
EXCLUDED_DIRS = {"scripts", "charts"}
# Leading blockquotes that are instructions for an executing agent, not knowledge.
AGENT_PREAMBLE_RE = re.compile(r"Telemetry|CRITICAL NOTES|FAST PATH|MANDATORY", re.IGNORECASE)
BANNER = (
    "> OFFLINE REFERENCE - Microsoft skills-for-fabric {version}, synced {date}. Learning material only.\n"
    "> Commands, REST calls and scripts below explain how Fabric works; they are never run from this project.\n"
)


def find_source():
    home = Path.home() / ".claude" / "plugins"
    try:
        data = json.loads((home / "installed_plugins.json").read_text(encoding="utf-8"))
        entries = data.get("plugins", {}).get(PLUGIN_ID) or []
        for entry in entries:
            path = Path(entry.get("installPath", ""))
            if (path / "skills").is_dir():
                return path, entry.get("version", "?"), entry.get("gitCommitSha", "?")
    except (OSError, ValueError):
        pass
    market = home / "marketplaces" / MARKETPLACE
    if (market / "skills").is_dir():
        return market, "marketplace-checkout", "?"
    return None, None, None


def find_license(source):
    for cand in (source / "LICENSE", Path.home() / ".claude" / "plugins" / "marketplaces" / MARKETPLACE / "LICENSE"):
        if cand.is_file():
            return cand
    return None


def split_frontmatter(text):
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            cut = text.find("\n", end + 4)
            cut = len(text) if cut == -1 else cut + 1
            return text[:cut], text[cut:]
    return "", text


def frontmatter_value(front, key):
    m = re.search(rf"^{key}:\s*(.+)$", front, re.MULTILINE)
    if not m:
        return ""
    value = m.group(1).strip()
    if value in (">", "|", ">-", "|-"):  # folded block: take the indented lines that follow
        lines = front[m.end():].splitlines()
        value = " ".join(line.strip() for line in lines if line.startswith("  "))
    return value.strip("\"'")


def strip_agent_preamble(body):
    """Drop leading blockquote blocks that instruct an agent (telemetry headers, 'call this API first')."""
    lines = body.splitlines(keepends=True)
    i, out_start = 0, 0
    while i < len(lines):
        if not lines[i].strip():
            i += 1
            continue
        if not lines[i].startswith(">"):
            break
        j = i
        while j < len(lines) and lines[j].startswith(">"):
            j += 1
        block = "".join(lines[i:j])
        if not AGENT_PREAMBLE_RE.search(block):
            break
        i = out_start = j
    return "".join(lines[out_start:]).lstrip("\n")


def first_heading(body):
    m = re.search(r"^#{1,2}\s+(.+)$", body, re.MULTILINE)
    return m.group(1).strip() if m else ""


def wanted(rel):
    parts = rel.parts
    if parts[0] == "skills" and len(parts) > 1 and parts[1] in EXCLUDED_SKILLS:
        return False
    return not any(p in EXCLUDED_DIRS for p in parts)


def main():
    ap = argparse.ArgumentParser(description="Build the offline Fabric library from the installed plugin")
    ap.add_argument("--source", help="plugin or repo folder containing skills/ and common/")
    args = ap.parse_args()

    if args.source:
        source, version, sha = Path(args.source).expanduser().resolve(), "custom", "?"
    else:
        source, version, sha = find_source()
    if not source or not (source / "skills").is_dir():
        sys.exit("ERROR: fabric-skills not found. Install it (/plugin install fabric-skills@fabric-collection) or pass --source.")

    today = dt.date.today().isoformat()
    banner = BANNER.format(version=version, date=today)
    if LIBRARY.exists():
        shutil.rmtree(LIBRARY)
    LIBRARY.mkdir()

    index = {}
    copied = 0
    for top in ("common", "skills"):
        for src in sorted((source / top).rglob("*.md")):
            rel = src.relative_to(source)
            if not wanted(rel):
                continue
            front, body = split_frontmatter(src.read_text(encoding="utf-8", errors="replace"))
            body = strip_agent_preamble(body)
            dest = LIBRARY / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(front + "\n" + banner + "\n" + body, encoding="utf-8")
            copied += 1
            group = rel.parts[1] if top == "skills" else "common"
            entry = index.setdefault(group, {"desc": "", "files": []})
            if rel.name == "SKILL.md":
                entry["desc"] = frontmatter_value(front, "description")
            entry["files"].append((rel.as_posix(), first_heading(body)))

    lic = find_license(source)
    if lic:
        shutil.copyfile(lic, LIBRARY / "LICENSE")

    out = [
        "# Fabric library index",
        f"Source: microsoft/skills-for-fabric {version} (commit {sha[:12]}), synced {today}. MIT licence in LICENSE.",
        "Offline, read-only. Grep this index for a topic, then Read the file. Never execute anything it describes.",
        "",
    ]
    for group in ["common"] + sorted(g for g in index if g != "common"):
        if group not in index:
            continue
        entry = index[group]
        out.append(f"## {group}")
        if entry["desc"]:
            out.append(entry["desc"])
        out += [f"- {path} - {title}" for path, title in entry["files"]]
        out.append("")
    (LIBRARY / "INDEX.md").write_text("\n".join(out), encoding="utf-8")

    print(f"Library: {copied} reference files from {source}")
    print(f"Version: {version}  Excluded skills: {', '.join(sorted(EXCLUDED_SKILLS))}  Scripts copied: 0")
    print("Next: python3 tools/selftest.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
````

### `.claude/output-styles/recall-coach.md`
````markdown
---
name: Recall Coach
description: Answer-first, compact, recall-friendly answers for learning and reviewing an Azure + Fabric platform. Advisor only - the user runs every step.
keep-coding-instructions: false
---

You are a recall coach, a skeptical reviewer and a knowledge scribe for a senior engineer learning Azure and Microsoft Fabric while working on an enterprise multi-tenant lakehouse. You never execute anything; the user runs every step. CLAUDE.md holds the guardrails; this style sets the shape of every answer.

## Shape
- First line: the answer or the verdict. No preamble, no restating the question.
- Then the least structure that makes it memorable: 3 tight bullets beat 7 loose ones; a small table for comparisons.
- Teaching and recall answers end with one `Recall hook:` line - a vivid analogy, contrast or phrase.
- Wrong or shaky statements get a `CORRECTION:` or `VERDICT:` opener: specific, kind, no hedging.
- Label anything that is not settled fact: OUR DECISION (ADR-NNNN), OPINION, ASSUMPTION, UNVERIFIED.
- Cite as [title](url) - checked YYYY-MM-DD. Paraphrase; no long quotes.
- On-prem anchors read as: "~ <thing you know> - but <where it differs>".
- No diagrams unless asked.

## When something has to be run
```
RUN THIS YOURSELF (bash) - Risk: READ-ONLY | LOCAL CHANGE | DESTRUCTIVE
<bash commands>
Expect: <what success looks like>
Verify: <how to check>
Undo:   <how to roll back, if relevant>
```
Then stop and wait for the pasted output. Never write as if you ran it. Local commands only: nothing that signs in to or acts on an account (az, fab, sqlcmd, terraform plan/apply or a backend init, git clone/fetch/pull/push, gh, glab, ssh, logins) - explain those instead.

## Length
Recall: 12 lines or fewer. Teach: about one screen. Reviews: findings table first, prose after. Go longer only when the user says "deeper", "detail" or "explain fully".

## Terminal formatting
Plain Markdown. Text labels carry meaning - CRITICAL/HIGH/MEDIUM/LOW/INFO and CORRECT/PARTLY/WRONG/OUTDATED/UNVERIFIED/OPINION - never colour or emoji alone. Reference code as `path/file.tf:42`.
````

### `.claude/rules/kb-writing.md`
````markdown
---
paths:
  - "kb/**"
---
# Writing in kb/
- Follow the kb-conventions skill: one topic, one home; extend the existing file instead of creating a new one.
- Respect the caps (card 45, ADR 70, meeting 40, platform.md 80 lines). Cut words, keep facts.
- No raw transcripts, no people's names (except action owners), no IDs, hostnames, IPs or secrets.
- Every Azure/Fabric fact in a card has a source with a checked date in `sources:`, or is marked UNVERIFIED.
- Show the user the change first; write only after they approve.
````

### `.claude/skills/claim-check/SKILL.md`
````markdown
---
name: claim-check
description: Protocol for validating technical claims and the user's own understanding against authoritative, current sources - atomic restatement, safe pull-only searching, source hierarchy, verdict scale and how to record results. Use whenever a statement about Azure, Microsoft Fabric, Terraform, networking, identity or security needs checking, when meeting claims are logged, when the user asks "is this right?", and before presenting fast-moving specifics (preview/GA, limits, SKUs, regions, provider resources) as fact.
---

# Claim check

## 1. Make it checkable
Rewrite the claim as atomic statements. Tag each one:
- FACT-CHECKABLE - can be confirmed or refuted from documentation.
- CONTEXT-DEPENDENT - true only for some SKUs, regions, configurations or versions; name them.
- DESIGN OPINION - not true or false; give the trade-offs instead of a verdict.

## 2. Search safely (pull-only)
- Generalise first: remove internal names, hostnames, IPs, IDs, people and code. Ask "Can a Fabric workspace identity read a firewall-enabled ADLS Gen2 account?", never the internal workspace or storage account name.
- WebSearch, then WebFetch the best 1-3 pages. Never fetch tenant, portal, management or data-plane endpoints.
- If WebSearch is unavailable (some Amazon Bedrock and Azure-hosted Microsoft Foundry setups), fetch known Microsoft Learn or Terraform Registry pages directly. If nothing is reachable, mark UNVERIFIED and propose a "verify" row for kb/open.md.

## 3. Source hierarchy (highest first)
1. Microsoft Learn product docs and REST/CLI references - read the "Applies to" line, preview banners, limits tables and the last-updated date.
2. Azure Architecture Center, Well-Architected Framework, Cloud Adoption Framework.
3. Terraform Registry provider docs plus the provider CHANGELOG/releases (azurerm, azapi, microsoft/fabric).
4. Official status announcements: Fabric blog and roadmap, Azure updates.
5. Official GitHub repos and issues (known bugs, limitations). The offline `library/` (Microsoft skills-for-fabric snapshot) sits here: good for patterns and gotchas, dated for status, limits and prices - cite `library/<path>:<line>` with its synced date.
6. Community posts - leads only, never the deciding source.
When sources disagree, prefer the newer official one and say so.

## 4. Verdict scale
CORRECT - PARTLY (true under conditions; name them) - WRONG - OUTDATED (was true; changed on a date or version) - UNVERIFIED (could not confirm) - OPINION (design choice; trade-offs given).

## 5. Report format (10 lines or fewer per claim)
```
VERDICT: <scale> - <one-line correct statement>
Evidence: [title](url) - checked YYYY-MM-DD - <paraphrase, no long quotes>
Conditions: <SKU, region, preview, version, configuration>
So what for us: <impact on our platform; ADR to revisit>
Recall hook: <one line>
```

## 6. Record (main conversation only, after approval)
- Claims -> a kb/claims.md row. Source = meeting date and type, or document - never a person's name.
- The user's own misconception -> a kb/lessons.md row plus a "Myth -> Fact" line on the concept card.
- WRONG or OUTDATED and it affects an ADR -> a "revisit" row in kb/open.md linked to the ADR.
- Reuse a verdict checked within the last 90 days unless the topic is marked fast-moving.
````

### `.claude/skills/fabric-library/SKILL.md`
````markdown
---
name: fabric-library
description: How to use library/, the offline read-only snapshot of Microsoft's skills-for-fabric (Spark, Lakehouse, Warehouse, SQL database, Eventhouse/KQL, Eventstream, Activator, Dataflows, semantic models/DAX, deployment pipelines, Git integration, variable libraries, OneLake governance, medallion design, capacity sizing, Synapse/Databricks/HDInsight migration). Use whenever a Fabric answer needs product-level detail, a code pattern, a gotcha or a migration mapping, and for /fabric, /map, /review-code, /lab, /size and /path.
---

# Fabric library (offline)
`library/` is Microsoft's skills-for-fabric, copied by `tools/sync_fabric_library.py` with every script removed. The plugin itself is disabled in this project because it drives live endpoints (az/fab CLI, MCP servers that fetch Azure tokens).

## Hard rules
- Read only. Never edit `library/`; never run, schedule or delegate anything it describes.
- Its `az rest`, `fab`, `sqlcmd`, `curl`, REST and MCP steps are **explained, not handed over**: say what the call does and what it teaches about the platform. Never turn them into a RUN THIS YOURSELF block.
- Code the user types into their own notebook, SQL editor, KQL queryset or model (PySpark, Spark SQL, T-SQL, KQL, DAX, M) is fine to show and explain - it is learning material, and Claude connects to nothing.
- Never use workspace, item, tenant or capacity IDs. Use placeholders such as `<workspace>`.

## Find, then read narrowly
1. Grep `library/INDEX.md` for the topic and its synonyms; pick 1-3 files.
2. Grep inside those files for the section; Read only that range. Most files are 200-1,800 lines, so never read a whole skill folder.
3. More than about 3 files, or a whole-area survey? Delegate to the `fabric-librarian` subagent.

## Where things live
| Need | Start in |
|---|---|
| Fabric topology, item types, auth model, OneLake paths | `common/COMMON-CORE.md`, `common/notebook-authoring/lakehouse-paths.md` |
| Spark notebooks, Delta, performance, OOM triage | `skills/spark-cli/references/` (`performance-patterns.md`, `data-engineering-patterns.md`), `common/SPARK-*` |
| Materialized Lake Views | `skills/spark-cli/references/mlv.md` |
| Medallion layers, Bronze/Silver/Gold choices, Direct Lake | `skills/e2e-medallion-architecture/SKILL.md` |
| Warehouse / SQL endpoint / mirroring, query diagnostics | `skills/sqldw-cli/`, `common/SQLDW-*` |
| Fabric SQL database (OLTP) | `skills/sqldb-cli/`, `common/SQLDB-*` |
| Real-time: Eventstream, Eventhouse/KQL, Activator, schema sets | `skills/eventstream-cli/`, `skills/eventhouse-cli/`, `skills/activator-cli/`, `skills/eventschemaset-cli/` |
| Dataflow Gen2, Power Query M | `skills/dataflows-cli/`, `common/DATAFLOWS-*` |
| Semantic models, DAX, TMDL, Direct Lake modelling | `skills/semantic-model-authoring/references/` |
| CI/CD: Git integration, deployment pipelines, variable libraries, item definitions | `skills/git-integration-operations-cli/`, `skills/deployment-pipelines-authoring-cli/`, `skills/variable-library-cli/`, `common/ITEM-DEFINITIONS-CORE.md` |
| Governance: domains, labels, endorsement, catalog health | `skills/onelake-catalog-govern-cli/` |
| Capacity sizing and cost | `skills/e2e-fabric-cost-estimation/` |
| Migration from Databricks / Synapse / HDInsight / ADF pipelines | `skills/databricks-migration/`, `skills/synapse-migration/`, `skills/hdinsight-migration/`, `skills/pipeline-migration/` |
| Ontology (Fabric IQ) | `skills/fabriciq-ontology-cli/` |

Migration guides are the best bridge from the on-prem stack: Spark/Hive code patterns (`hdinsight-migration`), notebook utilities and secret handling (`databricks-migration/resources/dbutils-to-notebookutils.md`), and orchestration (`pipeline-migration/resources/activity-mapping.md`, which pairs well with Airflow).

## How to cite and trust it
- Cite as `library/<path>:<line>` and say "skills-for-fabric <version>" (from `library/INDEX.md`).
- It is Microsoft-authored but a dated snapshot written for automation agents. Use it for concepts, patterns and gotchas. Preview/GA status, limits, SKUs, prices and regions still go through the claim-check protocol, or carry the UNVERIFIED label.
- If the library and Microsoft Learn disagree, Learn wins; record the conflict in kb/claims.md.
````

### `.claude/skills/kb-conventions/SKILL.md`
````markdown
---
name: kb-conventions
description: File formats, templates and rules for the knowledge base in kb/ - concept cards, ADRs, meeting digests, and the claims, lessons, open-items and findings registers - plus linking and brevity rules. Use whenever creating or updating anything under kb/ - capturing a concept, lesson, decision, claim, finding, question or meeting.
---

# Knowledge base conventions
Goal: small, linked, recall-first notes. One topic, one home; update in place.

## Where things go
| Thing | File | Template |
|---|---|---|
| Concept | kb/concepts/<slug>.md | templates/concept.md |
| Decision | kb/decisions/ADR-NNNN-<slug>.md | templates/adr.md |
| Meeting | kb/meetings/YYYY-MM-DD-<type>-<topic>.md | templates/meeting.md |
| Document or informal discussion | kb/sources/YYYY-MM-DD-<document\|discussion>-<topic>.md | templates/source.md |
| Claim | kb/claims.md (append a row) | row format below |
| The user's corrected misconception | kb/lessons.md | row |
| Question, risk, action, verify-later | kb/open.md | row |
| Review finding, decision challenge (F-DEC-NN) | kb/findings.md | row |
| Platform fact | kb/platform.md (right section) | - |

## Rules
- Slugs: kebab-case, singular, the term people actually say ("private-endpoint", "workspace-identity").
- Before creating a file, Grep kb/ for the slug and its synonyms; extend what exists.
- Link with [[slug]] and ADR-NNNN; every card links at least one related card.
- ISO dates (YYYY-MM-DD). No people's names except action owners. No IDs, hostnames, IPs or secrets.
- Caps (enforced by the kb_lint hook): card 45 lines (a saved Mermaid block doesn't count), ADR 70, meeting or source digest 40, platform.md 80.
- Documents and discussions are digested and paraphrased, never pasted; the original stays outside kb/.
- New cards start at `box: 1`, `next_review` = tomorrow, `confidence` as the user rates it (default 2).
- Show the user what you will write (or a compact diff), and write only after they approve.
- Next ID: read the last row of the register (C-NNN, L-NNN, O-NNN) or the highest ADR number.

## Register rows
- claims.md: `| C-NNN | date | source (meeting date + type, or document) | claim | verdict | correct statement | evidence (url, checked date) |`
- lessons.md: `| L-NNN | date | I thought... | Actually... | why it matters | [[card]] |`
- open.md: `| O-NNN | date | question / risk / action / verify / study | item | owner (actions only) | open / done / dropped | link |`
- findings.md: `| F-AREA-NN | date | severity | pillar | evidence | finding | recommendation | open / fixed / accepted |`
````

### `.claude/skills/kb-conventions/templates/adr.md`
````markdown
---
id: ADR-NNNN
title: <the decision in 5-8 words>
status: proposed
date: <YYYY-MM-DD>
deciders: <roles>
tags: [<...>]
---
<!-- status: proposed | accepted | superseded by ADR-NNNN | deprecated -->
## Context
<forces and constraints in 3-6 lines; link claims C-NNN and findings F-...>

## Decision
<1-3 lines, active voice: "We will ...">

## Options considered
| Option | Pros | Cons | Verdict |
|---|---|---|---|
| <A> | | | Chosen |
| <B> | | | Rejected: <why> |

## Consequences
+ <what gets easier>
- <what gets harder>
Revisit when: <trigger>

## Challenge
<verdict (ENDORSE / ENDORSE WITH CONDITIONS / RECONSIDER / REJECT) - date - F-DEC-NN; conditions; one-way or two-way door>

## Assumptions to validate
- <assumption> (UNVERIFIED -> /validate)

## Recall
<one line: "We chose X over Y because Z.">
````

### `.claude/skills/kb-conventions/templates/concept.md`
````markdown
---
title: <Concept name>
slug: <slug>
tags: [<identity | network | data | compute | governance | devops | security | cost | fabric | terraform>]
anchor: "~ <on-prem equivalent> - but <where it differs>"
confidence: 2
box: 1
next_review: <YYYY-MM-DD, tomorrow>
updated: <YYYY-MM-DD>
sources:
  - <url> (checked <YYYY-MM-DD>)
---
**One-liner:** <one sentence a senior colleague would accept>

**Why it exists:** <the problem it solves, 1-2 lines>

**Use when:** <...>
**Avoid when:** <...>

**In our platform:** <file path, ADR-NNNN, platform.md section - or "not mapped yet">

**Mistakes:**
- Myth: <wrong belief> -> Fact: <correction>

**Recall hook:** <one memorable line>

**Check yourself:** <question>
<details><summary>Answer</summary><answer></details>

**Related:** [[<slug>]], [[<slug>]]
````

### `.claude/skills/kb-conventions/templates/meeting.md`
````markdown
---
date: <YYYY-MM-DD>
type: <standup | design | review | 1to1 | other>
topic: <short topic>
source: inbox/<file> (delete after capture)
---
**Decisions:** <decision> (-> ADR-NNNN or O-NNN)
**Claims logged:** C-NNN, C-NNN (verdicts pending /validate)
**Actions:** O-NNN, O-NNN
**Open questions and risks:** O-NNN
**Concepts touched:** [[<slug>]]; new cards: <slugs>
**Disagreements:** <topic - positions - status>
**My takeaways (3 max):**
- <...>
````

### `.claude/skills/kb-conventions/templates/source.md`
````markdown
---
date: <YYYY-MM-DD>
kind: <document | discussion>
title: <document title or discussion topic>
origin: <doc type and version, or channel/forum - no names, no links to internal systems>
---
**Purpose / problem:** <1-2 lines>
**Key points:** <3-6 bullets, paraphrased - never pasted text>
**Decisions:** <decision> - <verdict from /challenge> (-> ADR-NNNN, F-DEC-NN or O-NNN)
**Claims logged:** C-NNN (verdicts pending /validate)
**Assumptions:** <stated or implied>
**Gaps and risks:** F-..., O-...
**Concepts touched:** [[<slug>]]
**My position (3 max):**
- <what I will support, push back on, or ask>
````

### `.claude/skills/platform-review/SKILL.md`
````markdown
---
name: platform-review
description: Enterprise review rubrics for a multi-tenant Azure + Microsoft Fabric lakehouse and its Terraform - pillars, checks, anti-patterns, severity scale and finding format. Use for any architecture review, design critique, Terraform/IaC review, production-readiness or "is this enterprise-grade?" question, and for /review-tf, /review-arch and /platform-check.
---

# Platform review
Read the reference that fits the task before reviewing:
- `references/architecture.md` - 12 pillars: identity, network, data security, multi-tenancy, governance, data architecture, DevOps/CI-CD, reliability/DR, observability, cost, compliance, operability.
- `references/terraform.md` - repo structure, state, providers, CI identity, security in code, code quality, Fabric ownership boundaries, pipeline gates.
- `references/design-patterns.md` - multi-tenant data design, configurability and parameterization, data engineering patterns, production readiness, decision quality, stress tests. Use it for every design, document or decision challenge.

## Ground rules
- Evidence first: every finding cites file:line, an ADR, kb/platform.md or the design text. No evidence -> it is a QUESTION, not a finding.
- Mark each finding VERIFIED (seen in code or docs) or INFERRED (likely, needs confirmation).
- Fast-moving Azure/Fabric capabilities: never assert availability from memory - mark "verify" and use the claim-check skill.
- Read-only: propose fixes as snippets or diffs for the user to apply in a merge request. Never edit, never execute.
- State, .terraform/, tfvars and keys are off-limits (blocked anyway). If a secret is visible in code, report a CRITICAL "secret in code at file:line" without repeating the value.
- Respect recorded decisions (ADRs); challenge them explicitly rather than ignoring them.

## Severity
- CRITICAL - exploitable exposure, cross-tenant data leak, or likely data loss.
- HIGH - blocks enterprise or production readiness, or would fail an audit.
- MEDIUM - real risk or maintenance cost; fix this quarter.
- LOW - hygiene.
- INFO - good practice observed; worth keeping.

## Finding format
| ID | Sev | Pillar | Evidence | Finding | Why it matters | Recommendation | Effort S/M/L | Confidence |
|---|---|---|---|---|---|---|---|---|
IDs: F-<AREA>-NN, e.g. F-NET-03; decision challenges use F-DEC-NN. After the table: top 3 risks (prose, 3 lines each at most), up to 5 questions for the team, and ADRs that should exist but don't.

## Scorecard (/platform-check)
Each pillar: STRONG / ADEQUATE / GAP / UNKNOWN plus a one-line reason. UNKNOWN is honest - it becomes a question, not a guess.
````

### `.claude/skills/platform-review/references/architecture.md`
````markdown
# Architecture review checklist - multi-tenant Azure + Microsoft Fabric lakehouse
Prompts, not a tick-box. Items marked (verify) depend on fast-moving features: confirm current status with the claim-check skill before asserting them.

## 1. Identity and access
- People get access through Entra security groups, never as individual users - for Azure RBAC and Fabric workspace roles alike.
- Privileged roles (Fabric administrator, capacity admin, subscription Owner, Key Vault administrator) are just-in-time through PIM; break-glass accounts exist, are excluded from lockout policies and are monitored.
- Automation uses managed identities or workload identity federation (OIDC); no client secrets in CI variables.
- Separate identities for plan and apply, and per environment; the prod apply identity can't be used from non-prod pipelines.
- The Fabric tenant setting that lets service principals call Fabric APIs is scoped to a security group, not the whole organisation (verify setting names).
- Production items and connections aren't owned by personal accounts (leaver risk); workspace identity or service principals are used where supported (verify).
- Data-plane roles (e.g. Storage Blob Data ...) are granted at the narrowest scope, separately from control-plane roles.

## 2. Network
- Inbound to Fabric: tenant-level vs workspace-level Private Link chosen deliberately, with the feature trade-offs of blocking public access understood (verify).
- Outbound from Fabric: managed private endpoints for Spark, trusted workspace access for firewall-enabled ADLS Gen2, outbound access protection where required (verify).
- No public endpoints on storage, Key Vault, databases or the Terraform state account: public network access off, private endpoints plus privatelink.* DNS zones linked to the right VNets.
- One owner for private DNS (hub) - no split-brain zones; resolution tested from where traffic originates.
- On-prem or private sources reached through a VNet data gateway or on-premises data gateway, with high availability.
- Hub-spoke or Virtual WAN with egress control (firewall), NSGs and no "allow any" rules.

## 3. Data security and privacy
- Data classification drives the controls; sensitivity labels applied and inherited downstream (Purview Information Protection).
- Encryption: platform-managed by default; customer-managed keys where policy demands (verify Fabric scope and status).
- Fine-grained access designed per engine path - OneLake security roles, SQL endpoint/Warehouse RLS/CLS/OLS, semantic model RLS - with no bypass path through another engine (verify).
- DLP policies, audit logging and residency: the capacity region is the data-at-rest region; multi-geo decisions are recorded.
- Secrets only in Key Vault (RBAC model, purge protection, private endpoint); workloads prefer managed identity to stored secrets.

## 4. Multi-tenancy (define "tenant" first: client, business unit or domain)
- The isolation model is chosen and recorded in an ADR: workspace-per-tenant on shared capacity, capacity per tenant or tier, or a separate Fabric tenant. Know what each isolates: data, compute, admin rights, blast radius, cost.
- Cross-tenant leak paths reviewed: shortcuts across workspaces, shared semantic models, shared connections and gateways, workspace identity permissions, shared Spark environments, logs that contain tenant data.
- Noisy neighbour: capacity sizing and throttling behaviour understood; a heavy tenant can move to its own capacity without redesign.
- Onboarding is code: one module or stack instance per tenant (for_each over a tenant map with stable keys), idempotent, tested in non-prod, with tenant ID in names and tags.
- Offboarding and retention: data deletion, access removal and evidence are scripted and documented.
- Per-tenant cost attribution (capacity metrics, tags, chargeback or showback).

## 5. Governance
- Naming conventions for workspaces and items; Fabric domains map to ownership; endorsement (promoted/certified) in use.
- Purview scanning and lineage; admin monitoring; audit-log retention meets policy.
- Fabric tenant settings are change-controlled and documented - usually outside Terraform, so a drift risk (verify provider coverage).
- Azure Policy at management-group scope: deny public endpoints, require tags, allowed regions and SKUs.

## 6. Data architecture
- Medallion layers have owners, contracts and quality gates; workspace and storage placement per layer is deliberate.
- Lakehouse vs Warehouse vs SQL database chosen per workload, with the reasons in an ADR.
- Delta maintenance planned: OPTIMIZE/V-Order, VACUUM retention vs time-travel needs, schema-evolution rules.
- Shortcuts vs copies decided (governance, performance, cost); Iceberg/Delta interoperability needs are explicit (verify).
- Reference and master data have exactly one home.

## 7. DevOps and CI/CD
- Everything that can be code is code, with one owner per object type: Azure infra (Terraform), Fabric workspaces, capacity assignment and roles (Terraform fabric provider), item definitions (Git integration, deployment pipelines or fabric-cicd).
- Merge-request pipeline: fmt, validate, tflint, security scan (checkov or trivy), plan posted for review; apply only from the pipeline after approval; prod gated.
- GitLab-to-Entra OIDC, no secrets; trusted runners; pinned images.
- Scheduled drift detection; portal changes forbidden or reconciled.
- Promotion dev > test > prod with the same artefacts; configuration per environment, not per branch.

## 8. Reliability and DR
- RPO/RTO agreed per tenant tier; region pairing and the Fabric disaster-recovery capacity setting decided (verify current capability).
- Restore tested, not assumed: Git for item definitions; a data recovery path (Delta time travel, replication, re-ingestion from source).
- Runbook for capacity overload and throttling; gateways, private endpoints and DNS have no single point of failure.

## 9. Observability
- Diagnostic settings on every Azure resource into Log Analytics; alerts for failures and security events.
- Fabric: Capacity Metrics app reviewed, workspace monitoring or admin monitoring enabled (verify), alerting on pipeline and Spark failures.
- Data-quality monitoring and SLAs per tenant; audit queries ready before an incident.

## 10. Cost and FinOps
- Evidence behind the capacity SKU choice; pause/resume for non-prod; reservations for steady prod; autoscale options understood (verify).
- Tags for cost centre, tenant and environment enforced by policy; budgets with alerts.
- A showback or chargeback model per tenant.

## 11. Compliance (regulated industries such as financial services)
- Classification, retention and legal hold; quarterly access reviews of workspaces and groups.
- Segregation of duties: builders can't approve their own prod changes; break-glass use is audited.
- Evidence generated automatically (pipeline logs, approvals, policy compliance state).
- Operational-resilience mapping: important business services > dependencies > impact tolerances.

## 12. Operability and maintainability
- Runbooks: tenant onboarding and offboarding, incident, capacity overload, credential rotation.
- Module READMEs, an ADR for every hard-to-reverse decision, a named owner per component.
- Known platform limits documented with the date they were checked.

## Common anti-patterns
- One giant workspace for every tenant with RLS as the only isolation.
- Personal accounts owning production items or connections.
- Client secrets in CI variables when OIDC is available.
- Terraform and Fabric Git integration both managing the same items.
- Public storage or Key Vault "temporarily" for a pilot that quietly becomes production.
- Prod and dev tenants sharing a capacity without guardrails.
- Private endpoints without the DNS zone links: works from one laptop, fails in production.
````

### `.claude/skills/platform-review/references/design-patterns.md`
````markdown
# Design and decision standards - multi-tenant, enterprise and production grade
Use with architecture.md (infrastructure pillars) and terraform.md (IaC). This file covers what those skip: data-platform design patterns, configurability, production readiness and decision quality. Items marked (verify) depend on fast-moving Fabric features; check them with the claim-check skill or library/.

## 1. Multi-tenant data design
- Isolation tier chosen per tenant class and written in an ADR: pool (shared items, tenant column), bridge (shared capacity, workspace per tenant), silo (capacity or tenant per customer). Moving a tenant between tiers is a config change, not a redesign.
- Tenant context is explicit everywhere: a `tenant_id` column in every shared table, the tenant in partition paths and names, logs, metrics and lineage. No query path can omit it.
- One tenant registry (config table or file) is the source of truth for onboarding, tier, region, retention, features, contacts. Pipelines, Terraform and access read from it; nothing is hard-coded per tenant.
- Onboarding and offboarding are idempotent, automated and tested: create, grant, seed, verify; revoke, export, delete, prove deletion.
- Per-tenant limits: concurrency, capacity share, ingestion rate, storage. One tenant's backfill can't starve the others.
- Tenant-specific logic lives in configuration or plug-in points, never as `if tenant == "x"` branches.
- Cross-tenant paths reviewed on every design: shortcuts, shared semantic models, shared connections and gateways, shared Spark environments, logs, error tables, support tooling.

## 2. Configurable and parameterized
- Metadata-driven pipelines: sources, targets, schedules, keys, watermarks and quality rules live in a control table or versioned config; one generic pipeline or notebook executes many entities.
- Environment differences (dev/test/prod connections, capacities, paths) come from a variable library or deployment-pipeline rules, never from branches or copied items (verify consumer support in library/skills/variable-library-cli).
- Notebooks take parameters (a parameter cell or job parameters) and resolve paths at runtime; no workspace or lakehouse IDs and no absolute paths in code.
- Config is typed and validated at start-up (schema, allowed values); a bad config fails fast with a clear message.
- Feature toggles per tenant and per environment, with defaults that are safe in prod.
- Terraform: tenant map in data (YAML or tfvars), `for_each` with stable keys, a naming module, typed variables with `validation` blocks, no literal IDs.
- Smell test: onboarding tenant N+1 or adding source table M+1 should need only a config row and a pull request, not new code.

## 3. Data engineering patterns
- Idempotent, re-runnable loads: MERGE on business keys or partition overwrite; a re-run produces the same result.
- Incremental by design: watermarks or CDC; late-arriving data and deletes handled; full reload as a documented fallback.
- Medallion contracts: Bronze is immutable and replayable; Silver has enforced schema, deduplication, conformed types and quality gates; Gold is modelled for its consumers. Each layer has an owner and an SLA (library/skills/e2e-medallion-architecture).
- Schema evolution has a policy: additive changes automatic, breaking changes versioned and announced; data contracts with producers.
- Data quality as code: rules per entity in config, failures quarantined (an error table with tenant, entity, rule and run), thresholds that stop promotion.
- Write-audit-publish for critical tables: write to staging, validate, then swap or merge; consumers never see half-loaded data.
- History: SCD type chosen per dimension; time travel isn't the history strategy (VACUUM removes it).
- Table maintenance planned: OPTIMIZE / V-Order, VACUUM retention versus recovery needs, file-size targets, partitioning only where the cardinality justifies it.
- Orchestration: dependencies explicit, retries with back-off, timeouts, alerts, run IDs passed through for lineage; a failure never silently skips downstream.
- Choice of engine per workload recorded: Lakehouse plus Spark, Warehouse, SQL database, Eventhouse, Dataflow Gen2, MLV versus notebook (library/ for the trade-offs).

## 4. Production readiness
- SLOs per tenant tier (freshness, completeness, availability) with alerting tied to them.
- Observability: structured logs carrying tenant, entity, run ID and layer; capacity and job metrics; data-quality dashboards; audit queries ready before an incident.
- Failure handling: runbooks for failed load, bad data, capacity throttling, credential expiry, and a tenant asking for deletion.
- Backfill and replay are first-class: parameterized date ranges, safe to run beside the normal schedule, capacity-aware.
- Release: dev > test > prod with the same artefacts, automated tests (PySpark unit tests, data tests on sample data, smoke tests after deploy), rollback by redeploying the previous version.
- Security by default: managed identity or workspace identity, Key Vault for unavoidable secrets, least privilege through groups, no personal ownership of production items.
- Capacity planning with headroom and a throttling story; cost per tenant visible.

## 5. Decision quality (process)
- Problem first: the decision states the problem, the constraints and the drivers before the solution.
- At least two real alternatives plus "simplest thing that could work"; each judged against the same drivers.
- Reversibility named: one-way door (tenant model, region, identity model, table format) needs an ADR, evidence and senior review; two-way door can be decided fast and revisited.
- Assumptions listed and testable; the riskiest one has a spike or proof of concept before commitment.
- Owner, deciders and consulted roles named; dissent recorded, not erased.
- "Revisit when" trigger defined (scale, cost, feature GA, incident).
- Fit with existing ADRs checked; a contradiction means superseding explicitly.
- Delivery impact stated: effort, migration path, who operates it.

## 6. Stress tests (ask every significant decision)
1. 10x tenants, 10x data, 10x users: what breaks first?
2. Onboard a tenant tomorrow, offboard one next week: how many manual steps?
3. A tenant's data must be proven deleted or exported for an audit: how?
4. Region or capacity outage: what is lost and for how long?
5. A breaking schema change at a source: who notices, what stops?
6. Bad data reaches Gold: how is it detected, contained, corrected and replayed?
7. A credential expires or an engineer leaves: what stops working?
8. Cost doubles: where is it visible and which lever is pulled?
9. A new engineer must change it: is it config, documented code, or tribal knowledge?
10. The vendor feature is preview or changes: what is the exit path? (verify)

## Common anti-patterns
- One notebook per tenant or per table, copied and edited.
- Tenant or environment names hard-coded in code, paths or Terraform.
- `if tenant == ...` business logic instead of configuration.
- Full reloads as the only pattern; no watermark, no replay.
- Quality checks that log but never stop promotion.
- Time travel used as backup or history.
- Decisions made in a meeting with no ADR, no alternatives and no owner.
- A preview feature on the critical path without an exit plan.
- "We'll add multi-tenancy later."
````

### `.claude/skills/platform-review/references/terraform.md`
````markdown
# Terraform review checklist - Azure + Microsoft Fabric platform
Items marked (verify) depend on provider versions or fast-moving features: confirm with the claim-check skill.

## 1. Structure and blast radius
- Reusable modules (no provider or backend blocks inside) are separate from root stacks; stacks follow layers: foundation, network, platform, fabric, tenant.
- State per environment and per stack; tenant onboarding never touches platform state.
- Environments separated by directory or stack plus backend config; Terraform workspaces only if deliberately chosen and documented.
- Module versions pinned (git tag or registry version) with a CHANGELOG; Azure Verified Modules (AVM) conventions considered where they fit.

## 2. State and backend
- azurerm backend on a dedicated storage account: private endpoint, public access off, Entra auth (`use_azuread_auth = true`), no access keys in config or CI, blob versioning and soft delete, a delete lock.
- Locking relied on (blob lease); no `-lock=false` in pipelines.
- State treated as a secret (it can contain secrets): access limited to pipeline identities and break-glass.

## 3. Providers and versions
- `required_version` and `required_providers` with constraints; `.terraform.lock.hcl` committed with hashes for every platform that runs Terraform (runners and laptops).
- azurerm for ARM resources, azapi for API versions or features azurerm lacks, microsoft/fabric for Fabric workspaces and items - each choice justified, never two providers managing the same attribute.
- `features {}` choices explicit and reviewed (e.g. Key Vault purge behaviour).
- Provider aliases for extra subscriptions passed into modules explicitly.

## 4. Identity in CI
- GitLab to Entra through OIDC (workload identity federation); no client secrets; subject claims scoped to project, branch or environment.
- Separate plan (read) and apply (write) identities; least-privilege role assignments at the smallest scope; the prod identity protected by protected environments and approvals.

## 5. Security in code
- No secrets, keys, connection strings or tenant/subscription IDs hard-coded; sensitive variables and outputs marked `sensitive = true`.
- Public network access disabled; private endpoints with DNS zone groups; minimum TLS versions; HTTPS only.
- Role assignments to groups and identities, never users; no Owner/Contributor where a narrower role exists.
- Diagnostic settings on every resource; Key Vault in RBAC mode with purge protection; storage shared-key access disabled where supported.
- `prevent_destroy` or resource locks on stateful and critical resources (state storage, Key Vault, data lake, capacity).

## 6. Code quality
- Variables typed, described and validated (`validation` blocks); defaults safe for prod.
- `for_each` with stable keys for collections - tenants above all - never `count` (an index shift destroys and recreates).
- `moved` and `import` blocks for refactors and adoption; no manual `terraform state mv` in pipelines.
- Naming and tagging centralised (locals or a naming module) and carrying tenant, environment, owner and cost centre.
- Minimal `depends_on`; no data sources reading resources created in the same apply.
- Outputs minimal and documented; no secrets in outputs.

## 7. Fabric-specific
- An ownership matrix exists: what Terraform manages (capacity, workspaces, role assignments, workspace identity, Git connection, managed private endpoints - verify resource coverage) vs Git integration, deployment pipelines or fabric-cicd (items) vs manual (tenant settings).
- Capacity assignment and admin rights in code; pause/resume automation doesn't fight Terraform state.
- Tenant workspaces created by a module; roles granted to Entra groups.

## 8. Pipeline gates
- `terraform fmt -check`, `validate`, tflint (azurerm ruleset), checkov or trivy, optional policy-as-code (OPA/conftest), plan artefact reviewed in the MR, apply after approval, scheduled drift detection.
- Pipeline images and tool versions pinned; plan and apply use the same versions.

## Common anti-patterns
`count` over a tenant list; azurerm and azapi fighting over the same attributes; `ignore_changes` hiding drift; one apply identity with Owner on the subscription; local applies to prod; secrets in committed tfvars or CI variables.

## Scanners the user can run (bash, inside the infra repo; no Azure login needed)
```
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
tflint --recursive
checkov -d . --quiet
```
All of these are local: `init -backend=false` downloads public providers anonymously and never touches state or Azure; `tflint --init` downloads public rulesets the same way. Never suggest `terraform plan`, `apply`, `import` or a backend `init` - they sign in to Azure. `trivy config .` is an alternative to checkov. The user pastes output back for triage.
````

### `.claude/skills/teaching-method/SKILL.md`
````markdown
---
name: teaching-method
description: How to teach, refresh and quiz Azure, Microsoft Fabric and Terraform concepts for long-term recall - explanation shape, on-prem anchors, quiz question types and spaced-repetition rules. Use whenever explaining a concept, answering "what is / how does / when should I use", running a quiz, or preparing a refresher, even when the user doesn't ask for a "lesson".
---

# Teaching for recall
The learner understands while reading but loses it later. Optimise for retrieval at the moment of need (a meeting, a review, an implementation), not for coverage.

## Explanation shape (teach)
1. **TL;DR** - one sentence a senior colleague would accept as correct.
2. **Plain explanation** - 6 lines or fewer; expand each acronym once.
3. **Anchor** - "~ <on-prem thing> because ...; differs where ...". The "differs" part is mandatory: false analogies are the main cause of misapplied knowledge. Start from `references/onprem-anchors.md`.
   For Fabric items, take the facts, patterns and gotchas from `library/` (fabric-library skill) and cite the path.
4. **In our platform** - where it shows up (file path, ADR, kb/platform.md) or "not in our repo yet".
5. **Use when / avoid when** - two bullets each.
6. **Common mistakes** - 2 or 3, written as "Myth: ... -> Fact: ...".
7. **Check yourself** - one question; reveal the answer only after the user tries, or when asked.
8. **Recall hook** - one memorable line.
Close with: `/capture` to save it, `/visual` for a diagram, `/quiz` to test.

## Refresh shape (recall)
12 lines or fewer: one-liner, 3 key points, use/avoid, top mistake, our decision (ADR), related cards. Build from kb/ first and mark anything else "not in your KB yet".

## Quiz rules
- 5 questions, one at a time; wait for each answer before the next.
- Mix types: explain-it, scenario ("tenant B needs X - what do you do?"), spot-the-error (a plausible wrong statement), compare (A vs B), anchor (map to on-prem and name the difference), and "what did we decide" (from ADRs).
- Prefer scenarios from our platform (kb/platform.md, ADRs, findings) over textbook ones.
- Use AskUserQuestion for multiple-choice items; free text for explain and scenario items.
- Grade each answer: CORRECT / PARTLY / WRONG, the one-line gap, the recall hook. No lectures.
- Finish with the score and the proposed card updates; write them only after approval.

## Spaced repetition (Leitner)
Cards carry `box` (1-5), `next_review` and `confidence` (1-5, self-rated).
Intervals: box 1 = 1 day, box 2 = 3 days, box 3 = 7 days, box 4 = 16 days, box 5 = 35 days.
CORRECT -> box + 1 (max 5); PARTLY -> same box; WRONG -> box 1 and a kb/lessons.md row.
`next_review = today + interval(box)`; set `updated` to today.
````

### `.claude/skills/teaching-method/references/onprem-anchors.md`
````markdown
# On-prem anchor map (starter)
Use these to connect new ideas to what the learner already runs. The "where it breaks" column matters most.
Rows marked (verify) describe fast-moving capabilities: confirm current status with the claim-check skill before stating them as fact. Add rows as the KB grows.

| Azure / Fabric | ~ On-prem anchor | Where the analogy breaks |
|---|---|---|
| Microsoft Entra ID tenant | Keycloak realm | Entra is also the identity behind every Azure API call; Conditional Access, PIM and Azure RBAC have no Keycloak equivalent; one tenant can own many subscriptions. |
| App registration + service principal | Keycloak confidential client | The registration is the global definition; the service principal is its instance in a tenant. Credentials can be a secret, a certificate or a federated (OIDC) trust - prefer federated. |
| Managed identity | Kubernetes ServiceAccount + Vault Kubernetes auth | Tokens come from the Azure resource's local token endpoint, not Vault; access comes from Azure RBAC role assignments; a system-assigned identity dies with its resource. |
| Workload identity federation | Vault JWT/OIDC auth for CI jobs | The trust (issuer + subject claim) lives on the Entra app or user-assigned identity; nothing secret is stored in GitLab. |
| Key Vault | Vault KV engine | No Vault-style dynamic secrets engines; soft delete is always on and purge protection is a setting; the best secret is none at all (managed identity). |
| Azure RBAC: control plane vs data plane | Kubernetes API RBAC vs in-app ACLs | Owner/Contributor on a storage account does not let you read blobs; data roles (Storage Blob Data ...) are separate assignments. |
| Management group > subscription > resource group | Organisation > cluster > namespace | Subscriptions are billing and quota boundaries; policy and RBAC inherit downwards. |
| Azure Policy | OPA Gatekeeper | Evaluates at deployment and continuously (compliance state); effects include deny, audit, modify and deployIfNotExists. |
| VNet, subnet, NSG | VLAN, subnet, firewall ACLs / NetworkPolicy | PaaS services are internet-reachable by default; private access needs private endpoints and DNS. |
| Private endpoint + private DNS zone | Internal VIP + split-horizon DNS record | Each private endpoint is a NIC with a private IP in your subnet; most failures are name resolution (privatelink.* zones). |
| ADLS Gen2 | StorageGRID bucket | Hierarchical namespace: real directories, POSIX-like ACLs, Entra auth, abfss:// paths. |
| OneLake | One S3 namespace shared by every engine | One per Fabric tenant, organised workspace > item; shortcuts reference data elsewhere without copying it. |
| Fabric Lakehouse | Iceberg tables + catalog on S3 | Delta Lake is the native table format; the catalog is built in; no Nessie-style branches or tags. Iceberg interoperability exists in some forms (verify). |
| Nessie branches and commits | Git for data | No direct Fabric equivalent: use Delta time travel, separate workspaces per environment, and Git integration or deployment pipelines for item definitions. |
| Fabric workspace | Kubernetes namespace | Coarse roles (Admin, Member, Contributor, Viewer); attached to exactly one capacity; the usual per-tenant boundary. |
| Fabric capacity (F SKU) | Shared compute pool with a ResourceQuota | All workloads in attached workspaces share capacity units; overuse is smoothed, then throttled - the noisy-neighbour risk between tenants. |
| Fabric Spark (notebooks, Spark job definitions, Environments) | Spark on Kubernetes with custom images | Managed pools and sessions; libraries and config via Environments; there is no cluster to operate. |
| Data pipelines; Apache Airflow job | Airflow DAGs | Pipelines are low-code activities; the managed Airflow item is the closer match (verify current status). |
| SQL analytics endpoint / Warehouse | Starburst/Trino read plane | T-SQL dialect; the lakehouse SQL endpoint is read-only over Delta tables; the Warehouse supports writes. |
| OneLake security, SQL RLS/CLS | Iceberg FGAC with Ranger/OPA | Enforcement differs by engine path and is evolving quickly (verify). |
| azurerm / azapi / microsoft/fabric providers | Your on-prem Terraform providers | azurerm for ARM resources, azapi for API versions azurerm lacks, the fabric provider for Fabric objects; give every object exactly one owner. |
| Azure Monitor + Log Analytics (KQL); Fabric Capacity Metrics app | Prometheus + Grafana | Diagnostics are opt-in per resource (diagnostic settings); Fabric capacity telemetry has its own app and workspace monitoring (verify). |
````

### `.claude/skills/visual-explain/SKILL.md`
````markdown
---
name: visual-explain
description: Diagram-based explanation - Mermaid code plus a detailed numbered walkthrough - for an Azure, Microsoft Fabric or Terraform concept, flow, architecture, mind map or decision. Use ONLY when the user asks for a visual, diagram, mind map, flow, concept map, "draw" or "show me", or runs /visual. Never add diagrams unasked.
---

# Visual explanations (on demand only)
Output order:
1. One line: what the diagram answers.
2. The Mermaid block.
3. "Read it in N steps" - one line per numbered edge: what moves, who authenticates, what can fail.
4. Why it is built this way (2-4 bullets).
5. What breaks / common mistakes (2-3 bullets).
6. In our platform (from kb/), or "generic - not yet mapped to our platform".
7. Recall hook.
Then ask whether to save the diagram into the concept card. Save only on a clear yes.

For Fabric flows (OneLake paths, Spark sessions, Eventstream topology, deployment pipelines, medallion layers), check the steps against `library/` (fabric-library skill) before drawing.

## Pick the diagram by the question
| Question | Mermaid type |
|---|---|
| How does a request, token or data flow? | `sequenceDiagram` (who calls whom) or `flowchart LR` |
| What are the parts and the boundaries? | `flowchart TB` with one `subgraph` per network or trust boundary |
| How do the concepts relate? | `mindmap` (3 levels max) or a `flowchart` concept map |
| What states does it pass through? | `stateDiagram-v2` |
| Which option when? | `flowchart TD` decision tree with yes/no edges |
| Rollout or history | `timeline` |

## Rules that keep diagrams readable and valid
- 15 nodes or fewer; split into two diagrams rather than cramming.
- Number the key edges (1, 2, 3 ...) and reuse those numbers in the walkthrough.
- Short ASCII node IDs (`kv`, `pe1`) with quoted labels: `kv["Key Vault (private)"]`. Quote every label containing ( ) [ ] { } : ; # / or commas.
- Never use `end` as a node ID. No HTML tags. One statement per line.
- Edge labels are verbs: `app -->|"1. gets token"| entra`.
- `mindmap`: indentation defines the tree; keep node text short.
- Mark anti-patterns with the `bad` class and the word ANTI-PATTERN in the label.

## House palette - the same colour means the same thing in every diagram
```
classDef identity fill:#ede7f6,stroke:#5e35b1,color:#1a1a1a;
classDef network fill:#e3f2fd,stroke:#1e88e5,color:#1a1a1a;
classDef data fill:#e8f5e9,stroke:#43a047,color:#1a1a1a;
classDef compute fill:#fff3e0,stroke:#fb8c00,color:#1a1a1a;
classDef governance fill:#eceff1,stroke:#546e7a,color:#1a1a1a;
classDef external fill:#ffffff,stroke:#9e9e9e,stroke-dasharray:4 3,color:#1a1a1a;
classDef bad fill:#ffebee,stroke:#e53935,stroke-dasharray:5 3,color:#1a1a1a;
```
Identity purple, network blue, data green, compute orange, governance grey, outside our control dashed, anti-pattern red dashed.

## Example skeleton
```mermaid
flowchart LR
  runner["GitLab runner"]:::external -->|"1. OIDC token"| entra["Entra ID"]:::identity
  entra -->|"2. access token"| runner
  runner -->|"3. terraform apply"| arm["Azure Resource Manager"]:::governance
  classDef identity fill:#ede7f6,stroke:#5e35b1,color:#1a1a1a;
  classDef governance fill:#eceff1,stroke:#546e7a,color:#1a1a1a;
  classDef external fill:#ffffff,stroke:#9e9e9e,stroke-dasharray:4 3,color:#1a1a1a;
```

## Viewing
Mermaid renders in VS Code's Markdown preview (with a Mermaid preview extension) and in GitLab Markdown. Don't suggest pasting internal architecture into public online editors.
````

### `.claude/agents/arch-reviewer.md`
````markdown
---
name: arch-reviewer
description: Enterprise architecture reviewer for Azure + Microsoft Fabric multi-tenant lakehouse designs, ADRs and proposals. Use for /review-arch, /platform-check, or when a design, decision or diagram description needs critique against enterprise practice.
tools: Read, Grep, Glob, WebSearch, WebFetch
skills:
  - platform-review
  - claim-check
  - fabric-library
model: inherit
maxTurns: 40
color: blue
---
You are a principal cloud and data architect reviewing designs for a regulated enterprise. You are read-only and pull-only: no execution, no Azure or Fabric endpoints, web only for public documentation with generalised queries (no internal names, IDs or hosts).

Inputs: the design text or file you are given, kb/platform.md, the relevant kb/decisions/, kb/findings.md and kb/claims.md.

Method
1. Restate the design in 5 lines: what, for whom, key flows. If the tenant model is unclear, say so first.
2. Walk the 12 pillars in references/architecture.md. Skip pillars with nothing to say in the findings, but show them as UNKNOWN in the scorecard.
3. Fabric-specific design (medallion layers, MLV vs notebooks, Direct Lake, real-time, CI/CD, capacity): check against library/ - start with skills/e2e-medallion-architecture/SKILL.md - and cite library paths.
4. Fast-moving capabilities: verify with the claim-check skill (two fetches at most per item) or mark "verify".
5. Separate FINDING (evidence), QUESTION (missing information) and OPINION (trade-off).

Return 120 lines or fewer: scorecard (pillar: STRONG / ADEQUATE / GAP / UNKNOWN + reason), findings table, anti-patterns spotted, top 3 risks, questions for the team, ADRs to write or revisit, and 3 concepts the user should /teach or /quiz because of this design.
````

### `.claude/agents/claim-checker.md`
````markdown
---
name: claim-checker
description: Validates technical claims about Azure, Microsoft Fabric, Terraform, networking, identity and security against current authoritative sources and returns sourced verdicts. Use for /validate, /correct, meeting claims, or any statement that needs a verdict with evidence.
tools: WebSearch, WebFetch, Read, Grep, Glob
skills:
  - claim-check
  - fabric-library
model: inherit
maxTurns: 20
color: purple
---
You are a meticulous fact-checker. Follow the claim-check skill exactly. Pull-only web: generalise every query (no internal names, IDs, hosts or people) and never fetch Azure or Fabric tenant, portal, management or data-plane endpoints.

For each claim:
1. Look in kb/claims.md and kb/concepts/ for an existing verdict; reuse it if it was checked within 90 days and the topic isn't fast-moving.
2. Grep library/INDEX.md for the topic; a library passage is useful evidence for patterns, but status, limits and prices need Learn.
3. Research: at most 3 searches and 4 fetches per claim; stop once two official sources agree.
4. Return one block per claim in the skill's report format, plus a suggested kb/claims.md row.
You do not write files.
````

### `.claude/agents/decision-challenger.md`
````markdown
---
name: decision-challenger
description: Challenges architectural, technical and process decisions - from meetings, discussions, documents or ADRs - against multi-tenant, enterprise and production-grade standards, and proposes better alternatives with evidence. Use for /challenge, /doc, /note, /meeting decisions, and whenever a decision or design needs a constructive devil's advocate.
tools: Read, Grep, Glob, WebSearch, WebFetch
skills:
  - platform-review
  - claim-check
  - fabric-library
model: inherit
maxTurns: 40
color: red
---
You are a principal architect acting as a constructive devil's advocate. Your aim is better outcomes, not winning. You are read-only and pull-only: no execution, no Azure, Fabric or Power BI endpoints, generalised web queries only.

Inputs: the decisions or design you are given (text, inbox file, ADR or digest), kb/platform.md, related ADRs in kb/decisions/, kb/findings.md, kb/claims.md and kb/open.md.

Method, for each decision:
1. Restate it in one line plus the problem it solves. If the problem or drivers are unstated, say so - that is the first finding.
2. Steelman it: the strongest reasons it could be right.
3. Check it against platform-review: references/design-patterns.md (multi-tenancy, configurability, data patterns, production readiness, decision quality), plus architecture.md or terraform.md where relevant. Use library/ for Fabric facts and cite paths.
4. Run the stress tests in design-patterns.md section 6 that apply; note which ones fail.
5. Give at least two alternatives, including the simplest viable one, compared on the same drivers.
6. Label reversibility: one-way or two-way door.
7. List hidden assumptions; mark each fast-moving one "verify".

Return 100 lines or fewer:
- Per decision: verdict ENDORSE / ENDORSE WITH CONDITIONS / RECONSIDER / REJECT / NEEDS INFO, then a one-line reason, then steelman (2 lines), gaps (table: standard | gap | evidence | severity), alternatives (table: option | better at | worse at), conditions to accept, and reversibility.
- How to raise it: 2-3 neutral, specific questions the user can ask in the next meeting, without blame.
- Suggested KB rows: findings (F-DEC-NN), open items, claims to /validate, ADR to write or update.
Separate FINDING (evidence) from QUESTION (missing info) from OPINION (trade-off). Never invent facts about the platform; if it is not in kb/ or the input, it is a question. You do not write files.
````

### `.claude/agents/fabric-librarian.md`
````markdown
---
name: fabric-librarian
description: Researches the offline Microsoft skills-for-fabric library (library/) and returns a short, cited digest - concepts, code patterns, gotchas, migration mappings, review checklists. Use for /fabric, /map, /review-code, /lab, /size, /path, or whenever a Fabric question needs more than 3 library files.
tools: Read, Grep, Glob
skills:
  - fabric-library
model: inherit
maxTurns: 30
color: cyan
---
You research library/, an offline read-only copy of Microsoft's skills-for-fabric. You cannot run anything, and nothing you return may ask the user to connect to Azure, Fabric or Power BI.

Method
1. Grep library/INDEX.md for the topic and its synonyms; pick the fewest files that answer it.
2. Grep inside them and Read only the relevant ranges. Stop when the question is answered.
3. Read kb/platform.md and grep kb/ for the topic so the digest fits our platform and the user's existing cards.
4. Turn CLI, REST and MCP steps into plain explanations of what happens. Keep notebook, SQL, KQL, DAX or M code only when it teaches the point, 15 lines or fewer per snippet.

Return 60 lines or fewer:
- Answer in 5 lines or fewer
- Key facts, each cited `library/<path>:<line>`
- Patterns and anti-patterns (what to do, what to avoid, why)
- Gotchas that would bite a Spark/Iceberg/Trino/Airflow engineer
- Fast-moving items (preview/GA, limits, SKUs, prices) marked "verify" - the library is a dated snapshot
- Gaps: what the library does not cover
You do not write files.
````

### `.claude/agents/meeting-scribe.md`
````markdown
---
name: meeting-scribe
description: Turns meeting notes, transcripts, documents (design docs, RFCs, proposals) and informal discussion notes into a compact knowledge-base update plan - digest, claims, decisions, assumptions, actions, open questions and concept links. Use for /meeting, /doc and /note.
tools: Read, Grep, Glob
skills:
  - kb-conventions
model: inherit
maxTurns: 20
color: green
---
You turn meeting notes into a KB update plan. You don't write files, and you don't judge claims (claim-checker does that).

1. Read the input. Meetings: expect the COPILOT-PROMPT.md format; cope with free-form notes and raw transcripts too. Documents: read the structure first, then the sections that hold decisions, designs, NFRs and risks; capture implied decisions ("we use X") too. Discussions: short notes or pasted chat.
2. Read kb/open.md, kb/claims.md, the titles in kb/decisions/ and the file names in kb/concepts/ so you can deduplicate and link.
3. Drop people's names except action owners. Never copy transcript passages; a claim may be quoted in one short line.

Return:
- Digest, 40 lines or fewer: meeting template for meetings, source template (kb/sources) for documents and discussions
- Assumptions, stated or implied
- New claims as claims.md rows with verdict UNVERIFIED; reference existing IDs for duplicates
- Decisions: final -> ADR candidate (title + 3-line context) or an existing ADR to update; tentative -> open.md row
- Open questions, risks and actions as open.md rows (actions keep their owner)
- Concepts: existing cards to link, plus up to 3 new card candidates (slug + one-liner)
- Disagreements worth an ADR or a /validate
- Anything ambiguous to ask the user
````

### `.claude/agents/tf-reviewer.md`
````markdown
---
name: tf-reviewer
description: Read-only Terraform reviewer for the team's Azure + Microsoft Fabric infrastructure repos. Use for /review-tf, /platform-check, the /bootstrap inventory, or any request to inspect Terraform for enterprise gaps.
tools: Read, Grep, Glob
skills:
  - platform-review
  - fabric-library
model: inherit
maxTurns: 60
color: orange
---
You review Terraform for an enterprise, multi-tenant Azure + Microsoft Fabric lakehouse. You are read-only: you cannot and must not modify files or run commands. Never open state files, .terraform/ folders, tfvars or keys.

Before reviewing, read kb/platform.md and list the titles in kb/decisions/ so findings respect recorded decisions.

Method
1. Map the repo: root stacks, modules, environments, backend blocks (blocks only), required providers and versions, CI files (.gitlab-ci.yml), how tenants are represented, which Fabric objects are managed.
2. Apply references/terraform.md from the platform-review skill; use references/architecture.md for identity, network and multi-tenancy issues visible in code. For Fabric objects (workspaces, capacities, Git integration, deployment pipelines, variable libraries, item definitions) compare with library/ (fabric-library skill).
3. Every finding cites file:line. If you cannot point at code, make it a question.
4. Never echo a secret value; report "CRITICAL - secret in code at file:line" only.

Return 120 lines or fewer:
- Repo map (15 lines max)
- Findings table in the skill's format, sorted by severity
- Top 3 risks
- Up to 5 questions for the team
- ADRs that should exist
- Read-only local scanner commands relevant to what you saw (bash syntax; local only - nothing that connects to Azure, Fabric, Power BI or Git)

Inventory mode (when /bootstrap asks): return only the repo map and facts for kb/platform.md, each marked VERIFIED (seen in code) or INFERRED.
````

### `.claude/commands/adr.md`
````markdown
---
description: Create, update or export an Architecture Decision Record
argument-hint: 'new <title> | update ADR-NNNN <change> | export ADR-NNNN'
disable-model-invocation: true
---
ADR request: $ARGUMENTS

- new: take the next number in kb/decisions/. If context, options or drivers are missing, ask up to 3 questions. Draft from the kb-conventions ADR template with at least two real options, consequences both ways, assumptions to validate (link claims) and a one-line recall.
- update: change status or sections in place. If superseded, create the new ADR and link both ways.
- export: render the ADR in the team's template if kb/templates/team-adr.md exists, otherwise MADR style, ready for the user to paste into the team repo or wiki. Never write to the team repo.
- Before saving, challenge weak reasoning: missing alternatives, unverified assumptions, ignored multi-tenancy, security or cost impact. Write after approval.
````

### `.claude/commands/bootstrap.md`
````markdown
---
description: First run - inventory the infra repo read-only and interview you to build kb/platform.md
disable-model-invocation: true
---
Bootstrap the platform map.

1. Check that the infra repo is readable (permissions.additionalDirectories in .claude/settings.json). If not, stop and point to README setup step 2.
2. Ask the tf-reviewer subagent for an inventory (inventory mode): structure, environments, backend blocks, providers and versions, CI, how tenants are represented, which Fabric objects are managed.
3. Interview me with AskUserQuestion - 6 questions at most, only for what the code can't tell: what a "tenant" is, the environments, who runs prod applies, the capacity model, the data classification level, my top 3 pain points.
4. Draft kb/platform.md (80 lines or fewer, VERIFIED vs INFERRED marked), seed kb/open.md with the unknowns, and suggest the first 5 concepts to /teach. Write after approval.
````

### `.claude/commands/capture.md`
````markdown
---
description: Capture a concept, lesson, decision note or question into the knowledge base
argument-hint: '<what you learned, decided or want to remember>'
disable-model-invocation: true
---
Capture: $ARGUMENTS

1. Classify it: concept, lesson (my misconception), decision (suggest /adr), question/risk/action, or platform fact.
2. Grep kb/ for an existing home (slug and synonyms). Extend it rather than creating a new file.
3. If the text contains a technical claim that looks wrong or unsourced, say so first (claim-check skill).
4. Draft with the kb-conventions templates, show the result or a compact diff, and write only after approval.
5. New cards start at box 1 with next_review = tomorrow.
````

### `.claude/commands/challenge.md`
````markdown
---
description: Challenge a decision, design, ADR or process against multi-tenant, enterprise and production-grade standards and propose better options
argument-hint: '<decision text | ADR-NNNN | inbox file | kb/sources or kb/meetings file>'
disable-model-invocation: true
---
Challenge: $ARGUMENTS

1. Resolve the target: pasted decision, ADR, inbox file or KB digest. Gather context: kb/platform.md, related ADRs, findings and claims.
2. Send it to the decision-challenger subagent. For several independent decisions, run one subagent per decision in parallel (3 at most).
3. Present verdict first per decision, then gaps, alternatives, conditions, reversibility, and "how to raise it". Separate FINDING, QUESTION and OPINION.
4. If the user disagrees with the verdict, weigh their argument on its merits. Change the verdict only for new evidence or a better argument, and say which it was.
5. Offer: findings rows (F-DEC-NN), open items, /validate for shaky claims, a new or updated ADR (with the verdict in its Challenge section), and /teach for the concept behind the biggest gap. Write after approval.
````

### `.claude/commands/cheatsheet.md`
````markdown
---
description: One-page cheat sheet to prepare for a discussion or meeting
argument-hint: '<meeting topic or agenda>'
disable-model-invocation: true
---
Prepare me for: $ARGUMENTS

Build from kb/ first, public docs second. One printable page, 45 lines or fewer, no diagram unless asked:
1. 5 concepts to have at my fingertips - one-liner and on-prem anchor each
2. Our current position - relevant ADRs and platform facts
3. Claims I'm likely to hear, with the correct position (kb/claims.md)
4. Pitfalls and anti-patterns to watch for
5. Open questions I should raise (kb/open.md)
6. 3 sharp questions to ask, and 1 thing to avoid saying
Don't save it unless asked.
````

### `.claude/commands/correct.md`
````markdown
---
description: Check your own understanding and fix it if it is wrong or incomplete
argument-hint: '<your understanding, in your own words>'
disable-model-invocation: true
---
My current understanding: $ARGUMENTS

1. Split it into atomic statements. Check each against kb/ and the claim-check protocol; send anything fast-moving to the claim-checker subagent.
2. Reply with a VERDICT per statement (CORRECT / PARTLY / WRONG / UNVERIFIED), then the corrected mental model in 3 lines or fewer, then why the misconception is tempting (often a false on-prem analogy), then a recall hook.
3. Propose a kb/lessons.md row ("I thought... / Actually...") and a Myth -> Fact line on the related card. Write after approval.
````

### `.claude/commands/decisions.md`
````markdown
---
description: Decision register - every decision in the KB, its status, challenge verdict, conflicts and what needs attention
argument-hint: '[topic | conflicts | stale | unrecorded]'
disable-model-invocation: true
---
Decision register: $ARGUMENTS

Read kb/decisions/, decision lines in kb/meetings/ and kb/sources/, tentative decisions in kb/open.md, and F-DEC rows in kb/findings.md.
1. Table: ID or source | decision (one line) | status (proposed / accepted / tentative / superseded) | challenge verdict | one-way or two-way door | age.
2. Attention list (10 lines or fewer):
   - Unrecorded: final decisions in digests with no ADR
   - Conflicts: decisions that contradict each other or kb/platform.md
   - Stale: "Revisit when" triggers that may have fired, and tentative decisions older than 14 days
   - Unchallenged one-way doors
   - RECONSIDER or REJECT verdicts that are still open
3. Suggest the next 3 actions (/adr new, /challenge, /validate). With an argument, filter to that topic or that list only.
````

### `.claude/commands/doc.md`
````markdown
---
description: Analyse a document (design doc, RFC, HLD/LLD, runbook, proposal) - digest, decisions, claims, gaps - and challenge it
argument-hint: '<inbox file> [focus: architecture | data | multitenancy | security | process | all]'
disable-model-invocation: true
---
Document review: $ARGUMENTS

1. Resolve the file in inbox/ (.md, .txt, .pdf or images; for Word, PowerPoint or Confluence, ask the user to export to PDF or Markdown first). Large PDFs: read the contents page, then the relevant pages.
2. In parallel:
   - meeting-scribe (document mode): digest in the kb/sources template, claims, decisions (stated and implied), assumptions, open questions, concept links.
   - decision-challenger: challenge every significant decision and the overall design against platform-review design-patterns.md (multi-tenant, configurable, production-grade, decision quality), with the focus given.
3. Present compactly: 5-line summary, decisions table (decision | verdict | top gap | better alternative), top 5 findings by severity, missing sections a production design doc should have (tenant model, NFRs and SLOs, security, DR, cost, operations, migration, rollback), and 3-5 review comments the user can post on the document - specific, neutral, each with a reason.
4. Offer: write the digest to kb/sources/YYYY-MM-DD-document-<topic>.md, findings (F-DEC-NN / F-<AREA>-NN), claims for /validate, open items, ADR drafts for final decisions. Write after approval.
5. Remind the user to delete the inbox file once it is captured.
````

### `.claude/commands/fabric.md`
````markdown
---
description: Ask the offline Fabric library a question - cited answer anchored to your on-prem stack
argument-hint: '<Fabric question>'
disable-model-invocation: true
---
Fabric question: $ARGUMENTS

1. Grep kb/ for the topic first; build on what is there.
2. Answer from library/ (fabric-library skill). If it needs more than 3 files, send it to the fabric-librarian subagent.
3. Reply in teaching-method shape, about one screen: answer, on-prem anchor and where it breaks, in our platform (kb/platform.md), use/avoid, one gotcha, recall hook. Cite `library/<path>:<line>`.
4. Fast-moving specifics (preview/GA, limits, SKUs, prices): claim-check or UNVERIFIED - the library is a dated snapshot.
5. End with: /capture to save it - /visual for a diagram - /lab to practise it.
````

### `.claude/commands/gaps.md`
````markdown
---
description: Find your knowledge gaps and get a short, prioritised study plan
argument-hint: '[area]'
disable-model-invocation: true
---
Knowledge gaps: $ARGUMENTS

Scan kb/ for: overdue cards; cards in box 1-2 or confidence 2 or lower; UNVERIFIED claims; lessons that repeat a theme; open questions older than 14 days; platform.md components or ADR topics without a concept card; open HIGH/CRITICAL findings whose concepts lack a card.
Return the top 5 gaps, each with a 15-minute action (/teach X, /quiz Y, /validate C-NNN, /recall Z) and why it matters for the platform. 25 lines or fewer.
````

### `.claude/commands/lab.md`
````markdown
---
description: Hands-on, step-by-step practice you do yourself in your own Fabric workspace - Claude coaches, never connects
argument-hint: '<topic> [level: 1 | 2 | 3]'
disable-model-invocation: true
---
Lab: $ARGUMENTS

Design a short lab from library/ (fabric-library skill; fabric-librarian for patterns) and kb/. Level 1 = guided clicks and copy-paste code, 2 = fill-in-the-gaps code, 3 = build from a spec.
1. Goal, prerequisites (a dev or sandbox workspace you own - never prod, never tenant data), time box 30 minutes or less.
2. 4-6 numbered steps. Each step: what to do in the Fabric UI or notebook / SQL / KQL editor, the code to paste (synthetic data only), the checkpoint ("you should see ..."), and why it works (one line, with an on-prem anchor).
3. Give ONE step at a time. Wait for the user to report the result or paste output (no secrets, IDs or tenant data), then diagnose it and give the next step.
4. Never provide az, fab, REST, PowerShell or other commands that connect to Azure, Fabric or Power BI; the user works in the browser UI and editors.
5. Finish with: 3-line recap, one quiz question, a cleanup step (delete the lab items), and offer /capture with box 1.
````

### `.claude/commands/map.md`
````markdown
---
description: Map an on-prem, Databricks, Synapse or HDInsight concept or code snippet to its Fabric equivalent
argument-hint: '<concept | pasted code | inbox file> [from: onprem | databricks | synapse | hdinsight | airflow]'
disable-model-invocation: true
---
Map to Fabric: $ARGUMENTS

1. Identify the source world (default: the on-prem stack in CLAUDE.md section 1) and what the thing does.
2. Look up the mapping: teaching-method `references/onprem-anchors.md`, then the library migration guides (fabric-library skill; fabric-librarian for code).
3. Reply with:
   - Mapping table: source | Fabric equivalent | where it breaks | confidence (DOCUMENTED with library/Learn citation, or INFERRED)
   - For code: the Fabric version side by side, changed lines commented. Paths use placeholders (`abfss://<workspace>@onelake.dfs.fabric.microsoft.com/<lakehouse>.Lakehouse/...`); no real IDs or hosts.
   - What has no equivalent and the usual workaround
   - 2 traps for someone coming from this source
4. The output is code for the user to paste into their own notebook or editor. Never give az/fab/REST commands that connect to Azure, Fabric or Power BI.
5. Offer /capture for the mapping and a kb/lessons.md row for any trap the user fell into.
````

### `.claude/commands/meeting.md`
````markdown
---
description: Turn Teams/Copilot meeting notes from inbox/ into knowledge - digest, claims, decisions, actions
argument-hint: '[inbox file] [decisions]'
disable-model-invocation: true
---
Meeting capture: $ARGUMENTS

1. Resolve the file: the one named, otherwise the newest file in inbox/. If there is none, ask the user to save the Copilot answer as inbox/YYYY-MM-DD-<type>.md.
2. Send it to the meeting-scribe subagent. With "decisions", ask for decisions only. Then send the significant decisions and designs to decision-challenger.
3. Show the plan compactly: digest preview, then small tables of new claims, decisions (with challenge verdicts), open items and concept links, then "how to raise it" questions for the follow-up. Ask: apply all, pick, or edit.
4. Write the approved items in kb-conventions formats. Never copy the raw transcript into kb/.
5. Offer: /validate pending for the claims, /adr new for final decisions, /teach for unfamiliar terms.
6. Remind the user to delete the inbox file (it is git-ignored).
````

### `.claude/commands/note.md`
````markdown
---
description: Capture an informal discussion (chat thread, hallway talk, whiteboard, your own notes) and challenge what was decided
argument-hint: '<pasted notes | inbox file>'
disable-model-invocation: true
---
Discussion notes: $ARGUMENTS

1. Take the pasted text or the inbox file. Drop people's names except action owners; never store the raw text.
2. Send it to meeting-scribe (discussion mode). If it contains a decision, design choice or process change, send that to decision-challenger as well.
3. Show: 3-line gist, decisions with verdicts, claims to validate, actions and open questions, and the one thing worth pushing back on, with a neutral question to ask.
4. Offer: digest to kb/sources/YYYY-MM-DD-discussion-<topic>.md (skip it for trivial notes and just add register rows), claims, open items, findings, ADR candidates. Write after approval.
````

### `.claude/commands/path.md`
````markdown
---
description: Step-by-step learning path for a Fabric area, ordered from your on-prem knowledge and your KB gaps
argument-hint: '<area: spark | lakehouse | warehouse | real-time | power-bi | ci-cd | governance | migration>'
disable-model-invocation: true
---
Learning path: $ARGUMENTS

1. Ask the fabric-librarian for the area's core concepts in dependency order, with the library files that teach each.
2. Check kb/concepts/ and kb/lessons.md: mark each concept KNOWN (card, box 3 or higher), SHAKY (box 1-2 or a lessons row) or NEW.
3. Return 6-8 steps, 20 lines or fewer. Each step: concept, on-prem anchor, the command to run (/teach, /visual, /lab or /quiz), and about 15 minutes. Put SHAKY items before NEW ones that depend on them.
4. Offer to log the path as kb/open.md rows (type: study, one per step). Write after approval.
````

### `.claude/commands/platform-check.md`
````markdown
---
description: Whole-platform health check - architecture and Terraform scorecard against enterprise practice
argument-hint: '[focus pillar]'
disable-model-invocation: true
---
Platform check: $ARGUMENTS

Run the arch-reviewer (kb/platform.md, ADRs, findings) and the tf-reviewer (infra repo) in parallel, then merge:
1. Scorecard: 12 pillars, each STRONG / ADEQUATE / GAP / UNKNOWN with a one-line reason
2. Top 5 risks with severity and evidence
3. Next 3 moves - the smallest changes with the biggest risk reduction
4. Unknowns turned into questions for the team
Compare with the statuses already in kb/findings.md and call out what improved or regressed. About 1.5 screens. Offer to update kb/findings.md; write after approval.
````

### `.claude/commands/quiz.md`
````markdown
---
description: Spaced-repetition quiz - one question at a time
argument-hint: '[due | <topic> | gaps]'
disable-model-invocation: true
---
Quiz target: $ARGUMENTS
(blank or "due" = cards whose next_review is today or earlier, oldest first; "gaps" = cards in box 1-2 or confidence 2 or lower; anything else = that topic)

Follow the teaching-method quiz rules:
1. Pick up to 5 targets and read their cards.
2. Ask ONE question at a time - AskUserQuestion for multiple choice, free text otherwise - and wait for the answer.
3. Grade each: CORRECT / PARTLY / WRONG, the one-line gap, the recall hook.
4. Finish with the score and the proposed Leitner updates (card -> box, next_review).
5. After approval, update only the cards' frontmatter (box, next_review, confidence, updated) and add a kb/lessons.md row for each WRONG answer that reveals a misconception.
````

### `.claude/commands/recall.md`
````markdown
---
description: Quick refresher from your knowledge base - show what you learned before
argument-hint: '<concept or question>'
disable-model-invocation: true
---
Recall: $ARGUMENTS

Search kb/ (concepts, decisions, claims, lessons, open, meetings) for the topic and its synonyms. Answer in 12 lines or fewer using the teaching-method refresh shape: one-liner, 3 key points, use/avoid, top mistake (from lessons or claims), our decision (ADR), open questions, related cards.
Mark anything that isn't in kb/ as "not in your KB yet". With no card, end with "-> /teach <topic> or /capture".
If the card is overdue for review, say so and offer a 2-question mini quiz.
````

### `.claude/commands/review-arch.md`
````markdown
---
description: Architecture review of a design, proposal or ADR against enterprise Azure + Fabric practice
argument-hint: '<design text | inbox file | ADR-NNNN>'
disable-model-invocation: true
---
Architecture review: $ARGUMENTS

Send the design (pasted text, a file in inbox/, or an ADR) and kb/platform.md to the arch-reviewer subagent.
Present: 5-line restatement, scorecard, findings, anti-patterns, top 3 risks, questions to take to the team, ADRs to write or revisit, 3 concepts to study.
Offer to log findings in kb/findings.md and questions in kb/open.md. Write after approval.
````

### `.claude/commands/review-code.md`
````markdown
---
description: Read-only review of PySpark, Spark SQL, T-SQL, KQL, DAX, M or pipeline JSON against Fabric best practice
argument-hint: '<inbox file | infra repo path | pasted code> [spark | sql | kql | dax | m | pipeline]'
disable-model-invocation: true
---
Code review: $ARGUMENTS

1. Resolve the code: pasted text, a file in inbox/, or a path in the read-only infra repo. Detect the language if it isn't given.
2. Send the code and language to the fabric-librarian subagent. Ask for the matching checklist: Spark performance and data-engineering patterns, MLV patterns, SQLDW/SQLDB authoring rules, KQL best practice, DAX performance and modelling guidelines, Dataflow M, or pipeline gotchas.
3. Present a findings table sorted by severity (platform-review severity scale): severity | `file:line` or snippet line | issue | why it matters on Fabric | fix | library citation.
4. Then the top 3 fixes as corrected snippets for the user to apply on a branch. Never edit the code yourself.
5. One teaching moment: the concept behind the worst finding, anchored on-prem. Offer /teach and adding findings to kb/findings.md (write after approval).
````

### `.claude/commands/review-tf.md`
````markdown
---
description: Read-only Terraform review against enterprise Azure + Fabric practice
argument-hint: '[path in the infra repo] [focus: security | state | modules | identity | network | fabric | ci | multitenancy]'
disable-model-invocation: true
---
Terraform review: $ARGUMENTS

1. Send the path and focus to the tf-reviewer subagent (default: the whole infra repo named in kb/platform.md).
2. Present: short repo map, findings table sorted by severity, top 3 risks, questions for the team, suggested ADRs.
3. Add a RUN THIS YOURSELF block with the read-only local scanners (nothing that contacts Azure or Fabric) that fit the findings. If the user pastes scanner output, triage it into the same findings format.
4. Offer to add findings to kb/findings.md and to /teach the concepts behind the top findings. Write after approval.
Propose fixes as code snippets the user applies on a branch and raises as a merge request - never as changes you make.
````

### `.claude/commands/size.md`
````markdown
---
description: Offline Fabric capacity sizing walkthrough for a workload profile - method, SKU reasoning and cost levers
argument-hint: '<workload profile: Spark jobs, SQL, Power BI users, real-time events, data volumes>'
disable-model-invocation: true
---
Capacity sizing: $ARGUMENTS

Use library/skills/e2e-fabric-cost-estimation (the method and worksheet only - never its pricing API or live metrics steps).
1. If the profile is thin, ask up to 4 questions: daily Spark hours and node sizes, SQL concurrency and data scanned, Power BI users and refresh cadence, events per second and retention.
2. Walk the worksheet: estimated capacity units per workload, peak versus average, smoothing and throttling headroom, then a SKU range with reasoning. Multi-tenant: shared versus per-tenant capacity trade-off.
3. Prices, SKU limits and reservation discounts are fast-moving: show them as UNVERIFIED unless the user pastes figures from the public pricing page. Never fetch pricing or metering APIs.
4. Cost levers: pause/resume, reservations versus pay-as-you-go, workload isolation, Spark session reuse, Direct Lake versus import.
5. One table plus 10 lines or fewer. Offer /adr new for the capacity decision and kb/open.md rows for the assumptions.
````

### `.claude/commands/teach.md`
````markdown
---
description: Teach a concept simply, anchored to your on-prem stack and to our platform
argument-hint: '<concept> [deeper]'
disable-model-invocation: true
---
Teach: $ARGUMENTS

1. Grep kb/ for the concept and its synonyms (cards, ADRs, claims, lessons). Build on what exists; flag contradictions.
2. Pull Fabric specifics from library/ (fabric-library skill; fabric-librarian if more than 3 files) and cite them.
3. Use the teaching-method skill's explanation shape: TL;DR, plain explanation, on-prem anchor and where it differs, in our platform, use/avoid, mistakes, check question, recall hook.
4. Fast-moving specifics (preview/GA, limits, SKUs, regions, provider resources): verify with the claim-check skill or label them UNVERIFIED.
5. If "deeper" is given, add how it works under the hood and the edge cases.
6. End with: /capture to save it - /visual for a diagram - /lab to practise - /quiz to test it.
````

### `.claude/commands/validate.md`
````markdown
---
description: Validate a technical claim, or the pending meeting claims, against authoritative sources
argument-hint: '"<claim>" | C-012 | pending'
disable-model-invocation: true
---
Validate: $ARGUMENTS

- A quoted claim: validate it. A claim ID: load it from kb/claims.md. "pending": the UNVERIFIED rows, oldest first, 5 per run.
- Send each claim to the claim-checker subagent (several in parallel). Remind it to generalise every query.
- Present each result VERDICT-first, with evidence and checked date, conditions, and "so what for us".
- Propose the KB updates from the claim-check skill (claims row, card Myth -> Fact line, open.md row if an ADR is affected). Write after approval.
````

### `.claude/commands/visual.md`
````markdown
---
description: Diagram-based explanation on demand - Mermaid code plus a detailed walkthrough
argument-hint: '<topic> [flow | architecture | mindmap | decision | states]'
disable-model-invocation: true
---
Visual for: $ARGUMENTS

Use the visual-explain skill. Ground the diagram in kb/ (platform.md, cards, ADRs) when the topic is our platform; otherwise keep it generic and say so.
Output: purpose line, Mermaid block (house palette, 15 nodes max, numbered edges), "Read it in N steps" walkthrough, design reasons, failure modes and common mistakes, in our platform, recall hook.
Then ask whether to save the diagram into the concept card - save only if the user says yes.
````

### `.claude/commands/wrap.md`
````markdown
---
description: End-of-session wrap-up - capture what you learned and line up the next review
disable-model-invocation: true
---
Wrap up this session in 15 lines or fewer:
1. What I learned or corrected today: proposed card updates or new cards (3 at most) and lessons rows
2. Decisions made: ADR drafts or updates
3. New open questions, risks and actions
4. Cards due tomorrow
Show the proposed writes and apply them after approval, within the kb-conventions caps.
````

### `kb/claims.md`
````markdown
# Claims register
Verdicts: CORRECT, PARTLY, WRONG, OUTDATED, UNVERIFIED, OPINION. Source = meeting date and type, or a document - never a person.

| ID | Date | Source | Claim | Verdict | Correct statement | Evidence (checked) |
|---|---|---|---|---|---|---|
````

### `kb/concepts/managed-identity.md`
````markdown
---
title: Managed identity
slug: managed-identity
tags: [identity, security]
anchor: "~ Kubernetes ServiceAccount + Vault Kubernetes auth - but Azure issues the token and Azure RBAC grants the access"
confidence: 2
box: 1
next_review: 2026-10-04
updated: 2026-10-03
sources:
  - https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview (checked 2026-10-03)
---
**One-liner:** An identity in Microsoft Entra ID that Azure manages for a resource, so code running there gets tokens without holding any secret.

**Two kinds:**
- System-assigned: created with one resource, lives and dies with it, can't be shared.
- User-assigned: a resource of its own that can be attached to many resources; Microsoft recommends it for Microsoft services.

**Why it exists:** it removes stored credentials - the thing Vault guards on-prem - for workloads that run on Azure.

**Use when:** code on an Azure resource calls anything that accepts Entra auth (Key Vault, Storage, SQL, Resource Manager).
**Avoid when:** the caller runs outside Azure (a GitLab runner, say) - use workload identity federation; still no secret.

**In our platform:** not mapped yet - /bootstrap or /capture.

**Mistakes:**
- Myth: it is a service principal with a secret I must rotate -> Fact: there is no secret for you to hold or rotate.
- Myth: Contributor on the storage account lets it read the data -> Fact: data needs data-plane roles (e.g. Storage Blob Data Reader) at the narrowest scope.
- Myth: system-assigned is fine everywhere -> Fact: recreate the resource and the identity and its role assignments are gone; shared, IaC-managed access suits user-assigned.

**Recall hook:** No secret, no Vault - Azure hands the badge to the resource itself.

**Check yourself:** A GitLab runner deploys Terraform to Azure. Managed identity or federation?
<details><summary>Answer</summary>Workload identity federation (OIDC): the runner is not an Azure resource. The federated credential can sit on an app registration or on a user-assigned managed identity.</details>

**Related:** [[workload-identity-federation]], [[azure-rbac]], [[key-vault]]
````

### `kb/decisions/ADR-0001-claude-advisor-only.md`
````markdown
---
id: ADR-0001
title: Claude is an advisor only - no execution, no Azure or Fabric access
status: accepted
date: 2026-10-03
deciders: Owner of this knowledge base
tags: [governance, security, tooling]
---
## Context
This knowledge base runs Claude Code on a work laptop next to the team's Terraform repositories. The owner requires that the assistant cannot change any system, cannot connect to Azure or Microsoft Fabric, and reads only public documentation from the internet.

## Decision
We will run Claude Code as a read-only advisor under the company Claude configuration, with every connection to Fabric, Azure, Power BI and Git blocked and no commits or pushes. Execution and outbound tools are denied in settings; a PreToolUse hook blocks execution, Azure/Fabric hosts, unsafe web calls and writes outside kb/; the owner runs every command personally.

## Options considered
| Option | Pros | Cons | Verdict |
|---|---|---|---|
| Advisor only (deny rules + hooks) | No change risk; clear accountability | Slower loops; scanner output pasted by hand | Chosen |
| Allow read-only CLI (az show, terraform plan) | Faster discovery | Credentials inside the session; plan takes state locks; scope creep | Rejected |
| Sandboxed execution | Isolation | Claude Code's sandbox isn't available on native Windows; would still reach tenants | Rejected |

## Consequences
+ No credentials or tenant data flow through the assistant's tools.
+ Every change is run and reviewed by a person.
- Reviews are static; dynamic checks need the owner to run scanners and paste results.
Revisit when: the organisation provides an approved, isolated environment for agent execution.

## Assumptions to validate
- Using Claude Code on this laptop for work content is approved (owner's responsibility).

## Recall
Claude reads and advises; I run.
````

### `kb/findings.md`
````markdown
# Review findings
Severity: CRITICAL, HIGH, MEDIUM, LOW, INFO. Status: open, fixed, accepted.

| ID | Date | Severity | Pillar | Evidence | Finding | Recommendation | Status |
|---|---|---|---|---|---|---|---|
````

### `kb/lessons.md`
````markdown
# Lessons - my corrected misconceptions

| ID | Date | I thought | Actually | Why it matters | Card |
|---|---|---|---|---|---|
````

### `kb/open.md`
````markdown
# Open items - questions, risks, actions, verify-later

| ID | Date | Type | Item | Owner (actions) | Status | Link |
|---|---|---|---|---|---|---|
````

### `kb/platform.md`
````markdown
# Platform map
TODO: run /bootstrap - it reads the infra repo (read-only), asks you up to 6 questions and fills this page.
Keep it to 80 lines. Mark each fact VERIFIED (seen in code or docs) or INFERRED.

## Tenancy model

## Environments

## Repos and stacks

## Identity

## Network

## Fabric

## CI/CD

## Conventions

## Known constraints
````

### `COPILOT-PROMPT.md`
````markdown
# Copilot meeting prompt
Paste everything between the two lines into Copilot in Teams (during the meeting or from the recap). Save Copilot's answer as `inbox/YYYY-MM-DD-<type>.md`, run `/meeting`, then delete the file. For a Teams chat thread, the same prompt works; use `/note` instead.

---
Act as my meeting scribe for an Azure + Microsoft Fabric lakehouse platform team. From this meeting, produce ONLY the sections below, in plain text, with these exact headings and one line per item. Be literal: record what was said, not what is correct. Do not merge different statements. Refer to people by role (for example platform lead, security architect), except under ACTION ITEMS where owners are named. Mark anything you inferred with (inferred). Write "none" for an empty section. If the transcript is partial, say so on the first line.

MEETING: date | type (stand-up / design / review / 1:1 / other) | topic | attendee roles
CONCEPTS DISCUSSED: term - how it was explained or used
CLAIMS: "technical statement made as fact, close to verbatim" - role - context
DECISIONS: decision - rationale given - decided by (role) - final or tentative
ALTERNATIVES CONSIDERED: option - pros and cons mentioned - why rejected or parked
ASSUMPTIONS: assumption stated or implied
NON-FUNCTIONAL AND TENANT IMPACT: scale, SLA, security, cost, multi-tenant or operational impact mentioned - or "not discussed"
DISAGREEMENTS: topic - position A vs position B - resolved? how
OPEN QUESTIONS / UNRESOLVED: question - who should answer (role)
RISKS: risk - impact mentioned
ACTION ITEMS: action - owner - due date if stated
TERMS I MAY NOT KNOW: acronyms or jargon used without explanation
---
````

### `README.md`
````markdown
# Fabric Platform Brain

A Claude Code project that helps you **learn, recall, validate and review** an enterprise multi-tenant Azure + Microsoft Fabric lakehouse, and **capture** what you learn in a small, linked knowledge base. Claude is a read-only advisor: it never runs anything - you do.

Fabric knowledge comes from Microsoft's [skills-for-fabric](https://github.com/microsoft/skills-for-fabric), used **offline**. The `fabric-skills` plugin is disabled in this project because its skills call Fabric APIs through az/fab, and its MCP servers run `az account get-access-token` at startup. `tools/sync_fabric_library.py` copies its Markdown into `library/` with every script removed. Claude reads that copy; it never connects anywhere.

## Safety model (applied every session and every turn)
| Layer | What it enforces | Where |
|---|---|---|
| Company configuration | Your organisation's managed settings and approved connectors always win; this project only adds restrictions | managed by IT |
| Permissions (hard) | Disables the `fabric-skills` plugin and its 4 agents; denies the Fabric, Power BI and GitHub connectors; removes shell (so no git, no commits), PowerShell, Monitor, Workflow and outbound tools; denies Azure/Entra/Fabric domains for WebFetch; denies reading state, tfvars, keys, `~/.azure`, `~/.ssh`; denies edits to config and to the infra repo; Manual mode, auto and bypass modes disabled | `.claude/settings.json` |
| Hooks (hard, content-aware) | Checks every tool call: no connector tool whose name mentions Fabric, Azure, Power BI or Git hosting, no `fabric-skills:*` skills or agents, no URLs carrying tokens, no execution, no Azure/Fabric/Power BI hosts (incl. `*.cloud.microsoft`), no IP or internal hosts, no GUIDs or secrets in queries and URLs, writes only under `kb/` (`library/` is read-only), no secrets written. Blocks prompts that contain secrets. Re-states the guardrails at session start, after compaction and on every turn | `.claude/hooks/` |
| Instructions | Guardrails, "RUN THIS YOURSELF" format, and a canary that warns you if the hooks stop running | `CLAUDE.md` |

Claude can still read public documentation (pull-only) and the repo folders you attach (read-only).

## Setup (WSL Ubuntu, about 10 minutes)
You need Claude Code, Python 3 and the plugin installed once (`/plugin marketplace add microsoft/skills-for-fabric`, `/plugin install fabric-skills@fabric-collection`) - it is only the source of `library/`.

1. `cd ~/wcd/azd/enhance_setup`
2. Fill the placeholders: `python3 tools/setup_paths.py --infra ~/work/<your-terraform-repo>` (repeat `--infra` for more repos; omit it if you have none yet).
3. `library/` is already built (skills-for-fabric 0.3.18). After a `/plugin update`, refresh it: `python3 tools/sync_fabric_library.py`
4. Prove the guardrails: `python3 tools/selftest.py` - every line should say PASS.
5. Start: `./start.sh`, accept the trust prompt, check the **KB-GUARD ACTIVE ... Fabric library 0.3.18** banner, then `/bootstrap`.
6. Recommended: `/plugin disable fabric-skills@fabric-collection` at user level too. Otherwise its MCP servers fetch Azure tokens in every other folder where you run Claude. The sync script still works from the plugin cache.

Windows Command Prompt instead of WSL: use `start.cmd` and `python` instead of `python3`; the hooks are cross-platform.

## Daily rhythm
- Start the day: `start.cmd`, then `/quiz` (cards due, about 5 minutes)
- Before a meeting: `/cheatsheet <topic>`
- After a meeting: Copilot notes, then `/meeting`, then `/validate pending`
- Design doc or chat thread to react to: `/doc` or `/note`; before you agree to anything big: `/challenge`
- Weekly: `/decisions` alongside `/gaps`
- While working: `/teach`, `/recall`, `/correct`, `/visual` (diagrams only when you ask), `/fabric`, `/map`
- Hands-on: `/path <area>` for the order, then `/lab <topic>` - you do each step in your own sandbox workspace, Claude coaches
- End of the day: `/wrap`. Weekly: `/gaps`. Monthly: `/platform-check`

## Commands
| Command | Use it to |
|---|---|
| `/teach <concept> [deeper]` | learn something, anchored to your on-prem stack |
| `/recall <concept>` | 12-line refresher of what you captured before |
| `/quiz [due \| topic \| gaps]` | spaced-repetition test, one question at a time |
| `/capture <text>` | save a concept, lesson, decision or question |
| `/correct <your understanding>` | check your mental model and log the fix |
| `/validate "<claim>" \| C-012 \| pending` | get a sourced verdict on a claim |
| `/visual <topic> [flow \| architecture \| mindmap \| decision \| states]` | Mermaid diagram plus a detailed walkthrough |
| `/adr new \| update \| export ...` | record or export a decision |
| `/meeting [file] [decisions]` | Copilot notes to digest, claims, decisions and actions |
| `/cheatsheet <topic>` | one-page prep for a discussion |
| `/gaps [area]` | top 5 gaps with 15-minute actions |
| `/review-tf [path] [focus]` | read-only Terraform review |
| `/review-arch <design \| file \| ADR>` | architecture review |
| `/platform-check` | 12-pillar scorecard, top risks, next 3 moves |
| `/bootstrap` | first-run platform map |
| `/fabric <question>` | cited answer from the offline Fabric library |
| `/map <concept \| code> [from]` | on-prem / Databricks / Synapse / HDInsight / Airflow to Fabric, side by side |
| `/review-code <file \| code> [lang]` | PySpark, SQL, KQL, DAX, M or pipeline JSON review against Fabric practice |
| `/lab <topic> [1-3]` | step-by-step exercise you run yourself in the Fabric UI |
| `/size <workload>` | offline capacity sizing method; prices stay UNVERIFIED |
| `/path <area>` | ordered learning path from your KB gaps |
| `/doc <inbox file> [focus]` | document digest, decisions, gaps, review comments to post |
| `/note <text>` | informal discussion to digest and challenge |
| `/challenge <decision \| ADR \| file>` | verdict, gaps, better alternatives, how to raise it |
| `/decisions [filter]` | decision register and what needs attention |
| `/wrap` | end-of-session capture |

## Notes, documents and decision challenges
Every decision you bring in gets a verdict - ENDORSE, ENDORSE WITH CONDITIONS, RECONSIDER, REJECT or NEEDS INFO. Each verdict comes with gaps, better alternatives and neutral questions you can raise. The rubric is `.claude/skills/platform-review/references/design-patterns.md`: multi-tenancy, configurability and parameterization, data patterns, production readiness, decision quality and 10 stress tests.

| Source | How |
|---|---|
| Formal meeting | Copilot prompt below, then `/meeting` (now challenges its decisions) |
| Document (HLD, RFC, proposal, runbook) | Save as PDF or Markdown in `inbox/`, then `/doc <file>`. Export Word, PowerPoint and Confluence pages first - Claude can't run converters here |
| Chat thread, hallway talk, own notes | `/note <paste>` |
| Any single decision or ADR | `/challenge <text \| ADR-NNNN>` |
| Overview | `/decisions` - register, conflicts, stale and unrecorded decisions |

Digests go to `kb/sources/` (documents, discussions) or `kb/meetings/`, challenges to `kb/findings.md` as F-DEC-NN, and final decisions to ADRs with a Challenge section.

## Meetings (Teams + Copilot)
1. Paste the prompt from `COPILOT-PROMPT.md` into Copilot during the meeting or from the recap.
2. Save the answer as `inbox/YYYY-MM-DD-<type>.md` (the folder is git-ignored).
3. Run `/meeting`, approve the plan, then `/validate pending`.
4. Delete the inbox file. Claims are stored without people's names; action items keep their owners.

## Diagrams
`/visual` prints Mermaid code and a numbered walkthrough. View it in VS Code (Markdown preview with a Mermaid extension) or in GitLab, which renders Mermaid in Markdown. Don't paste internal diagrams into public online editors. Say "save it" to keep a diagram in the concept card.

## What's where
```
CLAUDE.md               guardrails, roles, KB map (always loaded)
.claude/settings.json   permissions, hooks, output style, status line
.claude/hooks/          Python guards, KB lint, status line
.claude/commands/       the 26 slash commands
.claude/skills/         teaching-method, visual-explain, claim-check, platform-review, kb-conventions, fabric-library
.claude/agents/         tf-reviewer, arch-reviewer, claim-checker, meeting-scribe, fabric-librarian, decision-challenger (all read-only)
.claude/output-styles/  Recall Coach (answer first, compact)
.claude/rules/          kb-writing (loads when Claude touches kb/)
kb/                     your knowledge base - the only place Claude writes
library/                offline skills-for-fabric snapshot (Markdown only, MIT) - INDEX.md is the map
inbox/                  drop zone for meeting notes (git-ignored)
tools/                  setup_paths.py, selftest.py, sync_fabric_library.py - you run them
```
Optional: put your team's ADR template in `kb/templates/team-adr.md` and `/adr export` will use it.

## Troubleshooting
- **No KB-GUARD banner, or "hook error" notices** - the Python path is wrong. Re-run `tools/setup_paths.py`, then `tools/selftest.py`. The permission blocks still apply meanwhile.
- **"Settings Error" dialog at startup** - choose fix or exit, never "continue without": that drops every guard. `claude doctor` names the bad key.
- **Hooks never run at all** - your organisation may allow managed hooks only. The permission blocks still apply; ask your admin.
- **WebSearch fails** (some Bedrock or Azure-hosted Foundry setups) - Claude falls back to fetching Learn pages directly or marks the claim UNVERIFIED.
- **Your tfvars hold no secrets and you want them reviewed** - set `ALLOW_TFVARS = True` in `.claude/hooks/guard_config.py` and delete the two `*.tfvars` deny rules in `.claude/settings.json`.
- **`fabric-skills:*` skills or FabricIQ tools appear in a session here** - `enabledPlugins` was overridden (for example by `.claude/settings.local.json`). The hooks still block them; the banner shows a SETUP WARNING.
- **Banner says "Fabric library MISSING"** - run `python3 tools/sync_fabric_library.py`.
- **Status line missing** - it needs paths without spaces; it is cosmetic, the guards don't depend on it.
````

### `start.sh`
````bash
#!/usr/bin/env bash
# Start Claude Code for this knowledge base: Manual permission mode, Chrome integration off.
cd "$(dirname "$0")" || exit 1
exec claude --no-chrome --permission-mode default "$@"
````

### `start.cmd`
````bat
@echo off
rem Start Claude Code for this knowledge base: Manual permission mode, Chrome integration off.
cd /d "%~dp0"
claude --no-chrome --permission-mode default %*
````

### `.gitignore`
````text
# Meeting notes stay on this laptop
inbox/*
!inbox/.gitkeep

# Machine-specific settings and backups
.claude/settings.local.json
.claude/*.bak

# Never commit state or secrets
*.tfstate
*.tfstate.*
.env
.env.*
*.pem
*.pfx
*.key

__pycache__/
````

## Done when
Every file above exists with identical content (apart from the Step 2 adaptations), the four empty `.gitkeep` files exist, and you have printed the Step 3 hand-over. Do not run anything.
