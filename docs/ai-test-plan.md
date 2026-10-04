# AI review test plan

Use this checklist while you build and when you swap to AWS.

Related design: [ai-architecture.md](./ai-architecture.md)  
Related plan: [plans/ai-local-first-aws-ready.md](./plans/ai-local-first-aws-ready.md)

## Now (no AI code; current MVP)

- [ ] Create a permit with **Permit Title**, **Permit type**, and a PDF
- [ ] Open `/permits/[id]`; confirm the PDF scrolls and the header shows **Page X of Y**
- [ ] Add 1-2 city norms (short paste text)
- [ ] On Reviews, select the permit + norms and run the stub review
- [ ] Confirm the run stores `permitId` + `normIds` and status is stubbed (no LLM findings yet)

## Phase A (local extract + local/cheap LLM)

Fixture idea: one digital PDF with selectable text + two short norms (one relevant, one irrelevant).

- [ ] Extract returns non-empty page text for the digital PDF
- [ ] Packed prompt contains permit text and only the selected norms
- [ ] LLM returns schema-valid findings (pass/fail, note, optional page hint)
- [ ] Reviews UI leaves stub-only behavior and shows findings
- [ ] Optional: a finding with a page number can create a PDF highlight
- [ ] Image-only scanned PDF may fail extract locally; document that as expected until Phase B

## Phase B (Textract + Bedrock swap)

Same fixtures; set `EXTRACT_PROVIDER=textract` and `LLM_PROVIDER=bedrock`.

- [ ] Digital PDF still extracts and reviews successfully
- [ ] One scanned (image-only) PDF produces text via Textract
- [ ] Findings still match the same JSON schema
- [ ] Log latency and approximate cost per run
- [ ] No change required to review API contract (`permitId` + `normIds`)

## Phase C (RAG later)

- [ ] Large norm corpus: retrieval returns top-k chunks, not a full dump
- [ ] Packed prompt includes retrieved passages only
- [ ] Findings can cite chunk ids
- [ ] Explicit user-selected norms still work without RAG when the set is small
