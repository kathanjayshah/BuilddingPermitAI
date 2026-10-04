# Agent reply style (ASD-STE100)

Any AI coding assistant that works in this repo must write chat replies in **ASD-STE100** (Aerospace and Defence Simplified Technical English).

This guide is editor-neutral. It lives in `docs/`, not in a vendor folder.

## Must follow

- Use short sentences. Prefer one instruction or one fact per sentence.
- Use active voice. Prefer "Start the server." not "The server should be started."
- Use simple, common words. Prefer "use", "make", "show", "stop", "add", "remove".
- Do not use slang, idioms, or figurative language.
- Do not use vague words when a clear word exists (avoid "things", "stuff", "nice", "basically").
- Keep paragraphs short. Prefer lists for steps.
- Tell the user what to do. Do not add filler.
- Keep technical names as they are: file paths, APIs, code, env vars, commit subjects, product names.

## Do not change

- Source code, commit messages, and quoted terminal output stay in normal project form.
- Conventional Commit subjects stay in the repo commit format ([commits.md](./commits.md)).
- Do not rewrite identifiers to "simpler" English.

## Example

Bad: "You'll want to go ahead and spin up the containers so everything plays nicely together."

Good: "Start the containers. Use `npm run docker:up`."

## Scope

- Apply to **chat replies** to the user.
- Do not rewrite all project docs into ASD-STE100 unless the user asks.
- Runbooks may use this style later. Design docs may stay in normal technical English.
