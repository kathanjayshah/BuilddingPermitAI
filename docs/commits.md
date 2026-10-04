# Commit messages

This repo uses **Conventional Commits** so history stays scannable and agents can draft messages the same way every time.

Canonical agent workflow: `.cursor/skills/commit/SKILL.md` (invoke with the commit skill / ask to commit).

## Format

```text
<type>(optional-scope): <short summary in imperative mood>

[optional body — why, not a file list]

[optional footer]
```

Rules:

- Subject ≤ ~72 characters
- Imperative mood: "add", "fix", "document" (not "added" / "fixes")
- No trailing period on the subject
- Body explains **why** when useful; skip for tiny changes
- One logical change per commit when practical

## Types

| Type       | Use when |
| ---------- | -------- |
| `feat`     | New user-facing capability or meaningful API/UI feature |
| `fix`      | Bug fix (wrong behavior, blank PDF, broken upload, …) |
| `docs`     | Documentation only |
| `chore`    | Tooling, deps, Compose, scripts, ignore files, housekeeping |
| `refactor` | Code change with no intended behavior change |
| `style`    | Formatting only (Prettier); no logic change |
| `test`     | Adding or updating tests |
| `perf`     | Performance improvement |

## Scopes (optional, lowercase)

Use a short area name when it helps:

| Scope       | Examples |
| ----------- | -------- |
| `permits`   | Upload, list, permit APIs |
| `viewer`    | PDF viewer, highlights |
| `storage`   | S3 / LocalStack / proxy |
| `auth`      | Session cookie / gate |
| `norms`     | City norms |
| `reviews`   | Stub review runs |
| `db`        | Prisma / migrations |
| `docker`    | Compose / Colima |
| `ui`        | Layout, sidebar, shared components |
| `deps`      | Dependency bumps |

Omit scope when the change spans many areas (e.g. initial MVP).

## Examples

```text
feat(storage): store permit PDFs in LocalStack S3

Keep only storageKey and fileUrl in the mock store. Proxy bytes
through GET /api/permits/:id/file so react-pdf stays same-origin.
```

```text
fix(viewer): load PDF.js WASM for scanned JPEG2000 permits

Without wasmUrl, pages rendered blank white despite a 200 file response.
```

```text
docs: document S3, services, and PDF viewer setup
```

```text
chore(docker): add LocalStack service for local S3
```

```text
feat(viewer): scroll all pages in a fixed-height pane

Replace Prev/Next with continuous scroll inside the viewport.
```

## How to commit (humans)

```bash
git status
git diff
git add <paths>          # or git add -A when intentional
git commit -m "$(cat <<'EOF'
feat(scope): short summary

Optional body.

EOF
)"
git status
```

Do **not** commit `.env.local` or secrets. `.env.example` is fine.

## How to commit (agents)

1. Read `.cursor/skills/commit/SKILL.md` and follow it.
2. Only commit when the user explicitly asks.
3. Draft the message from the **diff**, using the types above.
4. Prefer HEREDOC for the message (see skill).
5. Never amend a pushed commit; never `--no-verify` unless asked.

## Suggested message for the current MVP tree

Use when creating the first commit of this branch:

```text
feat: scaffold building permit MVP with S3 storage and PDF viewer

Add Next.js workspace UI, mock email auth, TanStack services/hooks,
LocalStack object storage with same-origin PDF proxy, scrollable
react-pdf viewer (WASM for scanned permits), Prisma/Postgres Compose,
and docs including commit conventions.
```
