# AI architecture

## Starting path: extract + prompt packing

For the first real LLM integration, keep the pipeline simple:

1. **Extract** text from the selected permit PDF (library or OCR service).
2. **Select** city-norm documents the user attached for that review.
3. **Pack** extracted permit text + selected norm text into a single LLM prompt (or a small set of messages).
4. **Return** structured findings (pass/fail items, citations into the packed norms).

This matches the current stub review API, which already records `permitId` + `normIds`. The stub is the booking of inputs. The next step fills in extraction and the model call.

## When to add Postgres pgvector RAG

Add RAG only when selected corpora routinely exceed reliable context windows, or when users accumulate large municipal libraries that should not be pasted wholesale.

Suggested evolution:

1. Store norm documents and chunks in Postgres.
2. Enable `pgvector` in the same database.
3. Embed chunks and retrieve top-k relevant passages for the permit under review.
4. Pack retrieved passages (not the entire corpus) into the LLM prompt.

Until then, prefer explicit user selection of norms. Explicit selection is easier to debug and keeps the product honest about what was reviewed.

## Out of scope for the stub

- Calling any LLM provider
- Streaming review results
- Evaluation harnesses
- Automatic municipal site crawling (UI stub only via `source: "web_stub"`)
