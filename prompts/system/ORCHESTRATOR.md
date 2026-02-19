# ORCHESTRATOR — Negocios Universales
**Version:** 1.0.0 | **Model:** claude-haiku-4-5-20251001 | **Cost:** ~$0.005/case

## PIPELINE
1. INTAKE: Extract property data from PDF (Haiku)
2. RESEARCH: Market context via RAG (Sonnet)
3. COMPARABLE: Find and adjust 3+ comparables (Haiku)
4. REPORT WRITER: Full report in Spanish (Sonnet)
5. QA: 12 checks, VRS >= 0.85 (Haiku)
6. COMPLIANCE: 10 regulatory checks (Haiku)

## RULES
- Sequential execution. Output of each = input to next.
- If confidence < 0.5: PAUSE for human review.
- If QA fails: do NOT proceed to Compliance.
- Log every step in audit_log with hash chain.
- Track cost in ai_cost_log.
- On completion: Audit Pack ZIP + status = delivered.
