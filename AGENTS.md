<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev`. Verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Building Permit AI — agent notes

## Response language (required)

Write every chat reply in **ASD-STE100** (Simplified Technical English).

Rule file (always on): [`.cursor/rules/asd-ste100.mdc`](.cursor/rules/asd-ste100.mdc)

- Use short sentences and active voice.
- Use simple words. Do not use slang or idioms.
- Keep code, paths, APIs, and commit subjects unchanged.

## Docs

Project documentation lives in [`docs/`](docs/README.md). Prefer updating those docs when behavior or setup changes.

## Commits

Use **Conventional Commits** for every commit in this repo:

```text
<type>(optional-scope): <imperative summary>
```

Types: `feat` · `fix` · `docs` · `chore` · `refactor` · `style` · `test` · `perf`

Full guide: [`docs/commits.md`](docs/commits.md)

When the user asks to commit or draft a commit message, **read and follow** the project skill:

[`.cursor/skills/commit/SKILL.md`](.cursor/skills/commit/SKILL.md)

Only commit when the user explicitly asks. Never commit `.env.local` or secrets.
