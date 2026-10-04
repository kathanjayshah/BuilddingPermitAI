# Commit messages

This repo uses **Conventional Commits**. Humans and any AI assistant follow this file. It is editor-neutral.

Entry for agents: [`AGENTS.md`](../AGENTS.md) → this guide.

## Format

```text
<type>(optional-scope): <short summary in imperative mood>

[optional body: why, not a file list]

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

Hard rules:

- Only create a commit when the user **explicitly** asks to commit.
- Never update git config.
- Never commit `.env.local`, credentials, or secrets (`.env.example` is OK).
- Never `--no-verify` / skip hooks unless the user asks.
- Never amend unless the user asks and amend safety rules allow it.
- Never force-push or run destructive git commands unless the user asks.

Workflow:

1. Run in parallel: `git status`, `git diff`, `git diff --staged`, `git log -5 --oneline`
2. Choose `type` / optional `scope` from the diff.
3. Draft subject + optional body (match recent log tone if history exists).
4. Stage relevant files only. Do not stage secrets.
5. Commit with HEREDOC:

```bash
git commit -m "$(cat <<'EOF'
type(scope): summary

Optional body.

EOF
)"
```

6. Run `git status` to confirm success.
7. If a hook rejects the commit, fix and create a **new** commit (do not amend unless allowed).

## Suggested message for the current MVP tree

Use when creating the first commit of this branch:

```text
feat: scaffold building permit MVP with S3 storage and PDF viewer

Add Next.js workspace UI, mock email auth, TanStack services/hooks,
LocalStack object storage with same-origin PDF proxy, scrollable
react-pdf viewer (WASM for scanned permits), Prisma/Postgres Compose,
and docs including commit conventions.
```
