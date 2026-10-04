<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev`. Verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Building Permit AI - agent notes

This file is the **editor-neutral** entry for AI assistants (Cursor, VS Code, Claude Code, Copilot, Zed, and others). Project rules live in `docs/`, not in a vendor-only folder.

## Response language (required)

Write every chat reply in **ASD-STE100** (Simplified Technical English).

Full guide: [`docs/agent-style.md`](docs/agent-style.md)

- Use short sentences and active voice.
- Use simple words. Do not use slang or idioms.
- Keep code, paths, APIs, and commit subjects unchanged.
- Never use an em dash (`—`) in replies, docs, UI copy, or code comments. Use a hyphen (`-`), colon, or a new sentence instead.

## UI components

For new UI, use **shadcn/ui** in `src/components/ui/` (Select, Checkbox, Dialog, and so on). Do not add native `<select>` or other native controls when a shadcn primitive exists. Details: [`docs/frontend.md`](docs/frontend.md).

## Docs

Project documentation: [`docs/README.md`](docs/README.md). Update docs when behavior or setup changes.

## Commits

Use **Conventional Commits**:

```text
<type>(optional-scope): <imperative summary>
```

Types: `feat` · `fix` · `docs` · `chore` · `refactor` · `style` · `test` · `perf`

When the user asks to commit or draft a commit message, **read and follow** [`docs/commits.md`](docs/commits.md).

Only commit when the user explicitly asks. Never commit `.env.local` or secrets.
