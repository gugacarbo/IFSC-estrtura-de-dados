# PROJECT KNOWLEDGE BASE

**Generated:** 2026-04-28
**Commit:** b0953dc
**Branch:** main

## OVERVIEW

pnpm monorepo for "IFSC-estrutura-de-dados" (data structures course). Biome linting, Turbo build orchestration, Husky + lint-staged git hooks. `apps/` contains Java course projects; `packages/` empty scaffold.

## STRUCTURE

```
ifsc-estrutura-de-dados/
├── apps/
├── .agents/skills/                 # Skill system (skill-creator toolkit)
├── .husky/                         # Git hooks (husky)
├── biome.json                       # Biome: tabs, double quotes JS
├── turbo.json                       # Turbo pipeline: build, dev, lint, test, typecheck
└── pnpm-workspace.yaml             # Workspace: apps/*, packages/*
```

## WHERE TO LOOK

| Task | Location | Notes |
| ---- | -------- | ----- |
| Lint config             | `biome.json`                                | Tabs, double-quote JS, organizeImports on           |
| Build pipeline          | `turbo.json`                                | build depends on ^build; dev is persistent/no-cache |
| Git hooks               | `.husky/` + `.lintstagedrc.js`              | Biome check on \*.{ts,tsx,js,jsx}                   |
| Course projects    | `apps/`                                     | HashTable, Node, Main per assignment                |
| Skill creator toolkit   | `.agents/skills/skill-creator/`             | Python scripts, SKILL.md, eval-viewer               |

## CONVENTIONS

- **Indentation**: Tabs (Biome config — deviation from JS default of 2 spaces)
- **JS quotes**: Double quotes (Biome `javascript.formatter.quoteStyle: "double"`)
- **Module system**: ESM (`"type": "module"` in root package.json)
- **Package manager**: pnpm 10.33.2 (via `packageManager` field)
- **Lint-staged**: Runs `biome check --write` on staged JS/TS files only

## ANTI-PATTERNS (THIS PROJECT)

- No `.eslintrc` / `.prettierrc` — Biome replaces both; don't add them
- `apps/` and `packages/` are workspace targets — new code goes in one of these, not root

## UNIQUE STYLES

- Skill system lives in `.agents/` (not standard `.github/` or `scripts/`)
- `SKILL.md` (all-caps) for skill definitions — not `README.md` or `skill.md`
- Python scripts in skill-creator use `-m` invocation (e.g., `python -m scripts.run_loop`)

## COMMANDS

```bash
pnpm dev              # Turbo dev (no cache, persistent)
pnpm build            # Turbo build (depends on ^build)
pnpm test             # Turbo test
pnpm lint             # Turbo lint
pnpm format           # Turbo format
pnpm typecheck        # Turbo typecheck
pnpm format:check     # Biome check (root level)
pnpm lint:staged      # Run lint-staged manually
```

## NOTES

- `apps/` contains Course projects
- Turbo pipeline caches builds; `dev` explicitly sets `"cache": false`
- `.lintstagedrc.js` uses ESM export default (not CJS module.exports)
