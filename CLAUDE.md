# CLAUDE.md — Testing Repository Root

## What This Repo Is

This is `srsharmaamit/Testing` — a multi-project monorepo-style repository. The primary production application is **StockLens** (`stocklens/`), a live stock-risk intelligence dashboard built with Next.js 14 + TypeScript.

Other files at root (SQL scripts, HTML prototypes, Markdown flows) are standalone explorations and NOT part of StockLens.

## Active Development Branch

Always develop on: `claude/stocklens-dashboard-Ihr7V`
Never push directly to `main` without a PR.

## Project Map

```
Testing/
├── stocklens/              ← PRIMARY PROJECT — read stocklens/CLAUDE.md next
│   ├── src/
│   │   ├── app/            ← Next.js App Router pages + API routes
│   │   ├── components/     ← React UI components
│   │   ├── lib/            ← Core business logic (FMP client, cache, scoring engine)
│   │   └── types/          ← TypeScript interfaces
│   └── CLAUDE.md           ← Full project context — read this for StockLens tasks
├── CLAUDE.md               ← This file (repo root orientation)
└── [misc prototype files]  ← Ignore for StockLens work
```

## Quick Navigation

| Task | File to read |
|------|-------------|
| Understand StockLens | `stocklens/CLAUDE.md` |
| Change scoring weights | `stocklens/src/lib/scoring/config.ts` |
| Add a new API route | `stocklens/src/app/api/` |
| Run tests | `cd stocklens && npm test` |
| Change UI | `stocklens/src/app/page.tsx`, `stocklens/src/components/` |

## Git Workflow

```bash
git checkout claude/stocklens-dashboard-Ihr7V
# make changes inside stocklens/
git add stocklens/<files>
git commit -m "type: description"
git push -u origin claude/stocklens-dashboard-Ihr7V
```
