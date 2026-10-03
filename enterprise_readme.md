# Fabric Platform Brain - how to work with it

Your daily guide. `enterprise_setup.md` builds the project once; this file is how you use it from then on.

## 1. What it is, in one minute
- A Claude Code project that helps you **learn, remember, challenge, validate and capture** knowledge about your multi-tenant Azure + Microsoft Fabric lakehouse.
- Claude is an **advisor only**. It reads, explains, reviews and suggests. **You** run every command and apply every change.
- Everything you learn and decide goes into `kb/`, your knowledge base. It stays small, linked and reviewable. Claude writes there only after you say yes.

| Claude CAN | Claude CANNOT |
|---|---|
| Read your local files, the infra repo (read-only) and inbox/ notes | Run any command, script, terraform, az, git or PowerShell |
| Search and read public documentation (anonymously, generalised queries) | Connect to Fabric, Azure, Power BI or Git, or use their connectors and APIs |
| Write to `kb/` after you approve | Commit, push or edit your repos |
| Give you local commands to run yourself, marked `RUN THIS YOURSELF` | Read state files, tfvars, keys or credential stores |

Your company's Claude configuration always applies on top of these rules.

**Check it's protected:** every session starts with the banner `KB-GUARD ACTIVE ...`, and the status line shows `KB-GUARD on | no-exec | no Fabric/Azure/PBI/Git`. If Claude ever opens a reply with `WARNING: KB-GUARD hooks not detected`, stop and run the self-test (section 9).

## 2. First week
| Day | Do this | Why |
|---|---|---|
| 1 | `/bootstrap` | Claude reads the infra repo, asks you up to 6 questions and drafts `kb/platform.md`, the map of your platform |
| 1 | `/path lakehouse` (or spark, real-time, ci-cd, governance...) | An ordered learning plan from what you already know |
| 2-5 | One `/teach` a day from the plan, then `/capture` | Builds your first concept cards |
| 2-5 | `/quiz` each morning | Spaced repetition: cards come back just before you forget them |
| 5 | `/gaps` and `/decisions` | Shows what to learn next and which decisions are undocumented |

## 3. Rhythm
| When | Command | Time |
|---|---|---|
| Start of day | `/quiz` (cards due today) | 5 min |
| Before a meeting | `/cheatsheet <topic>` | 3 min |
| After a meeting | Copilot notes in `inbox/`, then `/meeting`, then `/validate pending` | 10 min |
| A design doc to react to | `/doc <file>` | 10 min |
| Before agreeing to anything big | `/challenge <decision>` | 5 min |
| While working | `/teach`, `/recall`, `/fabric`, `/map`, `/correct`, `/visual` | as needed |
| End of day | `/wrap` | 3 min |
| Weekly | `/gaps`, `/decisions`, `/validate pending` | 20 min |
| Monthly | `/platform-check` | 30 min |

## 4. All commands, by goal
You can also just ask in plain words; commands make the output shape predictable.

### Understand and learn
| Command | Use it for | Example |
|---|---|---|
| `/teach <concept> [deeper]` | A new concept, anchored to your on-prem stack and your platform | `/teach workspace identity deeper` |
| `/fabric <question>` | A Fabric question answered from the offline Microsoft library, with citations | `/fabric when should Silver be a materialized lake view instead of a notebook?` |
| `/map <thing> [from]` | On-prem / Databricks / Synapse / HDInsight / Airflow to Fabric, code side by side | `/map Iceberg table with Nessie branches from onprem` |
| `/visual <topic> [type]` | Mermaid diagram plus a numbered walkthrough (types: flow, architecture, mindmap, decision, states) | `/visual private endpoint DNS resolution flow` |
| `/lab <topic> [1-3]` | Hands-on steps **you** do in your own sandbox workspace; Claude coaches one step at a time | `/lab Delta MERGE with watermark 1` |
| `/path <area>` | Ordered learning path based on your KB gaps | `/path real-time` |
| `/size <workload>` | Capacity sizing method and cost levers (prices marked unverified) | `/size 40 Spark hours/day, 200 Power BI users, 5k events/s` |

### Remember
| Command | Use it for | Example |
|---|---|---|
| `/recall <concept>` | 12-line refresher from your own KB | `/recall managed identity` |
| `/quiz [due \| topic \| gaps]` | Spaced-repetition quiz, one question at a time | `/quiz gaps` |
| `/cheatsheet <topic>` | One-page prep before a meeting | `/cheatsheet tenant onboarding design review` |
| `/gaps [area]` | Top 5 knowledge gaps with 15-minute actions | `/gaps network` |

### Check facts and correct yourself
| Command | Use it for | Example |
|---|---|---|
| `/validate "<claim>" \| C-012 \| pending` | Sourced verdict on a technical statement | `/validate "OneLake shortcuts copy the data"` |
| `/correct <your understanding>` | Test your own mental model; logs a lesson if it was wrong | `/correct a workspace can use two capacities at once` |

