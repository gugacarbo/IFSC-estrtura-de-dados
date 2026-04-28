# Java Course Project — HashTable Licensing System

**Generated:** 2026-04-28
**Assignment:** TR2 — Tabela de Dispersão

## OVERVIEW

Java course project: HashTable licensing system with collision handling via linked lists. Matricula-based parameters.

## STRUCTURE

```
estrutura_de_dados-TR2/
├── Main.java         # Entry point: insert, query, remove, display
├── HashTable.java    # Core: hash(id) = (id * 5) % 72, chaining
├── Node.java         # Linked list node (id, proximo)
└── REAME.md         # Assignment spec (Portuguese)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Entry point | `Main.java` | Generates 1000 random IDs, runs test scenarios |
| Hash logic | `HashTable.java` | m=72, multiplier=5, external chaining |
| Node structure | `Node.java` | Simple POJO: id + proximo pointer |
| Assignment spec | `REAME.md` | Portuguese, matricula-based parameters |

## CONVENTIONS

- **Language**: Java (no package declarations, default package)
- **Comments**: Portuguese (e.g., "Tabela de Dispersão", "licenças")
- **Naming**: Portuguese variables (`proximo`, `inserir`, `remover`)
- **Hash params**: m=72, multiplier=5 (derived from matricula `202312345`)
- **Collision handling**: External addressing (linked lists)

## ANTI-PATTERNS

- No JUnit tests — manual testing via `main()`
- No `package` declarations — all classes in default package
- No access modifiers on class declarations (package-private)
- Matricula parameters hardcoded (not configurable)

## NOTES

- ID range: 1–6000 (based on last digit of matricula + 1) * 1000
- Hash function: `hash(id) = (id * 5) % 72` (penultimate digit + 1 = 4+1 = 5)
- Table size: m=72 (sum of digits % 100 + 50 = 22 + 50)
- REAME.md has typo in filename (should be README.md)
