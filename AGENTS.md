# PROJECT KNOWLEDGE BASE

**Generated:** 2026-04-28
**Commit:** f1a48dd
**Branch:** main

## OVERVIEW

pnpm monorepo scaffold for "IFSC-estrutura-de-dados" (data structures course project). Uses Biome for linting, Turbo for build orchestration, Husky + lint-staged for git hooks. `apps/` and `packages/` are empty — project is in early scaffold phase.

## STRUCTURE

```
ifsc-estrutura-de-dados/
├── .agents/skills/skill-creator/   # Skill creation toolkit (Python + MD)
├── apps/                           # (empty) — intended app workspace
├── packages/                        # (empty) — intended package workspace
├── .husky/                         # Git hooks (husky)
├── biome.json                       # Biome: tabs, double quotes JS
├── turbo.json                       # Turbo pipeline: build, dev, lint, test, typecheck
└── pnpm-workspace.yaml             # Workspace: apps/*, packages/*
```

## WHERE TO LOOK

| Task                    | Location                                    | Notes                                               |
| ----------------------- | ------------------------------------------- | --------------------------------------------------- |
| Skill creation workflow | `.agents/skills/skill-creator/SKILL.md`     | Full skill lifecycle                                |
| Skill eval scripts      | `.agents/skills/skill-creator/scripts/`     | Python: run_eval, run_loop, aggregate_benchmark     |
| Skill eval viewer       | `.agents/skills/skill-creator/eval-viewer/` | generate_review.py + viewer.html                    |
| Lint config             | `biome.json`                                | Tabs, double-quote JS, organizeImports on           |
| Build pipeline          | `turbo.json`                                | build depends on ^build; dev is persistent/no-cache |
| Git hooks               | `.husky/` + `.lintstagedrc.js`              | Biome check on \*.{ts,tsx,js,jsx}                   |

## CODE MAP

| Symbol                | Type          | Location                                                      | Role                                |
| --------------------- | ------------- | ------------------------------------------------------------- | ----------------------------------- |
| `run_loop`            | Python module | `.agents/skills/skill-creator/scripts/run_loop.py`            | Skill description optimization loop |
| `run_eval`            | Python module | `.agents/skills/skill-creator/scripts/run_eval.py`            | Run skill evaluations               |
| `aggregate_benchmark` | Python module | `.agents/skills/skill-creator/scripts/aggregate_benchmark.py` | Aggregate eval results              |
| `generate_review`     | Python module | `.agents/skills/skill-creator/eval-viewer/generate_review.py` | Launch eval viewer                  |
| `package_skill`       | Python module | `.agents/skills/skill-creator/scripts/package_skill.py`       | Package skill into .skill file      |
| `improve_description` | Python module | `.agents/skills/skill-creator/scripts/improve_description.py` | Optimize skill description          |
| `quick_validate`      | Python module | `.agents/skills/skill-creator/scripts/quick_validate.py`      | Quick skill validation              |
| `grader`              | MD agent spec | `.agents/skills/skill-creator/agents/grader.md`               | Eval assertion grader               |
| `comparator`          | MD agent spec | `.agents/skills/skill-creator/agents/comparator.md`           | Blind A/B comparison                |
| `analyzer`            | MD agent spec | `.agents/skills/skill-creator/agents/analyzer.md`             | Benchmark analysis                  |

## CONVENTIONS

- **Indentation**: Tabs (Biome config — deviation from JS default of 2 spaces)
- **JS quotes**: Double quotes (Biome `javascript.formatter.quoteStyle: "double"`)
- **Module system**: ESM (`"type": "module"` in root package.json)
- **Package manager**: pnpm 9.0.0 (via `packageManager` field)
- **Lint-staged**: Runs `biome check --write` on staged JS/TS files only

## ANTI-PATTERNS (THIS PROJECT)

- No `.eslintrc` / `.prettierrc` — Biome replaces both; don't add them
- Don't use npm or yarn — pnpm is mandated via `packageManager` field
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

- `apps/` and `packages/` are empty — project is scaffold-only, no implementation yet
- Turbo pipeline caches builds; `dev` explicitly sets `"cache": false`
- `.lintstagedrc.js` uses ESM export default (not CJS module.exports)
- `.agents/skills/skill-creator/SKILL.md` is 485 lines — use progressive disclosure, check `references/` for schemas