### Challenge and review
| Command | Use it for | Example |
|---|---|---|
| `/challenge <decision \| ADR-NNNN \| file>` | Verdict, gaps, better alternatives and how to raise it | `/challenge one shared workspace for all tenants with RLS` |
| `/review-arch <design \| file \| ADR>` | Architecture review against 12 enterprise pillars | `/review-arch inbox/2026-10-10-hld.md` |
| `/review-tf [path] [focus]` | Read-only Terraform review (focus: security, state, modules, identity, network, fabric, ci, multitenancy) | `/review-tf modules/tenant multitenancy` |
| `/review-code <file \| code> [lang]` | PySpark, SQL, KQL, DAX, M or pipeline JSON against Fabric practice | `/review-code inbox/silver_load.py spark` |
| `/platform-check [pillar]` | Whole-platform scorecard, top risks, next 3 moves | `/platform-check` |

### Capture
| Command | Use it for | Example |
|---|---|---|
| `/meeting [file] [decisions]` | Copilot meeting notes to digest, claims, decisions (challenged), actions | `/meeting` (newest file in inbox/) |
| `/doc <file> [focus]` | Design doc, RFC, proposal or runbook to digest, gaps and review comments to post | `/doc inbox/lakehouse-rfc.pdf multitenancy` |
| `/note <text>` | Chat thread, hallway talk or your own notes | `/note platform lead said we'll hard-code tenant paths for the pilot` |
| `/capture <text>` | Save one concept, lesson, question or fact | `/capture V-Order is a write-time optimisation...` |
| `/adr new \| update \| export` | Record, change or export a decision | `/adr new capacity per tenant tier` |
| `/decisions [topic \| conflicts \| stale \| unrecorded]` | Decision register and what needs attention | `/decisions unrecorded` |
| `/wrap` | End-of-session capture and tomorrow's reviews | `/wrap` |
| `/bootstrap` | First-run platform map (re-run after a big platform change) | `/bootstrap` |

## 5. Playbooks

### A. Learn a new topic properly
1. `/recall <topic>`: see what you already have. If "not in your KB yet", go on.
2. `/teach <topic>`, then `/teach <topic> deeper` if needed.
3. `/visual <topic>` if it involves a flow or boundaries. Say "save it" to keep the diagram in the card.
4. `/lab <topic> 1` to do it once with your own hands.
5. `/capture` creates the card (box 1, review tomorrow). `/quiz` brings it back over the next weeks.

### B. Formal meeting (Teams + Copilot)
1. During or after the meeting, paste the prompt from `COPILOT-PROMPT.md` into Copilot.
2. Save Copilot's answer as `inbox/YYYY-MM-DD-<type>.md` (type: standup, design, review, 1to1, other).
3. `/meeting`: review the plan (digest, claims, decisions with challenge verdicts, actions, follow-up questions) and approve all, some or none.
4. `/validate pending` to check the claims people made.
5. Final decisions: `/adr new`. Unfamiliar terms: `/teach`.
6. Delete the inbox file. Only the digest is kept, with no names except action owners.

### C. Document (HLD, LLD, RFC, proposal, runbook)
1. Save it in `inbox/` as **PDF or Markdown**. Export Word, PowerPoint and Confluence pages first.
2. `/doc inbox/<file> [focus]`.
3. You get a summary, a decisions table with verdicts, the top findings, the missing sections a production design needs, and **review comments ready to post** on the document.
4. Approve what goes into the KB, then delete the inbox file.

### D. Informal discussion
`/note <paste or summary>` gives you the gist, the decisions with verdicts, the one thing worth pushing back on, and a neutral question to ask.

### E. Challenge a decision, then record it
1. `/challenge <decision>` gives a verdict:

   | Verdict | Meaning | Your move |
   |---|---|---|
   | ENDORSE | Sound against the standards | Record it in an ADR |
   | ENDORSE WITH CONDITIONS | OK if the conditions are met | Raise the conditions; put them in the ADR |
   | RECONSIDER | Real gaps; a better option exists | Use the "how to raise it" questions in the next meeting |
   | REJECT | Breaks a key standard (tenant isolation, security, data loss) | Escalate with the evidence |
   | NEEDS INFO | Can't judge yet | Get the answers to the listed questions |

2. Disagree? Argue back. The verdict changes only for new evidence or a better argument, and Claude says which.
3. `/adr new <title>`: the ADR gets the options, consequences, assumptions and a **Challenge** section with the verdict.
4. `/adr export ADR-NNNN` renders it in your team's template (`kb/templates/team-adr.md`) for you to paste into the team repo or wiki.
5. Later: `/adr update ADR-NNNN <change>`. If superseded, a new ADR is created and both are linked.
6. Weekly `/decisions` flags decisions with no ADR, conflicts, stale "revisit when" triggers and unchallenged one-way doors.

