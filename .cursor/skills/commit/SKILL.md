---
name: commit
description: >-
  Create git commits using this repo's Conventional Commits format
  (feat/fix/docs/chore/…). Use when the user asks to commit, draft a
  commit message, or invoke the commit skill.
---

# Commit (Building Permit AI)

Follow this skill whenever the user asks to **commit**, **make a commit**, or **draft a commit message** in this repo.

Also read [docs/commits.md](../../../docs/commits.md) for examples and scope names.

## Hard rules

- Only create a commit when the user **explicitly** asks to commit.
- Never update git config.
- Never commit `.env.local`, credentials, or secrets (`.env.example` is OK).
- Never `--no-verify` / skip hooks unless the user asks.
- Never amend unless the user asks **and** the amend safety rules in the user git protocol are met.
- Never force-push or destructive git commands unless explicitly requested.

## Message format

```text
<type>(optional-scope): <imperative summary>

[optional body — why]
```

### Types

| Type | When |
| --- | --- |
| `feat` | New capability |
| `fix` | Bug fix |
| `docs` | Docs only |
| `chore` | Tooling, Compose, scripts, deps, housekeeping |
| `refactor` | No intended behavior change |
| `style` | Formatting only |
| `test` | Tests |
| `perf` | Performance |

### Scopes (optional)

`permits` · `viewer` · `storage` · `auth` · `norms` · `reviews` · `db` · `docker` · `ui` · `deps`

Omit scope for broad/multi-area commits.

### Style

- Imperative: "add", "fix", "document"
- Subject ≤ ~72 chars, no trailing period
- Body = why (not a file dump)
- Prefer one logical change per commit

## Workflow

Run in parallel first:

```bash
git status
git diff
git diff --staged
git log -5 --oneline
```

Then:

1. Choose `type` / optional `scope` from the diff.
2. Draft subject + optional body (follow recent `git log` tone if history exists).
3. Stage relevant files only (`git add <paths>`). Do not stage secrets.
4. Commit with HEREDOC:

```bash
git commit -m "$(cat <<'EOF'
type(scope): summary

Optional body.

EOF
)"
```

5. Run `git status` to confirm success.
6. If a hook rejects the commit, fix and create a **new** commit (do not amend unless allowed).

## Examples

```text
feat(storage): store permit PDFs in LocalStack S3
```

```text
fix(viewer): load PDF.js WASM for scanned JPEG2000 permits
```

```text
docs: document S3, services, and PDF viewer setup
```

```text
chore(docker): add LocalStack service for local S3
```

## First-commit template (MVP)

If the branch has no commits yet and the tree is the full MVP scaffold:

```text
feat: scaffold building permit MVP with S3 storage and PDF viewer

Add Next.js workspace UI, mock email auth, TanStack services/hooks,
LocalStack object storage with same-origin PDF proxy, scrollable
react-pdf viewer (WASM for scanned permits), Prisma/Postgres Compose,
and docs including commit conventions.
```