### F. Review Terraform or code
1. `/review-tf [path] [focus]` or `/review-code <file> [lang]`.
2. Findings come sorted by severity (CRITICAL to INFO) with `file:line` evidence.
3. Fixes come as snippets. **You** apply them on a branch and raise the merge request.
4. Claude may give you local scanner commands (`terraform fmt/validate`, `tflint`, `checkov`). Run them yourself and paste the output for triage.

### G. Check what someone said, or what you believe
- About a statement: `/validate "<claim>"` gives CORRECT, PARTLY, WRONG, OUTDATED, UNVERIFIED or OPINION, with a source and checked date.
- About your own understanding: `/correct <what you think>` gives a verdict per statement, the corrected model, why the mistake is tempting, and a lessons row.

## 6. Reading Claude's answers
| Label | Meaning |
|---|---|
| `CORRECTION:` | You, a meeting or a document said something wrong or incomplete; the fix follows |
| `VERDICT:` | Result of a check or challenge |
| OUR DECISION (ADR-NNNN) | Recorded team decision |
| OPINION / ASSUMPTION | Trade-off or unconfirmed premise, not fact |
| UNVERIFIED | Couldn't confirm from a source; treat with care |
| FINDING / QUESTION | Evidence-backed issue, or missing information |
| CRITICAL / HIGH / MEDIUM / LOW / INFO | Finding severity |
| `~ <on-prem thing> - but <difference>` | Analogy to what you know, and where it breaks |
| `Recall hook:` | One line to remember it by |
| `library/<path>:<line>` | Cited from the offline Microsoft skills-for-fabric library |

## 7. Your knowledge base (`kb/`)
| Path | Holds | Size cap |
|---|---|---|
| `platform.md` | Facts about your platform | 80 lines |
| `concepts/<slug>.md` | One recall card per concept, with a review schedule | 45 lines |
| `decisions/ADR-NNNN-<slug>.md` | Architecture decisions | 70 lines |
| `meetings/` and `sources/` | Meeting, document and discussion digests | 40 lines |
| `claims.md` | Statements heard, verdicts, sources | table |
| `lessons.md` | Your corrected misconceptions | table |
| `open.md` | Questions, risks, actions, verify and study items | table |
| `findings.md` | Review findings and decision challenges (F-DEC-NN) | table |

Rules: one topic, one file, updated in place; no raw transcripts, no names except action owners, no IDs or secrets. Optional: keep the KB in a **local** Git repo that you commit yourself, never a personal remote.

## 8. Getting better answers
- Add **`deeper`** for more detail; the default answers are short on purpose.
- Give a **focus**: `/review-tf modules/tenant security`, `/doc file.pdf multitenancy`.
- Say **"in our platform"** to get the answer mapped to `kb/platform.md`. Keep that file current (re-run `/bootstrap` after big changes).
- **Paste outputs back** (scanner results, error messages, lab checkpoints) with secrets and IDs removed.
- Ask "**what would make this production-grade?**" or "**stress-test this**" about any design.
- Say "**save it**" to keep a diagram, and "**log it**" to record a correction or finding.
- If an answer is UNVERIFIED and it matters, follow it with `/validate`.

## 9. Maintenance
| Task | How | When |
|---|---|---|
| Prove the guards work | `python3 tools/selftest.py` (Windows: `python tools\selftest.py`); every line PASS | After any change, monthly |
| Refresh the Fabric library | Download the latest skills-for-fabric ZIP, extract, then `python3 tools/sync_fabric_library.py --source <folder>` | Quarterly |
| Add or change infra repo paths | `python3 tools/setup_paths.py --infra <path>` | When repos change |
| Keep internal names out of web searches | Edit `COMPANY_INTERNAL_SUFFIXES` and `INTERNAL_TERMS` in `.claude/hooks/guard_config.py`, then run the self-test | When names change |
| Use your team's ADR format | Put the template in `kb/templates/team-adr.md` | Once |

| Problem | Fix |
|---|---|
| No KB-GUARD banner, or "hook error" | Wrong Python path: re-run `setup_paths.py`, then `selftest.py` |
| "Settings Error" dialog at startup | Choose fix or exit, **never** "continue without" - that drops every guard |
| Banner says "Fabric library MISSING" | Run `sync_fabric_library.py` |
| Banner shows SETUP WARNING | Read the warning text; usually a removed deny rule or a re-enabled plugin |
| Claude seems to need Fabric, Azure, Power BI or Git access | By design it can't. Ask for an explanation, or for local steps you run yourself |
| Can't read a .docx or .pptx | Export to PDF or Markdown first |

## 10. Don't
- Don't paste secrets, tokens, connection strings or tenant IDs. Prompts with secrets are blocked; rotate any you exposed.
- Don't edit `.claude/settings.json` or the hooks to "unblock" something; that removes your protection.
- Don't keep inbox files after capture.
- Don't treat the library or UNVERIFIED answers as final for limits, SKUs, prices or preview/GA status; `/validate` them.
- Don't let a big decision go by without `/challenge` and an ADR.
