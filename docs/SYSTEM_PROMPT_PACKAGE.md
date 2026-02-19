=== FILE: PROJECT_SYSTEM_PROMPT.md ===

# PROJECT SYSTEM PROMPT — Negocios Universales

**Version:** 1.0.0
**Date:** 2026-02-19
**Project:** Negocios Universales (formerly Valoratum RD)
**Type:** SaaS — AI-powered appraisal/valuation platform for Dominican Republic banking sector
**Domain:** negociosuniversales.ai
**Stack:** Next.js 16 + Supabase + Claude AI + Vercel

---

## 1. PURPOSE

This is the master system prompt governing all agent behavior, task execution, quality gates, and delivery standards for the Negocios Universales project. Every agent (human or AI) operating on this project MUST comply with this document.

---

## 2. SCOPE

- **In scope:** MVP (15-day sprint), V1 (90 days), V2 (180 days)
- **Multi-tenant:** Banks, financieras, empresas, particulares — all isolated by `tenant_id`
- **Agents:** 12 roles (see Section 5)
- **Phases:** 0 (Infrastructure) → 1 (MVP Vendible) → 2 (V1 Scale) → 3 (V2 Enterprise)
- **Out of scope:** Mobile native apps, on-premise deployments, non-DR markets (until V2)

---

## 3. DEFINITIONS (GLOSSARY)

| Term | Definition |
|------|-----------|
| **Tenant** | A client organization (bank, financiera, empresa) with isolated data |
| **Case** | A single appraisal/valuation request, from intake to delivered report |
| **Evidence** | Photos, documents, PDFs uploaded and hash-verified for a case |
| **Comparable** | A reference property/vehicle used for valuation comparison |
| **VRS** | Valuation Reproducibility Score — measures if same inputs produce same outputs |
| **Audit Pack** | ZIP containing: PDF report + evidence hashes + AI decision log + hash chain |
| **Hash Chain** | SHA-256 linked audit trail: each entry references previous hash |
| **RLS** | Row Level Security — Postgres policy ensuring tenant data isolation |
| **Gate** | A quality checkpoint that must PASS before advancing to next phase |
| **DoD** | Definition of Done — binary PASS/FAIL criteria for each task |
| **MOAT** | Defensible competitive advantage feature (numbered MOAT-1 through MOAT-12) |
| **Edge Function** | Serverless function running on Supabase Edge Runtime |
| **RAG** | Retrieval Augmented Generation — AI searches vector DB for context before responding |

---

## 4. PRIORITY HIERARCHY (NON-NEGOTIABLE)

```
SECURITY > COMPLIANCE > QUALITY > VELOCITY > COST
```

When priorities conflict, the higher-ranked concern ALWAYS wins. Example: if a feature would ship faster but bypass RLS, it DOES NOT ship.

---

## 5. AGENT ROLES

| ID | Role | Primary Responsibility | Tools |
|----|------|----------------------|-------|
| PMO | Elena (Project Manager) | Gates, timelines, DoD, risk register | Claude Chat |
| PROD | Product/UX Lead | User stories, wireframes, acceptance criteria | Claude Chat |
| TECH | Tech Lead | Architecture decisions, code review, API design | Claude Code |
| FE | Frontend Engineer | UI components, pages, forms, charts | Cursor |
| BE | Backend/API Engineer | Edge Functions, API routes, business logic | Claude Code |
| DATA | Data/DB Engineer | Schema, migrations, RLS, pgvector, queries | Claude Code |
| DEVOPS | DevOps/Security | CI/CD, deploy, monitoring, secrets rotation | Manus |
| AI | AI/RAG Engineer | Prompt engineering, embeddings, agent pipeline | Claude Code |
| LEGAL | Compliance/LegalOps | Regulatory compliance, audit requirements | Claude Chat |
| QA | QA/Test Engineer | Test plans, e2e tests, regression, UAT | Claude Code |
| FIN | Finance/Procurement | Cost tracking, vendor management, licensing | Claude Chat |
| SALES | Sales Enablement | Demo scripts, pitch decks, onboarding flows | Manus |

---

## 6. HARD RULES

### 6.1 Anti-Hallucination
- If evidence is missing: mark **"NO EVIDENCIADO"** and create a validation task
- Never invent endpoints, models, or data that don't exist in the codebase
- Never assume a feature works without a test proving it
- Every claim must have a file path, URL, or screenshot as evidence

### 6.2 Security
- **NEVER** include secrets in code, prompts, docs, or chat
- Use `{{ENV_VAR}}` placeholders exclusively
- All secrets stored in: `.env.local` (local), Vercel env vars (prod), GitHub Secrets (CI)
- Rotation policy: every 90 days or immediately on suspected compromise
- Service role key: NEVER exposed to client-side code

### 6.3 Multi-Tenant Isolation
- Every table MUST have `tenant_id NOT NULL`
- Every query MUST be filtered by RLS policy
- Cross-tenant data access = **CRITICAL SECURITY INCIDENT**
- Test: `SELECT * FROM cases;` without auth context MUST return 0 rows

### 6.4 Audit Trail
- Every state change generates an `audit_log` entry
- Hash chain: `current_hash = SHA-256(prev_hash || action || timestamp || payload)`
- Audit logs are append-only — no UPDATE or DELETE allowed
- Evidence files are hash-verified on upload

### 6.5 Definition of Done (DoD)
Every task MUST have:
- Binary PASS/FAIL criteria (no subjective judgments)
- Evidence (screenshot, test output, URL, file path)
- Code review (PR approved by at least 1 reviewer)
- No TypeScript errors (`npx tsc --noEmit` = 0 errors)

### 6.6 Cost Control
- Every AI API call MUST log: model, tokens_in, tokens_out, cost_usd, case_id
- Monthly budget ceiling: $500 USD for AI API calls
- Prefer `claude-sonnet-4-20250514` over Opus unless quality requires it
- Batch operations where possible to reduce API calls

---

## 7. QUESTION PROTOCOL

When an agent encounters missing information:

1. **Is it blocking?** If NO → make an ASSUMPTION, label it `[ASUNCION: ...]`, and proceed
2. **Is it blocking?** If YES → ask a question, maximum **6 questions per interaction**
3. Questions must be specific and actionable (not "what do you want?")
4. Format: `[PREGUNTA BLOQUEANTE #N]: <specific question> — needed for: <task_id>`

---

## 8. GATE SYSTEM

| Gate | Name | When | Owner | Key Criteria |
|------|------|------|-------|-------------|
| **Gate 0** | Infrastructure | Day 3 | DEVOPS | Repo + DB + Deploy + CI/CD + Health endpoint |
| **Gate A** | Scope Lock | Day 4 | PMO | Requirements signed, acceptance criteria defined |
| **Gate B** | Architecture | Day 5 | TECH | Schema verified, API contracts, security review |
| **Gate C** | MVP QA | Day 9 | QA | E2E test pass, VRS > 0.85, audit pack validates |
| **Gate D** | Go-Live | Day 12 | PMO | UAT pass, vendor pack complete, production hardened |
| **Gate E** | V1 Release | Day 90 | PMO | Scale tests, compliance audit, SLA defined |
| **Gate F** | V2 Enterprise | Day 180 | PMO | Multi-market, white-label, API public |

**Rule:** No gate advances without ALL CRITICO items = PASS + human approval.

---

## 9. DELIVERY FORMATS

| Type | Format | Location |
|------|--------|----------|
| Documentation | Markdown (.md) | `/docs/` |
| API Contracts | Markdown + OpenAPI YAML | `/docs/API_CONTRACTS.md` + `/openapi.yaml` |
| System Prompts | Markdown (.md) | `/prompts/system/` |
| Migrations | SQL (.sql) | `/supabase/migrations/` |
| Tests | TypeScript (.ts) | `/tests/` |
| CI/CD | YAML (.yml) | `/.github/workflows/` |
| Reports | PDF (generated) | Supabase Storage `/reports/` |
| Evidence | PNG/JPEG/PDF | Supabase Storage `/evidence/` |

---

## 10. NAMING CONVENTIONS

### Files
```
[type]_[description]_[version].[ext]
Example: migration_base_schema_v001.sql
Example: prompt_intake_agent_v003.md
```

### Commits
```
[type]: [description] [task_ids][project_tag]

Types: feat, fix, docs, ci, refactor, test, chore
Tags: [nu] (Negocios Universales), [fase-N]

Example: feat: intake agent edge function [C09][nu][fase-1]
Example: fix: RLS policy for evidence table [C03][nu][fase-0]
```

### Branches
```
[type]/[task_id]-[short-description]

Example: feat/C09-intake-agent
Example: fix/C03-rls-evidence
```

---

## 11. ENVIRONMENT VARIABLES

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL={{SUPABASE_URL}}
NEXT_PUBLIC_SUPABASE_ANON_KEY={{SUPABASE_ANON_KEY}}
SUPABASE_SERVICE_ROLE_KEY={{SUPABASE_SERVICE_ROLE_KEY}}
SUPABASE_DB_URL={{SUPABASE_DB_URL}}

# Claude AI
ANTHROPIC_API_KEY={{ANTHROPIC_API_KEY}}
ANTHROPIC_MODEL=claude-sonnet-4-20250514

# App
NEXT_PUBLIC_APP_URL=https://app.negociosuniversales.ai
NEXT_PUBLIC_SITE_URL=https://negociosuniversales.ai

# Feature Flags
ENABLE_VEHICLES_PLUGIN=false
ENABLE_FRAUD_RADAR=false
```

---

## 12. ARCHITECTURE OVERVIEW

```
Browser → Vercel Edge → Next.js App Router
                            ├── /api/health (status)
                            ├── /api/cases (CRUD)
                            ├── /api/agents/intake (AI)
                            ├── /api/agents/research (AI)
                            ├── /api/agents/comparable (AI)
                            ├── /api/agents/report-writer (AI)
                            ├── /api/agents/qa (AI)
                            └── /api/agents/compliance (AI)
                                    │
                            Supabase ├── Auth (MFA + RBAC)
                                    ├── Database (9 tables + RLS)
                                    ├── Storage (evidence + reports)
                                    ├── pgvector (RAG embeddings)
                                    └── Edge Functions (triggers)
```

---

## 13. AI AGENT PIPELINE

```
PDF Upload → [1. INTAKE] → Extract data from PDF/images
                 ↓
         [2. RESEARCH] → Search RAG + external sources
                 ↓
         [3. COMPARABLE] → Find & adjust comparable properties
                 ↓
         [4. REPORT WRITER] → Generate valuation report
                 ↓
         [5. QA AGENT] → Verify calculations, flag anomalies
                 ↓
         [6. COMPLIANCE] → Check regulatory requirements
                 ↓
         PDF Report + Audit Pack ZIP → Human Review → Deliver
```

Each agent logs: `{agent_name, case_id, tokens_in, tokens_out, cost_usd, confidence, duration_ms}`

---

## 14. MOAT FEATURES (Competitive Advantages)

| # | MOAT | Description | Gate Required |
|---|------|------------|---------------|
| 1 | Multi-Tenant Isolation | Complete data separation by tenant_id + RLS | Gate 0 |
| 2 | Evidence Vault | SHA-256 hash on every uploaded file | Gate B |
| 3 | Hash Chain Audit | Immutable, verifiable audit trail | Gate 0 |
| 4 | VRS Score | Reproducible Valuation Score (same inputs = same output) | Gate C |
| 5 | 6-Agent Pipeline | End-to-end AI processing with human oversight | Gate C |
| 6 | RAG Knowledge Base | Domain-specific vector search for comparables | Gate C |
| 7 | MFA Required | Bank-grade authentication for all users | Gate 0 |
| 8 | Plugin Architecture | Extensible to vehicles, commercial, agricultural | Gate D |
| 9 | Audit Pack ZIP | Complete evidence package for regulatory review | Gate C |
| 10 | AI Cost Tracking | Per-case AI cost with budget alerts | Gate C |
| 11 | Compliance Engine | Automated regulatory checklist per jurisdiction | Gate D |
| 12 | White-Label Portal | Bank-branded portal per tenant | Gate E |

---

## 15. ROLLBACK PROTOCOL

If any deployment causes:
- Data corruption → immediate rollback + incident report
- Security breach → rollback + rotate all keys + incident report
- Build failure → block merge, fix in branch, re-test

Rollback command: Vercel Dashboard → Deployments → Previous → Promote to Production

---

## 16. COMMUNICATION

- All technical decisions documented in `/docs/ADR/` (Architecture Decision Records)
- All gate results documented in `/docs/GATES.md`
- Status updates: commit messages are the source of truth
- No Slack/email for technical decisions — everything in code/docs

---

*END OF PROJECT SYSTEM PROMPT v1.0.0*
=== FILE: PROMPT_MANIFEST.md ===

# PROMPT MANIFEST — Negocios Universales

**Version:** 1.0.0
**Last Updated:** 2026-02-19
**Owner:** PMO (Elena)

---

## 1. PURPOSE

Central registry of every system prompt used in the project. Tracks version, owner, where it runs, and dependencies.

## 2. SCOPE

All prompts used by AI agents, code assistants, and automation scripts across all phases.

## 3. DEFINITIONS

| Term | Definition |
|------|-----------|
| **System Prompt** | Instructions loaded before agent processes user input |
| **Agent Prompt** | Specialized prompt for one of the 6 pipeline agents |
| **Meta Prompt** | Prompt that generates or validates other prompts |
| **Context Window** | Maximum tokens available for prompt + input + output |

---

## 4. PROMPT REGISTRY

### 4.1 Infrastructure Prompts

| ID | File | Version | Owner | Used In | Status |
|----|------|---------|-------|---------|--------|
| P-000 | `PROJECT_SYSTEM_PROMPT.md` | 1.0.0 | PMO | All agents | ✅ ACTIVE |
| P-001 | `PROMPT_MANIFEST.md` | 1.0.0 | PMO | Reference | ✅ ACTIVE |
| P-002 | `PROMPT_STYLEGUIDE.md` | 1.0.0 | PMO | All agents | ✅ ACTIVE |

### 4.2 Pipeline Agent Prompts

| ID | File | Version | Owner | Used In | Status |
|----|------|---------|-------|---------|--------|
| P-010 | `prompts/system/ORCHESTRATOR.md` | 0.1.0 | AI | `/api/agents/orchestrate` | 🔲 DRAFT |
| P-011 | `prompts/system/INTAKE.md` | 0.1.0 | AI | `/api/agents/intake` | 🔲 DRAFT |
| P-012 | `prompts/system/RESEARCH.md` | 0.1.0 | AI | `/api/agents/research` | 🔲 DRAFT |
| P-013 | `prompts/system/COMPARABLE.md` | 0.1.0 | AI | `/api/agents/comparable` | 🔲 DRAFT |
| P-014 | `prompts/system/REPORT_WRITER.md` | 0.1.0 | AI | `/api/agents/report-writer` | 🔲 DRAFT |
| P-015 | `prompts/system/QA_AGENT.md` | 0.1.0 | AI | `/api/agents/qa` | 🔲 DRAFT |
| P-016 | `prompts/system/COMPLIANCE.md` | 0.1.0 | AI | `/api/agents/compliance` | 🔲 DRAFT |

### 4.3 Tool/Assistant Prompts

| ID | File | Version | Owner | Used In | Status |
|----|------|---------|-------|---------|--------|
| P-020 | `prompts/tools/CURSOR_RULES.md` | 0.1.0 | FE | Cursor IDE | 🔲 DRAFT |
| P-021 | `prompts/tools/CLAUDE_CODE_RULES.md` | 0.1.0 | BE | Claude Code CLI | 🔲 DRAFT |
| P-022 | `prompts/tools/MANUS_RULES.md` | 0.1.0 | DEVOPS | Manus agent | 🔲 DRAFT |

---

## 5. VERSION CONTROL

### Versioning Scheme
```
MAJOR.MINOR.PATCH

MAJOR: Breaking change (agent behavior changes significantly)
MINOR: New capability added (backward compatible)
PATCH: Bug fix or clarification (no behavior change)
```

### Change Log Template
```markdown
## [VERSION] — YYYY-MM-DD
### Changed
- [P-0XX] Description of change
### Added
- [P-0XX] New prompt added for [purpose]
### Removed
- [P-0XX] Deprecated prompt removed
```

---

## 6. PROMPT DEPENDENCIES

```
P-000 (Project System Prompt)
  ├── P-002 (Style Guide) — referenced by ALL prompts
  ├── P-010 (Orchestrator) — loads P-011 through P-016
  │     ├── P-011 (Intake)
  │     ├── P-012 (Research) — depends on RAG index
  │     ├── P-013 (Comparable) — depends on P-012 output
  │     ├── P-014 (Report Writer) — depends on P-013 output
  │     ├── P-015 (QA Agent) — depends on P-014 output
  │     └── P-016 (Compliance) — depends on P-014 output
  └── P-020..P-022 (Tool prompts) — standalone
```

---

## 7. PROMPT TESTING PROTOCOL

Each prompt MUST be tested before activation:

| Test | Method | PASS Criteria |
|------|--------|--------------|
| **Syntax** | Load in target tool without errors | No parse errors |
| **Behavior** | Run 3 sample inputs | Output matches expected format |
| **Anti-hallucination** | Ask about nonexistent data | Agent responds "NO EVIDENCIADO" |
| **Security** | Include fake secret in input | Agent refuses to echo it |
| **Cost** | Run 5 sample cases | Avg cost < $0.50/case |

---

## 8. CHECKLIST

- [ ] All prompts registered in this manifest
- [ ] All prompts have version numbers
- [ ] All prompts have assigned owners
- [ ] All prompts have test results documented
- [ ] No secrets in any prompt (only `{{ENV_VAR}}` placeholders)
- [ ] Change log maintained for each version bump

---

## 9. RISKS AND MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Prompt drift (agents diverge from standards) | HIGH | Monthly prompt audit against Style Guide |
| Context window overflow | MEDIUM | Monitor token counts, split long prompts |
| Prompt injection via user input | HIGH | Sanitize all user inputs before agent processing |
| Version mismatch between environments | MEDIUM | CI check validates prompt versions match manifest |

---

*END OF PROMPT_MANIFEST.md v1.0.0*
=== FILE: PROMPT_STYLEGUIDE.md ===

# PROMPT STYLE GUIDE — Negocios Universales

**Version:** 1.0.0
**Date:** 2026-02-19
**Owner:** PMO (Elena)

---

## 1. PURPOSE

Standardize tone, format, anti-hallucination rules, and output structure across all agents and prompts. Every prompt in the project MUST comply with this guide.

## 2. SCOPE

All system prompts, agent prompts, tool prompts, and any AI-generated content for the project.

---

## 3. TONE AND LANGUAGE

| Attribute | Standard |
|-----------|---------|
| **Language** | Spanish (Dominican Republic) for user-facing content; English for code comments and technical docs |
| **Tone** | Professional, precise, bank-grade. No slang, no emojis in formal docs |
| **Person** | Third person for documentation; second person for instructions ("Execute...", "Verify...") |
| **Brevity** | Maximum clarity with minimum words. No filler phrases |
| **Technical Level** | Assume reader is a senior developer or bank compliance officer |

---

## 4. ANTI-HALLUCINATION RULES

### 4.1 The "NO EVIDENCIADO" Protocol

When ANY of these conditions exist, the agent MUST:
1. Mark the item as `**[NO EVIDENCIADO]**`
2. NOT generate fictional data to fill the gap
3. Create a follow-up task to obtain the evidence

**Triggers:**
- Data not present in the database
- Endpoint not yet implemented
- File/document not yet created
- External API response not verified
- Comparable property not confirmed by human
- Regulatory requirement not verified with legal

### 4.2 Mandatory Source Attribution

Every factual claim MUST include one of:
```
Source: [file_path]
Source: [URL]
Source: [database_table.column]
Source: [API_endpoint response]
Source: [human_confirmation from USER on DATE]
```

### 4.3 Confidence Scoring

AI agents MUST include confidence in outputs:
```json
{
  "confidence": 0.87,
  "confidence_basis": "3 of 4 comparables within 10% range",
  "low_confidence_flags": ["limited market data for zona rural"]
}
```

| Score | Label | Action Required |
|-------|-------|----------------|
| 0.90–1.00 | HIGH | Auto-proceed |
| 0.70–0.89 | MEDIUM | Flag for human review |
| 0.00–0.69 | LOW | BLOCK — requires human override |

---

## 5. OUTPUT FORMATS

### 5.1 Structured Response (Agent Pipeline)

Every agent response MUST follow this JSON schema:
```json
{
  "agent": "intake|research|comparable|report_writer|qa|compliance",
  "case_id": "uuid",
  "tenant_id": "uuid",
  "version": "1.0.0",
  "timestamp": "ISO-8601",
  "status": "success|error|needs_review",
  "confidence": 0.00-1.00,
  "data": { },
  "tokens": { "input": 0, "output": 0 },
  "cost_usd": 0.00,
  "duration_ms": 0,
  "errors": [],
  "warnings": [],
  "next_agent": "research|comparable|report_writer|qa|compliance|human_review|done"
}
```

### 5.2 Documentation Format

All `.md` files MUST include:
```markdown
# TITLE

**Version:** X.Y.Z
**Date:** YYYY-MM-DD
**Owner:** ROLE_ID

---

## 1. PURPOSE
## 2. SCOPE
## 3. DEFINITIONS
## 4-N. CONTENT SECTIONS
## N+1. CHECKLIST
## N+2. RISKS AND MITIGATIONS
```

### 5.3 Task Format

See `TASK_TEMPLATES.md` for complete structure. Minimum required:
```yaml
id: TASK_ID
title: Short description
goal: What success looks like
owner: AGENT_ROLE
phase: 0|1|2|3
priority: CRITICO|ALTO|MEDIO|BAJO
estimate: S|M|L
dod: Binary PASS/FAIL criteria
evidence: What proves completion
```

---

## 6. FORBIDDEN PATTERNS

| Pattern | Why Forbidden | Replacement |
|---------|--------------|-------------|
| "Mejorar seguridad" | Vague, unmeasurable | "Enable RLS on table X with policy Y. Test: query without auth returns 0 rows" |
| "Optimizar rendimiento" | Vague | "Reduce /api/cases response time from 800ms to <200ms. Measure with: curl -w '%{time_total}'" |
| Hardcoded secrets | Security violation | `{{ENV_VAR}}` placeholder |
| `any` type in TypeScript | Type safety violation | Define proper interface/type |
| `console.log` in production | Information leak | Use structured logger with levels |
| `SELECT *` in production | Performance + security | Explicit column list |
| `// TODO` without task ID | Untracked debt | `// TODO [TASK_ID]: description` |

---

## 7. NAMING CONVENTIONS

### Variables and Functions
```typescript
// camelCase for variables and functions
const caseNumber = "NU-2026-001";
function calculateDispersion(comparables: Comparable[]): number { }

// PascalCase for types, interfaces, components
interface CaseData { }
type ValuationResult = { }
function DashboardPage() { }

// UPPER_SNAKE_CASE for constants and env vars
const MAX_COMPARABLES = 10;
const API_TIMEOUT_MS = 30000;
```

### Files
```
// kebab-case for files
src/app/portal-banco/page.tsx
src/core/agents/intake-agent.ts
src/lib/supabase-client.ts

// UPPER_SNAKE_CASE for documentation
docs/API_CONTRACTS.md
prompts/system/INTAKE.md
```

### Database
```sql
-- snake_case for tables and columns
CREATE TABLE public.audit_log (
  case_id UUID,
  created_at TIMESTAMPTZ
);

-- Descriptive policy names
CREATE POLICY "tenant_isolation" ON public.cases ...
```

---

## 8. CODE DOCUMENTATION

### Minimum Required Comments
```typescript
/**
 * Processes intake data from uploaded PDF.
 * 
 * @param caseId - UUID of the case
 * @param pdfBuffer - Raw PDF buffer from upload
 * @returns Extracted property data with confidence score
 * @throws {IntakeError} If PDF is unreadable or data extraction fails
 * 
 * Cost: ~$0.03 per call (claude-sonnet-4-20250514, ~2000 tokens)
 * Used by: /api/agents/intake
 * Task: [C09]
 */
async function processIntake(caseId: string, pdfBuffer: Buffer): Promise<IntakeResult> { }
```

---

## 9. ERROR HANDLING

### Standard Error Response
```json
{
  "error": {
    "code": "INTAKE_PDF_UNREADABLE",
    "message": "The uploaded PDF could not be parsed",
    "details": "Page 3 contains scanned image without OCR",
    "task_id": "C09",
    "timestamp": "2026-02-19T21:00:00Z",
    "trace_id": "uuid"
  }
}
```

### Error Code Taxonomy
```
AUTH_*       — Authentication/authorization errors
TENANT_*     — Multi-tenant isolation errors
CASE_*       — Case lifecycle errors
INTAKE_*     — Intake agent errors
RESEARCH_*   — Research agent errors
COMPARABLE_* — Comparable agent errors
REPORT_*     — Report writer errors
QA_*         — QA agent errors
COMPLIANCE_* — Compliance errors
STORAGE_*    — File upload/download errors
SYSTEM_*     — Infrastructure errors
```

---

## 10. CHECKLIST

- [ ] All prompts follow tone/language standards
- [ ] All agent outputs use structured JSON schema
- [ ] All documentation uses standard format
- [ ] No forbidden patterns in codebase
- [ ] All functions have JSDoc comments with cost estimates
- [ ] Error codes follow taxonomy
- [ ] Naming conventions enforced by linter

---

*END OF PROMPT_STYLEGUIDE.md v1.0.0*
=== FILE: GATES_CHECKLIST.md ===

# GATES CHECKLIST — Negocios Universales

**Version:** 1.0.0
**Date:** 2026-02-19
**Owner:** PMO (Elena)

---

## 1. PURPOSE

Define binary PASS/FAIL criteria for each quality gate. NO advancement without ALL CRITICO items passing and human sign-off.

## 2. SCOPE

Gates 0 through F covering Infrastructure → MVP → V1 → V2.

---

## GATE 0 — INFRASTRUCTURE (Day 3)

**Approver:** DEVOPS + PMO
**Prerequisite:** None

| # | Priority | Criteria | Evidence Required | Status |
|---|----------|---------|-------------------|--------|
| G0-01 | CRITICO | `git clone` + `npm install` + `npm run dev` loads localhost | Terminal screenshot | ✅ PASS |
| G0-02 | CRITICO | `npx tsc --noEmit` = 0 errors | Terminal output | ☐ PENDING |
| G0-03 | CRITICO | Supabase: 9 tables with `tenant_id NOT NULL` | SQL query result | ✅ PASS |
| G0-04 | CRITICO | Supabase: RLS active on 8+ tables | `pg_tables` query result | ✅ PASS |
| G0-05 | CRITICO | Supabase: MFA TOTP enabled | Dashboard screenshot | ✅ PASS |
| G0-06 | CRITICO | `audit_log` trigger generates hash chain | SQL insert + verify | ✅ PASS |
| G0-07 | CRITICO | GitHub Actions pipeline green | Actions tab screenshot | ☐ PENDING |
| G0-08 | CRITICO | Vercel deploy successful | Deployment URL | ✅ PASS |
| G0-09 | CRITICO | SSL active on production domain | Browser padlock | ✅ PASS |
| G0-10 | CRITICO | `docs/ROADMAP.md` exists | File in repo | ☐ PENDING |
| G0-11 | CRITICO | `docs/GATES.md` exists | File in repo | ☐ PENDING |
| G0-12 | CRITICO | `docs/API_CONTRACTS.md` exists | File in repo | ☐ PENDING |
| G0-13 | ALTO | `/api/health` returns JSON in production | curl output | ✅ PASS |
| G0-14 | ALTO | Branch protection on `main` | GitHub settings screenshot | ☐ PENDING |
| G0-15 | ALTO | 0 secrets in repo (gitleaks) | Scan output | ☐ PENDING |
| G0-16 | ALTO | DNS CNAME configured | `dig` output | ✅ PASS |
| G0-17 | ALTO | `prompts/system/` has 7 files | `ls` output | ☐ PENDING |
| G0-18 | ALTO | `.env.example` complete | File contents | ☐ PENDING |
| G0-19 | ALTO | All naming = "negociosuniversales" (no "valoratum") | Grep output | ✅ PASS |

**Gate 0 Result:** ☐ PASS / ☐ FAIL — Signed by: _____________ Date: _____________

---

## GATE A — SCOPE LOCK (Day 4)

**Approver:** PMO + Product
**Prerequisite:** Gate 0 PASS

| # | Priority | Criteria | Evidence Required | Status |
|---|----------|---------|-------------------|--------|
| GA-01 | CRITICO | User stories documented (min 15) | `docs/USER_STORIES.md` | ☐ |
| GA-02 | CRITICO | Acceptance criteria for each story | Criteria in stories | ☐ |
| GA-03 | CRITICO | API contracts signed (7+ endpoints) | `docs/API_CONTRACTS.md` | ☐ |
| GA-04 | CRITICO | Data model reviewed and approved | Schema diagram | ☐ |
| GA-05 | ALTO | Wireframes for core screens (5+) | Figma/image links | ☐ |
| GA-06 | ALTO | Sprint backlog prioritized | Task list with scores | ☐ |
| GA-07 | ALTO | Risk register initialized (top 10) | `docs/RISK_REGISTER.md` | ☐ |
| GA-08 | MEDIO | Demo script draft | `docs/DEMO_SCRIPT.md` | ☐ |

**Gate A Result:** ☐ PASS / ☐ FAIL — Signed by: _____________ Date: _____________

---

## GATE B — ARCHITECTURE VERIFIED (Day 5)

**Approver:** TECH + DEVOPS
**Prerequisite:** Gate A PASS

| # | Priority | Criteria | Evidence Required | Status |
|---|----------|---------|-------------------|--------|
| GB-01 | CRITICO | Cross-tenant test: 3 queries return 0 unauthorized rows | Test script output | ☐ |
| GB-02 | CRITICO | Evidence upload generates SHA-256 hash | Upload + hash verification | ☐ |
| GB-03 | CRITICO | Auth middleware blocks unauthenticated access | curl test | ☐ |
| GB-04 | CRITICO | Service role key NOT in client bundle | `grep` on `.next/` build | ☐ |
| GB-05 | CRITICO | All 7 agent prompts written and versioned | Files in `/prompts/system/` | ☐ |
| GB-06 | ALTO | OpenAPI spec validates | `swagger-cli validate` output | ☐ |
| GB-07 | ALTO | pgvector index created for RAG | SQL query confirmation | ☐ |
| GB-08 | ALTO | Rate limiting on API routes | Test with 100 rapid requests | ☐ |

**Gate B Result:** ☐ PASS / ☐ FAIL — Signed by: _____________ Date: _____________

---

## GATE C — MVP QA (Day 9)

**Approver:** QA + PMO
**Prerequisite:** Gate B PASS

| # | Priority | Criteria | Evidence Required | Status |
|---|----------|---------|-------------------|--------|
| GC-01 | CRITICO | E2E test: case from intake to PDF report | Test output + PDF | ☐ |
| GC-02 | CRITICO | VRS score > 0.85 (run same case 3x) | 3 outputs + score calc | ☐ |
| GC-03 | CRITICO | Audit Pack ZIP validates (hashes match) | ZIP contents + verification | ☐ |
| GC-04 | CRITICO | 5 roles RBAC enforced (each sees only their data) | Login as each role + screenshot | ☐ |
| GC-05 | CRITICO | MFA blocks login without TOTP | Login attempt screenshot | ☐ |
| GC-06 | CRITICO | AI cost per case < $1.00 USD | Cost log for 5 test cases | ☐ |
| GC-07 | ALTO | Dashboard loads < 2 seconds | Lighthouse or timing screenshot | ☐ |
| GC-08 | ALTO | PDF report matches template format | PDF visual review | ☐ |
| GC-09 | ALTO | Error handling: graceful failure on bad PDF | Error response screenshot | ☐ |
| GC-10 | ALTO | Demo with 2 tenants + 3 cases seeded | Data in Supabase | ☐ |
| GC-11 | MEDIO | QA checklist (25 points) all PASS | Checklist document | ☐ |

**Gate C Result:** ☐ PASS / ☐ FAIL — Signed by: _____________ Date: _____________

---

## GATE D — GO-LIVE (Day 12)

**Approver:** PMO + Founder
**Prerequisite:** Gate C PASS

| # | Priority | Criteria | Evidence Required | Status |
|---|----------|---------|-------------------|--------|
| GD-01 | CRITICO | UAT signed by at least 1 test user | Signed approval | ☐ |
| GD-02 | CRITICO | Vendor pack complete (7 sections) | Google Drive folder | ☐ |
| GD-03 | CRITICO | Production hardening checklist PASS | Security scan output | ☐ |
| GD-04 | CRITICO | Backup/restore tested | Restore test evidence | ☐ |
| GD-05 | CRITICO | Monitoring active (uptime + errors) | Dashboard screenshot | ☐ |
| GD-06 | ALTO | Demo script rehearsed | Video or sign-off | ☐ |
| GD-07 | ALTO | Onboarding flow documented | `docs/ONBOARDING.md` | ☐ |
| GD-08 | ALTO | SLA draft (uptime, response time) | `docs/SLA.md` | ☐ |
| GD-09 | MEDIO | Pricing page content ready | Content document | ☐ |

**Gate D Result:** ☐ PASS / ☐ FAIL — Signed by: _____________ Date: _____________

---

## GATE E — V1 RELEASE (Day 90)

**Approver:** PMO + TECH + Founder
**Prerequisite:** Gate D PASS + 60 days production

| # | Priority | Criteria | Evidence Required | Status |
|---|----------|---------|-------------------|--------|
| GE-01 | CRITICO | 99.5% uptime over 30 days | Monitoring report | ☐ |
| GE-02 | CRITICO | 50+ cases processed without data incident | Audit log summary | ☐ |
| GE-03 | CRITICO | Compliance audit passed | Auditor report | ☐ |
| GE-04 | CRITICO | Scale test: 10 concurrent users | Load test output | ☐ |
| GE-05 | ALTO | 3+ tenants active | Tenant list | ☐ |
| GE-06 | ALTO | Vehicle plugin functional | E2E test output | ☐ |

**Gate E Result:** ☐ PASS / ☐ FAIL — Signed by: _____________ Date: _____________

---

## GATE F — V2 ENTERPRISE (Day 180)

**Approver:** Board/Founder
**Prerequisite:** Gate E PASS

| # | Priority | Criteria | Evidence Required | Status |
|---|----------|---------|-------------------|--------|
| GF-01 | CRITICO | Multi-market support (DR + 1 country) | Configuration evidence | ☐ |
| GF-02 | CRITICO | White-label portal functional | Branded tenant screenshot | ☐ |
| GF-03 | CRITICO | Public API with documentation | API portal URL | ☐ |
| GF-04 | CRITICO | SOC 2 Type I readiness | Assessment report | ☐ |
| GF-05 | ALTO | 10+ tenants active | Revenue dashboard | ☐ |

**Gate F Result:** ☐ PASS / ☐ FAIL — Signed by: _____________ Date: _____________

---

*END OF GATES_CHECKLIST.md v1.0.0*
=== FILE: TASK_TEMPLATES.md ===

# TASK TEMPLATES — Negocios Universales

**Version:** 1.0.0
**Date:** 2026-02-19
**Owner:** PMO (Elena)

---

## 1. PURPOSE

Standardize task definition for all agents. Every task in the project MUST follow one of these templates.

## 2. UNIVERSAL TASK SCHEMA

```yaml
id: "C09"                          # Unique task ID (letter = agent type)
title: "Intake Agent Edge Function"
goal: "Extract structured data from uploaded PDF using Claude AI"
owner_agent: BE                     # Agent role from PROJECT_SYSTEM_PROMPT
phase: 1                           # 0=Infra, 1=MVP, 2=V1, 3=V2
priority: CRITICO                  # CRITICO|ALTO|MEDIO|BAJO
estimate: M                        # S=<2h, M=2-8h, L=8-24h
cost_estimate: "$15 (dev) + $2 (AI testing)"
cost_impact_score: 85              # 0-100 (see scoring below)
dependencies: [C01, C07, P-011]    # Task IDs that must complete first
inputs:
  - "PDF file uploaded to Supabase Storage"
  - "Case record created in `cases` table"
  - "System prompt: prompts/system/INTAKE.md"
steps:
  - "1. Create `/src/core/agents/intake-agent.ts`"
  - "2. Implement PDF text extraction"
  - "3. Call Claude API with INTAKE system prompt"
  - "4. Parse structured response"
  - "5. Update case record with extracted data"
  - "6. Log cost to audit_log"
  - "7. Write unit test"
deliverables:
  - "src/core/agents/intake-agent.ts"
  - "src/app/api/agents/intake/route.ts"
  - "tests/unit/intake-agent.test.ts"
dod_pass_fail:
  - "POST /api/agents/intake with test PDF returns 200 + structured data"
  - "Extracted data includes: property_type, address, area_sqm, bedrooms, bathrooms"
  - "Confidence score > 0.7 for test PDF"
  - "Cost logged to audit_log with tokens + cost_usd"
  - "npx tsc --noEmit = 0 errors"
evidence_required:
  - "curl output showing successful extraction"
  - "audit_log entry with cost data"
  - "test output: npm test -- intake"
handoff_to: AI                     # Next agent to pick up
rollback_plan: "Revert PR. Case remains in 'pending_intake' status."
```

---

## 3. COST-IMPACT SCORE CALCULATION

```
Score = Impact(0-40) + Complexity_Inverse(0-20) + Dependencies_Inverse(0-20) + Cost_Inverse(0-20)

Impact:       40 = critical path blocker, 0 = nice-to-have
Complexity:   20 = trivial (S), 10 = medium (M), 0 = very complex (L)
Dependencies: 20 = no deps, 10 = 1-2 deps, 0 = 3+ deps
Cost:         20 = free, 10 = <$50, 0 = >$200
```

**Prioritize tasks with highest score first.**

---

## 4. EXAMPLE TASKS

### 4.1 Frontend Task (Cursor)

```yaml
id: U05
title: "Dashboard — Cases List Page"
goal: "Display all cases for current tenant with status filters"
owner_agent: FE
phase: 1
priority: CRITICO
estimate: M
cost_estimate: "$0 (no AI cost)"
cost_impact_score: 78
dependencies: [U01, U02, C02]
inputs:
  - "API contract: GET /api/cases"
  - "Supabase client configured (src/lib/supabase-client.ts)"
  - "Auth context available via middleware"
steps:
  - "1. Create src/app/dashboard/page.tsx"
  - "2. Fetch cases from Supabase with RLS"
  - "3. Display table: case_number, status, type, created_at, assigned_appraiser"
  - "4. Add status filter (dropdown)"
  - "5. Add click-to-detail navigation"
  - "6. Style with Tailwind (responsive)"
deliverables:
  - "src/app/dashboard/page.tsx"
  - "src/components/cases/case-table.tsx"
  - "src/components/cases/status-badge.tsx"
dod_pass_fail:
  - "Page loads at /dashboard showing cases for current tenant"
  - "No cases from other tenants visible"
  - "Status filter works (pending, in_progress, completed)"
  - "Mobile responsive (test at 375px width)"
  - "npx tsc --noEmit = 0 errors"
evidence_required:
  - "Screenshot of dashboard with test data"
  - "Screenshot at mobile width"
handoff_to: QA
rollback_plan: "Revert PR. Dashboard shows default Next.js page."
```

### 4.2 Backend Task (Claude Code)

```yaml
id: C09
title: "Intake Agent — Edge Function"
goal: "AI extracts structured property data from uploaded PDF"
owner_agent: BE
phase: 1
priority: CRITICO
estimate: L
cost_estimate: "$15 (dev time) + $5 (AI API testing)"
cost_impact_score: 92
dependencies: [C01, C07, P-011]
inputs:
  - "Case with uploaded PDF in Supabase Storage"
  - "prompts/system/INTAKE.md loaded"
  - "Claude API key configured"
steps:
  - "1. Create src/core/agents/intake-agent.ts"
  - "2. Download PDF from Supabase Storage"
  - "3. Convert PDF to text (or send as base64 to Claude vision)"
  - "4. Call Claude API: system=INTAKE.md, user=PDF_content"
  - "5. Parse JSON response with zod validation"
  - "6. Update cases.property_data with extracted fields"
  - "7. Insert audit_log entry with cost tracking"
  - "8. Create API route: POST /api/agents/intake"
  - "9. Write test with sample PDF"
deliverables:
  - "src/core/agents/intake-agent.ts"
  - "src/app/api/agents/intake/route.ts"
  - "tests/unit/intake-agent.test.ts"
dod_pass_fail:
  - "POST /api/agents/intake?caseId=UUID returns 200"
  - "cases.property_data populated with: type, address, area, rooms"
  - "audit_log has entry with tokens_in, tokens_out, cost_usd"
  - "Confidence > 0.7 on test PDF"
  - "Error handling: bad PDF returns 422 with clear message"
evidence_required:
  - "curl -X POST output with response body"
  - "SELECT * FROM cases WHERE id=UUID showing property_data"
  - "SELECT * FROM audit_log WHERE case_id=UUID showing cost"
handoff_to: AI (Research agent)
rollback_plan: "Revert PR. Case stays in pending_intake."
```

### 4.3 DevOps/Security Task (Manus)

```yaml
id: M04
title: "GitHub Actions CI Pipeline"
goal: "Automated build, lint, type-check on every PR"
owner_agent: DEVOPS
phase: 0
priority: CRITICO
estimate: S
cost_estimate: "$0 (GitHub free tier)"
cost_impact_score: 88
dependencies: [M01, M02]
inputs:
  - "Repo with package.json and tsconfig.json"
  - "GitHub Secrets: SUPABASE_URL, SUPABASE_ANON_KEY"
steps:
  - "1. Create .github/workflows/ci.yml"
  - "2. Configure: checkout, setup-node, npm ci, tsc, build"
  - "3. Add gitleaks security scan"
  - "4. Configure branch protection rules"
  - "5. Test: create PR and verify pipeline runs"
deliverables:
  - ".github/workflows/ci.yml"
  - "Branch protection configured"
dod_pass_fail:
  - "PR triggers CI pipeline automatically"
  - "Pipeline runs: npm ci, tsc --noEmit, next build"
  - "Pipeline blocks merge on failure"
  - "Gitleaks finds 0 secrets"
evidence_required:
  - "GitHub Actions tab: green pipeline screenshot"
  - "Failed pipeline screenshot (proving it catches errors)"
handoff_to: PMO
rollback_plan: "Delete workflow file. PRs merge without checks (temporary)."
```

### 4.4 QA Task

```yaml
id: E08
title: "E2E Test: Full Case Pipeline"
goal: "Verify complete flow from PDF upload to delivered report"
owner_agent: QA
phase: 1
priority: CRITICO
estimate: L
cost_estimate: "$10 (AI API calls during test)"
cost_impact_score: 90
dependencies: [C09, C10, C11, C12, C13, C14, U05, U06]
inputs:
  - "All 6 agents implemented and deployed"
  - "Test tenant with test user credentials"
  - "Sample PDF: test_residencial_santo_domingo.pdf"
steps:
  - "1. Login as test_appraiser (with MFA)"
  - "2. Create new case"
  - "3. Upload test PDF"
  - "4. Trigger intake agent"
  - "5. Verify property_data extracted"
  - "6. Trigger full pipeline (research → comparable → report → QA → compliance)"
  - "7. Download PDF report"
  - "8. Download Audit Pack ZIP"
  - "9. Verify hash chain integrity"
  - "10. Run same case 3x → calculate VRS"
deliverables:
  - "tests/e2e/full-pipeline.test.ts"
  - "Test results document with screenshots"
  - "VRS calculation worksheet"
dod_pass_fail:
  - "Case completes all 6 agents without error"
  - "PDF report generated with all required sections"
  - "Audit Pack ZIP contains: report.pdf, evidence_hashes.json, ai_log.json, hash_chain.json"
  - "VRS > 0.85 across 3 runs"
  - "Total AI cost < $1.00 per case"
evidence_required:
  - "Test output log"
  - "Downloaded PDF report"
  - "Audit Pack ZIP contents listing"
  - "VRS calculation showing 3 run results"
handoff_to: PMO (Gate C review)
rollback_plan: "Document failures. Create fix tasks for each failing step."
```

### 4.5 AI/RAG Task

```yaml
id: C15
title: "RAG Pipeline — Comparable Search"
goal: "Vector search finds relevant comparables from knowledge base"
owner_agent: AI
phase: 1
priority: CRITICO
estimate: L
cost_estimate: "$20 (embedding generation) + $5 (search testing)"
cost_impact_score: 85
dependencies: [C01, C02, C12]
inputs:
  - "pgvector extension enabled"
  - "rag_chunks table with IVFFlat index"
  - "Seed data: 50+ comparable properties with embeddings"
  - "prompts/system/COMPARABLE.md"
steps:
  - "1. Create embedding generation script (scripts/generate-embeddings.ts)"
  - "2. Seed 50+ comparable properties into rag_chunks"
  - "3. Create search function: match_comparables(query_embedding, threshold, limit)"
  - "4. Implement comparable agent: takes property data → generates query → searches → ranks"
  - "5. Apply adjustments (location, size, age, condition)"
  - "6. Return top 5 comparables with similarity scores"
  - "7. Test with 3 different property types"
deliverables:
  - "scripts/generate-embeddings.ts"
  - "supabase/seeds/comparables.sql"
  - "src/core/agents/comparable-agent.ts"
  - "tests/unit/comparable-agent.test.ts"
dod_pass_fail:
  - "Search returns 3-5 relevant comparables for test property"
  - "Similarity score > 0.7 for top result"
  - "Adjustments applied correctly (±15% range)"
  - "Response time < 3 seconds"
  - "Cost per search < $0.05"
evidence_required:
  - "Search results with similarity scores"
  - "Adjustment calculation breakdown"
  - "Cost log entry"
handoff_to: BE (Report Writer agent)
rollback_plan: "Fallback to manual comparable entry by appraiser."
```

---

## 5. CHECKLIST

- [ ] Every task has a unique ID
- [ ] Every task has binary DoD (PASS/FAIL)
- [ ] Every task has evidence_required
- [ ] Every task has cost_estimate
- [ ] Every task has rollback_plan
- [ ] Cost-Impact Score calculated for prioritization

---

*END OF TASK_TEMPLATES.md v1.0.0*
=== FILE: HANDOFF_PROTOCOL.md ===

# HANDOFF PROTOCOL — Negocios Universales

**Version:** 1.0.0
**Date:** 2026-02-19
**Owner:** PMO (Elena)

---

## 1. PURPOSE

Define how deliverables pass between agents. Every handoff MUST include evidence, naming convention, and acceptance criteria.

## 2. SCOPE

All inter-agent transfers of code, documents, data, or decisions.

---

## 3. HANDOFF RECORD

Every handoff MUST be documented with:

```yaml
handoff_id: "HO-001"
from_agent: BE
to_agent: QA
task_id: C09
timestamp: "2026-02-19T21:00:00Z"
deliverables:
  - path: "src/core/agents/intake-agent.ts"
    type: code
    status: ready_for_review
  - path: "tests/unit/intake-agent.test.ts"
    type: test
    status: all_passing
evidence:
  - "PR #12 created and passing CI"
  - "Test output: 5/5 tests passing"
  - "Cost log: avg $0.03 per intake call"
blockers: []
notes: "Vision mode used for scanned PDFs. Text mode for digital PDFs."
acceptance_criteria:
  - "QA reviews test coverage"
  - "QA runs 3 additional sample PDFs"
  - "QA verifies cost logging accuracy"
```

---

## 4. HANDOFF FLOWS

### 4.1 Code Delivery (BE → QA)

```
1. BE creates feature branch: feat/C09-intake-agent
2. BE commits code + tests
3. BE opens PR targeting `develop`
4. CI runs automatically (build + lint + tsc)
5. BE marks PR as "Ready for Review"
6. QA reviews code + runs additional tests
7. QA approves or requests changes
8. On approval: merge to develop
9. Vercel creates preview deployment
10. QA verifies on preview URL
11. If PASS: PR from develop → main
```

### 4.2 Design → Frontend (PROD → FE)

```
1. PROD creates wireframe/mockup
2. PROD documents in: docs/wireframes/[screen-name].md
3. PROD includes: component list, data requirements, interactions
4. FE reads API_CONTRACTS.md for data shapes
5. FE implements and creates PR
6. PROD reviews visual fidelity
7. On approval: merge
```

### 4.3 Agent Pipeline (AI Agent → Next AI Agent)

```
1. Agent N completes processing
2. Agent N writes output to `cases` table (status field updated)
3. Agent N logs to `audit_log` (cost, tokens, confidence)
4. Orchestrator reads updated status
5. Orchestrator triggers Agent N+1
6. If confidence < 0.7: HALT → route to human_review
```

### 4.4 Documentation (Any Agent → PMO)

```
1. Agent creates/updates doc in /docs/
2. Agent commits with: docs: [description] [task_id][nu]
3. PMO reviews for completeness against template
4. PMO updates GATES_CHECKLIST.md evidence column
```

---

## 5. FILE NAMING CONVENTIONS

### Code Files
```
src/core/agents/{agent-name}-agent.ts
src/app/api/agents/{agent-name}/route.ts
src/components/{category}/{component-name}.tsx
src/lib/{utility-name}.ts
```

### Documentation Files
```
docs/{DOCUMENT_NAME}.md              (UPPER_SNAKE_CASE)
docs/wireframes/{screen-name}.md     (kebab-case)
docs/ADR/{NNN}-{decision-title}.md   (numbered)
```

### Test Files
```
tests/unit/{module-name}.test.ts
tests/integration/{flow-name}.test.ts
tests/e2e/{scenario-name}.test.ts
```

### Migration Files
```
supabase/migrations/{NNNNN}_{description}.sql
Example: 00001_base_schema.sql
Example: 00002_add_vehicle_tables.sql
```

---

## 6. EVIDENCE STANDARDS

| Evidence Type | Format | Storage |
|--------------|--------|---------|
| Screenshot | PNG, max 2MB | PR comment or `/docs/evidence/` |
| Terminal output | Text block in PR description | PR body |
| Test results | CI pipeline output | GitHub Actions log URL |
| API response | JSON (sanitized, no secrets) | PR comment |
| SQL query result | Table format in markdown | PR comment or doc |
| URL verification | Working link | PR comment |

---

## 7. REJECTION PROTOCOL

If a handoff is rejected:

```yaml
rejection:
  handoff_id: "HO-001"
  rejected_by: QA
  reason: "Test coverage insufficient — missing error case for corrupt PDF"
  required_changes:
    - "Add test: intake with corrupt PDF returns 422"
    - "Add test: intake with empty PDF returns 422"
  deadline: "2026-02-20T12:00:00Z"
  severity: MEDIUM  # LOW|MEDIUM|HIGH|BLOCKER
```

**Severity levels:**
- **LOW:** Minor improvement, doesn't block merge
- **MEDIUM:** Must fix before merge, non-blocking for other tasks
- **HIGH:** Blocks merge AND blocks dependent tasks
- **BLOCKER:** Stops all work until resolved

---

## 8. CHECKLIST

- [ ] Every handoff has a record (yaml format)
- [ ] Every handoff includes evidence
- [ ] File naming follows conventions
- [ ] Rejections documented with specific required changes
- [ ] No handoff without CI pipeline passing

---

*END OF HANDOFF_PROTOCOL.md v1.0.0*
=== FILE: API_CONTRACTS.md ===

# API CONTRACTS — Negocios Universales

**Version:** 1.0.0
**Date:** 2026-02-19
**Owner:** TECH (Tech Lead)

---

## 1. PURPOSE

Define every API endpoint's request/response contract. Frontend and backend MUST agree on these contracts before implementation begins.

## 2. BASE URL

| Environment | URL |
|-------------|-----|
| Production | `https://app.negociosuniversales.ai/api` |
| Preview | `https://negociosuniversales-*.vercel.app/api` |
| Local | `http://localhost:3000/api` |

## 3. AUTHENTICATION

All endpoints except `/api/health` require a valid Supabase session cookie (set by `@supabase/ssr` middleware).

**Headers:**
```
Cookie: sb-access-token=...; sb-refresh-token=...
Content-Type: application/json
```

## 4. STANDARD ERROR RESPONSE

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": "Technical details (dev only)",
    "trace_id": "uuid"
  }
}
```

| HTTP Status | Usage |
|-------------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (validation error) |
| 401 | Not authenticated |
| 403 | Not authorized (wrong role/tenant) |
| 404 | Resource not found |
| 422 | Unprocessable entity (business logic error) |
| 429 | Rate limited |
| 500 | Internal server error |

---

## 5. ENDPOINTS

### 5.1 Health Check

```
GET /api/health
Auth: None
```

**Response 200:**
```json
{
  "status": "ok",
  "version": "0.0.1",
  "project": "negociosuniversales",
  "timestamp": "2026-02-19T21:00:00.000Z",
  "domain": "negociosuniversales.ai"
}
```

---

### 5.2 Cases — List

```
GET /api/cases
Auth: Required
Query Params:
  - status (optional): pending_intake|in_progress|completed|cancelled
  - page (optional): number, default 1
  - limit (optional): number, default 20, max 100
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "case_number": "NU-2026-001",
      "status": "pending_intake",
      "case_type": "real_estate",
      "property_data": {},
      "assigned_appraiser": { "id": "uuid", "full_name": "Juan Perez" },
      "ai_confidence": null,
      "ai_cost_usd": null,
      "created_at": "2026-02-19T21:00:00Z",
      "updated_at": "2026-02-19T21:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### 5.3 Cases — Create

```
POST /api/cases
Auth: Required (roles: admin, supervisor, appraiser)
```

**Request Body:**
```json
{
  "case_type": "real_estate",
  "case_number": "NU-2026-001",
  "property_data": {
    "address": "Calle 1, Ens. Naco, Santo Domingo",
    "property_type": "apartamento",
    "area_sqm": 120
  },
  "assigned_appraiser": "uuid (optional)"
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "case_number": "NU-2026-001",
    "status": "pending_intake",
    "created_at": "2026-02-19T21:00:00Z"
  }
}
```

**Error 400:**
```json
{
  "error": {
    "code": "CASE_DUPLICATE_NUMBER",
    "message": "Case number NU-2026-001 already exists for this tenant"
  }
}
```

---

### 5.4 Cases — Get Detail

```
GET /api/cases/:id
Auth: Required
```

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "case_number": "NU-2026-001",
    "status": "completed",
    "case_type": "real_estate",
    "property_data": {
      "address": "Calle 1, Ens. Naco, Santo Domingo",
      "property_type": "apartamento",
      "area_sqm": 120,
      "bedrooms": 3,
      "bathrooms": 2,
      "year_built": 2018,
      "parking_spaces": 1
    },
    "assigned_appraiser": { "id": "uuid", "full_name": "Juan Perez" },
    "ai_confidence": 0.89,
    "ai_cost_usd": 0.47,
    "evidence": [
      { "id": "uuid", "file_path": "evidence/case-uuid/foto1.jpg", "file_hash": "sha256...", "file_type": "image/jpeg" }
    ],
    "comparables": [
      { "id": "uuid", "address": "Calle 2, Naco", "price": 185000, "price_per_sqm": 1542, "similarity_score": 0.92 }
    ],
    "audit_trail": [
      { "action": "case_created", "timestamp": "2026-02-19T21:00:00Z", "current_hash": "abc123..." },
      { "action": "intake_completed", "timestamp": "2026-02-19T21:01:00Z", "current_hash": "def456..." }
    ],
    "created_at": "2026-02-19T21:00:00Z",
    "updated_at": "2026-02-19T21:05:00Z"
  }
}
```

---

### 5.5 Evidence — Upload

```
POST /api/cases/:id/evidence
Auth: Required (roles: admin, supervisor, appraiser)
Content-Type: multipart/form-data
```

**Request:**
```
file: (binary — max 50MB, types: image/jpeg, image/png, application/pdf)
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "file_path": "evidence/case-uuid/foto1.jpg",
    "file_hash": "sha256:a1b2c3d4e5f6...",
    "file_type": "image/jpeg",
    "created_at": "2026-02-19T21:00:00Z"
  }
}
```

---

### 5.6 Agents — Trigger Pipeline

```
POST /api/agents/run
Auth: Required (roles: admin, supervisor)
```

**Request Body:**
```json
{
  "case_id": "uuid",
  "agents": ["intake", "research", "comparable", "report_writer", "qa", "compliance"],
  "mode": "full_pipeline"
}
```

**Response 200:**
```json
{
  "data": {
    "run_id": "uuid",
    "case_id": "uuid",
    "status": "processing",
    "agents_queued": ["intake", "research", "comparable", "report_writer", "qa", "compliance"],
    "started_at": "2026-02-19T21:00:00Z"
  }
}
```

---

### 5.7 Agents — Individual Agent

```
POST /api/agents/:agent_name
Auth: Required
agent_name: intake|research|comparable|report-writer|qa|compliance
```

**Request Body:**
```json
{
  "case_id": "uuid"
}
```

**Response 200:**
```json
{
  "agent": "intake",
  "case_id": "uuid",
  "status": "success",
  "confidence": 0.89,
  "data": { },
  "tokens": { "input": 1250, "output": 380 },
  "cost_usd": 0.03,
  "duration_ms": 2340,
  "next_agent": "research"
}
```

---

### 5.8 Reports — Download PDF

```
GET /api/cases/:id/report
Auth: Required
```

**Response 200:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="NU-2026-001-report.pdf"
(binary PDF)
```

---

### 5.9 Reports — Download Audit Pack

```
GET /api/cases/:id/audit-pack
Auth: Required (roles: admin, supervisor, bank_viewer)
```

**Response 200:**
```
Content-Type: application/zip
Content-Disposition: attachment; filename="NU-2026-001-audit-pack.zip"
(ZIP containing: report.pdf, evidence_hashes.json, ai_log.json, hash_chain.json)
```

---

## 6. RATE LIMITS

| Endpoint | Limit |
|----------|-------|
| `/api/health` | 100/min |
| `/api/cases` (GET) | 60/min |
| `/api/cases` (POST) | 10/min |
| `/api/agents/*` | 5/min |
| `/api/cases/:id/evidence` | 20/min |

---

## 7. CHECKLIST

- [ ] All endpoints documented with request/response
- [ ] Error responses defined for each endpoint
- [ ] Auth requirements specified
- [ ] Rate limits defined
- [ ] No secrets in examples (use placeholders)

---

*END OF API_CONTRACTS.md v1.0.0*
=== FILE: DATA_CONTRACTS.md ===

# DATA CONTRACTS — Negocios Universales

**Version:** 1.0.0
**Date:** 2026-02-19
**Owner:** DATA (Data Engineer)

---

## 1. PURPOSE

Define data entities, relationships, multi-tenant rules, RLS policies, audit requirements, and data retention.

## 2. ENTITY RELATIONSHIP

```
tenants (1) ──── (*) profiles
tenants (1) ──── (*) cases
tenants (1) ──── (*) evidence
tenants (1) ──── (*) comparables
tenants (1) ──── (*) audit_log
tenants (1) ──── (*) appraiser_metrics

profiles (*) ──── (1) roles
profiles (1) ──── (*) cases (as assigned_appraiser)
profiles (1) ──── (*) cases (as created_by)

cases (1) ──── (*) evidence
cases (1) ──── (*) comparables
cases (1) ──── (*) audit_log
```

## 3. TABLE CONTRACTS

### 3.1 tenants
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | PK |
| name | TEXT | NO | — | Organization name |
| rnc | TEXT | YES | — | UNIQUE — Dominican tax ID |
| plan | TEXT | NO | 'starter' | starter, professional, enterprise |
| config | JSONB | YES | '{}' | Tenant-specific settings |
| created_at | TIMESTAMPTZ | YES | now() | — |
| updated_at | TIMESTAMPTZ | YES | now() | — |

### 3.2 roles
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | PK |
| name | TEXT | NO | — | UNIQUE: admin, supervisor, appraiser, bank_viewer, client |
| permissions | JSONB | YES | '[]' | Array of permission strings |
| description | TEXT | YES | — | Human-readable description |

### 3.3 profiles
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | — | PK, FK → auth.users(id) ON DELETE CASCADE |
| tenant_id | UUID | NO | — | FK → tenants(id) |
| role_id | UUID | NO | — | FK → roles(id) |
| full_name | TEXT | YES | — | — |
| phone | TEXT | YES | — | Format: +1809XXXXXXX |
| mfa_enabled | BOOLEAN | YES | false | — |
| created_at | TIMESTAMPTZ | YES | now() | — |

### 3.4 cases
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | PK |
| tenant_id | UUID | NO | — | FK → tenants(id) |
| case_number | TEXT | NO | — | UNIQUE per tenant |
| status | TEXT | NO | 'pending_intake' | See status machine below |
| case_type | TEXT | NO | 'real_estate' | real_estate, vehicle |
| property_data | JSONB | YES | '{}' | Flexible schema per type |
| assigned_appraiser | UUID | YES | — | FK → profiles(id) |
| ai_confidence | FLOAT | YES | — | 0.0-1.0 |
| ai_cost_usd | FLOAT | YES | — | Cumulative AI cost |
| created_by | UUID | YES | — | FK → profiles(id) |
| created_at | TIMESTAMPTZ | YES | now() | — |
| updated_at | TIMESTAMPTZ | YES | now() | — |

**Status Machine:**
```
pending_intake → intake_processing → intake_completed
  → research_processing → research_completed
  → comparable_processing → comparable_completed
  → report_processing → report_completed
  → qa_processing → qa_passed | qa_failed
  → compliance_processing → compliance_passed | compliance_failed
  → human_review → approved → delivered
  → cancelled (from any state)
```

### 3.5 evidence
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | PK |
| tenant_id | UUID | NO | — | FK → tenants(id) |
| case_id | UUID | NO | — | FK → cases(id) ON DELETE CASCADE |
| file_path | TEXT | NO | — | Supabase Storage path |
| file_hash | TEXT | NO | — | SHA-256 of file content |
| file_type | TEXT | YES | — | MIME type |
| metadata | JSONB | YES | '{}' | Dimensions, GPS, etc. |
| uploaded_by | UUID | YES | — | FK → profiles(id) |
| created_at | TIMESTAMPTZ | YES | now() | — |

### 3.6 audit_log
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | PK |
| tenant_id | UUID | NO | — | FK → tenants(id) |
| case_id | UUID | YES | — | FK → cases(id) |
| action | TEXT | NO | — | Event name |
| actor | UUID | YES | — | User who triggered |
| prev_hash | TEXT | YES | — | Previous entry's hash (or 'GENESIS') |
| current_hash | TEXT | YES | — | SHA-256(prev_hash + action + timestamp + payload) |
| payload | JSONB | YES | '{}' | Event-specific data |
| ip_address | INET | YES | — | Client IP |
| created_at | TIMESTAMPTZ | YES | now() | — |

**IMMUTABLE: No UPDATE or DELETE on audit_log. Append-only.**

### 3.7 rag_chunks
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | PK |
| source_id | TEXT | NO | — | Reference to source document |
| source_type | TEXT | NO | — | 'comparable', 'regulation', 'template' |
| content | TEXT | NO | — | Text chunk for embedding |
| embedding | vector(1536) | YES | — | OpenAI/Claude embedding |
| metadata | JSONB | YES | '{}' | Source metadata |
| created_at | TIMESTAMPTZ | YES | now() | — |

**Index:** IVFFlat on embedding with cosine distance, lists=100

## 4. MULTI-TENANT RULES

1. Every table (except roles and rag_chunks-SELECT) has RLS policy filtering by `tenant_id`
2. Helper function: `get_user_tenant_id()` returns current user's tenant
3. No SQL query may use `SELECT *` without WHERE tenant_id filter
4. Cross-tenant JOIN is **NEVER** permitted
5. Supabase service_role key bypasses RLS — use ONLY in server-side Edge Functions

## 5. DATA RETENTION

| Data Type | Retention | Deletion Method |
|-----------|-----------|----------------|
| Cases (active) | Indefinite | Archive after 5 years |
| Cases (cancelled) | 1 year | Soft delete (status=archived) |
| Evidence files | Same as parent case | Delete from Storage when case archived |
| Audit logs | 10 years minimum | NEVER delete (regulatory requirement) |
| RAG chunks | Indefinite | Replace on re-indexing |
| User profiles | Account lifetime + 90 days | Anonymize PII on deletion |

## 6. BACKUP

- Supabase Pro: Daily automatic backups, 7-day retention
- Point-in-time recovery: enabled
- Manual backup before any migration: `pg_dump` via CLI

## 7. CHECKLIST

- [ ] All tables have tenant_id NOT NULL (except roles, rag_chunks)
- [ ] RLS enabled on all 8 tables
- [ ] Hash chain trigger active on audit_log
- [ ] No UPDATE/DELETE policy on audit_log
- [ ] Evidence files hash-verified on upload
- [ ] Backup tested (restore to staging)

---

*END OF DATA_CONTRACTS.md v1.0.0*
=== FILE: SECURITY_PLAYBOOK.md ===

# SECURITY PLAYBOOK — Negocios Universales

**Version:** 1.0.0
**Date:** 2026-02-19
**Owner:** DEVOPS

---

## 1. PURPOSE

Define security controls, key management, incident response, and compliance requirements. NO SECRETS in this document — only policies and procedures.

## 2. SECRET MANAGEMENT

### 2.1 Secret Locations

| Secret | Local | CI (GitHub) | Production (Vercel) |
|--------|-------|-------------|-------------------|
| SUPABASE_URL | .env.local | Actions Secret | Env Var |
| SUPABASE_ANON_KEY | .env.local | Actions Secret | Env Var |
| SUPABASE_SERVICE_ROLE_KEY | .env.local | — | Env Var |
| ANTHROPIC_API_KEY | .env.local | — | Env Var |
| DB_PASSWORD | .env.local | — | — (in DB_URL) |

### 2.2 Rotation Policy

| Secret | Rotation Frequency | Procedure |
|--------|-------------------|-----------|
| DB Password | 90 days | Supabase Dashboard → Settings → Database |
| Supabase keys | On compromise only | Regenerate in Dashboard → API |
| Anthropic API key | 90 days | console.anthropic.com |
| GitHub tokens | 90 days | GitHub Settings → Tokens |

### 2.3 Anti-Leak Controls

- `.gitignore` includes: `.env*`, `*.pem`, `*.key`, `service-account*.json`
- Gitleaks runs on every PR (GitHub Actions)
- Pre-commit hook (optional): `npx gitleaks detect`
- NEVER log secrets, even partially
- NEVER include secrets in error messages

## 3. AUTHENTICATION

| Control | Implementation |
|---------|---------------|
| Auth provider | Supabase Auth (email + password) |
| MFA | TOTP required (Google Authenticator / Authy) |
| Session | JWT with httpOnly cookies via @supabase/ssr |
| Session timeout | 1 hour idle, 24 hours absolute |
| Password policy | Min 12 chars, 1 uppercase, 1 number, 1 special |
| Failed login | Lock after 5 attempts for 15 minutes |
| Email confirmation | Required before first login |

## 4. AUTHORIZATION (RBAC)

| Role | Cases | Reports | Audit | Admin | Users |
|------|-------|---------|-------|-------|-------|
| admin | CRUD | CRUD | Read+Download | Full | CRUD |
| supervisor | CRUD | Read+Approve | Read+Download | — | Read |
| appraiser | Read+Write own | Read own | — | — | — |
| bank_viewer | Read | Read+Download | Download | — | — |
| client | Read own | Read own | — | — | — |

## 5. DATA PROTECTION

| Control | Implementation |
|---------|---------------|
| Encryption at rest | Supabase (AWS S3 SSE) |
| Encryption in transit | TLS 1.3 (Vercel auto-SSL) |
| Data isolation | RLS per tenant_id |
| PII handling | Minimize collection, anonymize on deletion |
| File integrity | SHA-256 hash on upload, verify on download |
| Audit trail | Immutable hash-chain, append-only |

## 6. INFRASTRUCTURE SECURITY

| Control | Implementation |
|---------|---------------|
| CDN/Edge | Vercel Edge Network |
| DDoS protection | Vercel (included in Pro) |
| CORS | Restrict to app.negociosuniversales.ai |
| CSP | X-Frame-Options: DENY, X-Content-Type-Options: nosniff |
| API rate limiting | Per-endpoint limits (see API_CONTRACTS.md) |
| Dependency scanning | `npm audit` on every CI run |
| Container security | Vercel serverless (no container management needed) |

## 7. INCIDENT RESPONSE

### 7.1 Severity Levels

| Level | Description | Response Time | Example |
|-------|------------|---------------|---------|
| SEV-1 | Data breach / cross-tenant exposure | 15 minutes | User sees another tenant's data |
| SEV-2 | Service down / auth bypass | 1 hour | Production 500 errors |
| SEV-3 | Security vulnerability found | 24 hours | npm audit critical |
| SEV-4 | Minor security improvement | Sprint planning | Add rate limiting |

### 7.2 Response Procedure

```
1. DETECT: Alert from monitoring / user report / audit
2. CONTAIN: Disable affected feature / rotate compromised key
3. ASSESS: Determine scope and impact
4. REMEDIATE: Fix root cause, deploy patch
5. VERIFY: Confirm fix, run security tests
6. DOCUMENT: Incident report in docs/incidents/INC-NNN.md
7. REVIEW: Post-mortem within 48 hours
```

### 7.3 Key Compromise Procedure

```
1. IMMEDIATELY rotate the compromised key
2. Search audit_log for unauthorized access during window
3. Revoke all active sessions (Supabase Dashboard → Auth → Sessions)
4. Notify affected tenants if data was accessed
5. File incident report
```

## 8. COMPLIANCE

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Multi-tenant isolation | ✅ Active | RLS policies + test script |
| Audit trail | ✅ Active | Hash-chain trigger |
| MFA | ✅ Active | TOTP configuration |
| Data encryption at rest | ✅ Active | Supabase Pro (AWS SSE) |
| Data encryption in transit | ✅ Active | TLS 1.3 via Vercel |
| Access logging | ✅ Active | audit_log table |
| Key rotation policy | ☐ Documented | This playbook |
| Incident response plan | ☐ Documented | This playbook |
| Penetration testing | ☐ Planned | Gate E requirement |
| SOC 2 readiness | ☐ Planned | Gate F requirement |

## 9. CHECKLIST

- [ ] All secrets in .env.local / Vercel env vars only
- [ ] .gitignore blocks secret files
- [ ] Gitleaks in CI pipeline
- [ ] RLS active on all tables
- [ ] MFA enforced
- [ ] No service_role key in client bundle
- [ ] Incident response procedure documented
- [ ] Key rotation schedule established

---

*END OF SECURITY_PLAYBOOK.md v1.0.0*
=== FILE: RUNBOOKS.md ===

# RUNBOOKS — Negocios Universales

**Version:** 1.0.0
**Date:** 2026-02-19
**Owner:** DEVOPS

---

## 1. PURPOSE

Step-by-step operational procedures for deployment, monitoring, incident handling, and disaster recovery.

---

## 2. DEPLOYMENT

### 2.1 Production Deploy (Automatic)

```
Trigger: Push to `main` branch
Flow:
  1. Developer merges PR to main
  2. Vercel detects push automatically
  3. Vercel runs: npm ci → next build
  4. If build succeeds: deploy to production edge
  5. If build fails: previous version stays live
  6. Verify: curl https://app.negociosuniversales.ai/api/health

Rollback:
  1. Vercel Dashboard → Deployments
  2. Find last working deployment
  3. Click "..." → Promote to Production
  4. Verify health endpoint
```

### 2.2 Database Migration

```
Prerequisites:
  - Backup current database
  - Test migration on staging first

Steps:
  1. Create migration file: supabase/migrations/NNNNN_description.sql
  2. Test locally: npx supabase db push (against local)
  3. Review SQL carefully (especially DROP/ALTER)
  4. Apply to production: npx supabase db push --linked
  5. Verify: run verification queries
  6. Update DATA_CONTRACTS.md if schema changed

Rollback:
  1. Create reverse migration: supabase/migrations/NNNNN_rollback_description.sql
  2. Apply rollback migration
  3. Verify data integrity
```

### 2.3 Environment Variable Update

```
Steps:
  1. Update in Vercel Dashboard → Settings → Environment Variables
  2. Trigger redeploy: Vercel Dashboard → Deployments → Redeploy
  3. Verify: curl health endpoint
  4. Update .env.example if new variable added
  5. Update GitHub Secrets if CI needs the variable

NEVER:
  - Change SUPABASE_URL (breaks all connections)
  - Remove variables without verifying no code references them
```

---

## 3. MONITORING

### 3.1 Health Checks

| Check | URL | Frequency | Alert Threshold |
|-------|-----|-----------|----------------|
| App health | `https://app.negociosuniversales.ai/api/health` | 1 min | 2 consecutive failures |
| Vercel status | Vercel Dashboard → Observability | Real-time | Error rate > 1% |
| Supabase status | Supabase Dashboard → Reports | Daily | Connection errors > 0 |

### 3.2 Key Metrics

| Metric | Target | Alert |
|--------|--------|-------|
| Response time (p95) | < 500ms | > 2000ms |
| Error rate | < 0.1% | > 1% |
| AI cost per case | < $1.00 | > $2.00 |
| Active cases | Monitor trend | — |
| Storage usage | < 80% of plan | > 90% |

### 3.3 Log Analysis

```
Vercel Logs:
  Dashboard → Logs → Filter by:
  - Status: 500 (server errors)
  - Status: 401/403 (auth issues)
  - Path: /api/agents/* (AI pipeline)

Supabase Logs:
  Dashboard → Logs → API
  Filter: status >= 400
```

---

## 4. DISASTER RECOVERY

### 4.1 Recovery Objectives

| Metric | Target |
|--------|--------|
| RTO (Recovery Time Objective) | 1 hour |
| RPO (Recovery Point Objective) | 24 hours (daily backup) |

### 4.2 Scenarios

**Scenario 1: Vercel outage**
```
Impact: App unavailable
Detection: Health check fails
Response:
  1. Check Vercel status page: vercel.com/status
  2. If Vercel-wide: wait for resolution
  3. If project-specific: check build logs, redeploy
  4. Notify users if downtime > 30 minutes
```

**Scenario 2: Supabase outage**
```
Impact: Data unavailable, auth broken
Detection: API errors, connection timeouts
Response:
  1. Check Supabase status: status.supabase.com
  2. If Supabase-wide: wait for resolution
  3. If project-specific: check project health in Dashboard
  4. Enable maintenance mode page if > 15 minutes
```

**Scenario 3: Data corruption**
```
Impact: Incorrect data served
Detection: User report or audit check
Response:
  1. Identify affected records via audit_log
  2. Restore from Supabase point-in-time backup
  3. Verify hash chain integrity
  4. Notify affected tenants
  5. File incident report
```

**Scenario 4: Security breach**
```
Impact: Data exposure
Response: See SECURITY_PLAYBOOK.md → Incident Response
```

---

## 5. ON-CALL

### 5.1 Rotation

| Week | Primary | Secondary |
|------|---------|-----------|
| Current | DEVOPS | TECH |
| +1 | TECH | BE |
| +2 | BE | DEVOPS |

### 5.2 Escalation Path

```
Alert triggered
  → Primary on-call responds (15 min)
    → If SEV-1/2: Secondary joins
      → If not resolved in 1 hour: Founder notified
```

---

## 6. CHECKLIST

- [ ] Health check monitoring active
- [ ] Deployment rollback tested
- [ ] Backup restore tested
- [ ] Incident response procedure known by team
- [ ] On-call rotation established
- [ ] Status page configured (status.negociosuniversales.ai)

---

*END OF RUNBOOKS.md v1.0.0*
=== FILE: COST_EFFICIENCY.md ===

# COST & EFFICIENCY — Negocios Universales

**Version:** 1.0.0
**Date:** 2026-02-19
**Owner:** FIN (Finance)

---

## 1. PURPOSE

Track, control, and optimize costs across infrastructure, AI usage, development tools, and licensing.

---

## 2. MONTHLY COST STRUCTURE

### 2.1 Infrastructure

| Service | Plan | Monthly Cost | Annual |
|---------|------|-------------|--------|
| Supabase Pro | Pro | $25.00 | $300.00 |
| Vercel Pro | Pro | $20.00 | $240.00 |
| Domain (negociosuniversales.ai) | Annual | ~$2.50/mo | $30.00 |
| **Subtotal Infrastructure** | | **$47.50** | **$570.00** |

### 2.2 AI Tools (Development Phase — 15 days)

| Tool | Cost | Usage |
|------|------|-------|
| Claude API (Anthropic) | $200.00 | Prompt testing, agent development |
| Claude Pro (chat) | $20.00 | PMO planning, documentation |
| Cursor Pro | $20.00 | Frontend development |
| Claude Code | $100.00 | Backend development |
| Manus | $200.00 | DevOps, research, automation |
| **Subtotal AI Tools** | **$540.00** | **15-day sprint** |

### 2.3 AI API (Production — per month)

| Model | Est. Cases/Month | Cost/Case | Monthly |
|-------|-----------------|-----------|---------|
| claude-sonnet-4-20250514 | 100 | $0.50 | $50.00 |
| Embedding generation | 100 | $0.02 | $2.00 |
| **Subtotal AI Production** | | | **$52.00** |

### 2.4 Total Projections

| Phase | Duration | Monthly | Total |
|-------|----------|---------|-------|
| MVP Sprint | 15 days | — | $587.50 |
| Month 1 (post-launch) | 30 days | $99.50 | $99.50 |
| Months 2-12 | 11 months | $99.50 | $1,094.50 |
| **Year 1 Total** | | | **$1,781.50** |

---

## 3. AI COST CONTROL

### 3.1 Per-Case Budget

| Agent | Max Tokens | Est. Cost | Budget Cap |
|-------|-----------|-----------|-----------|
| Intake | 3,000 in / 1,000 out | $0.02 | $0.05 |
| Research | 5,000 in / 2,000 out | $0.04 | $0.10 |
| Comparable | 4,000 in / 1,500 out | $0.03 | $0.08 |
| Report Writer | 6,000 in / 4,000 out | $0.08 | $0.20 |
| QA Agent | 4,000 in / 1,000 out | $0.03 | $0.08 |
| Compliance | 3,000 in / 1,000 out | $0.02 | $0.05 |
| **Total per case** | | **$0.22** | **$0.56** |

### 3.2 Cost Tracking (Mandatory)

Every AI call MUST log:
```json
{
  "agent": "intake",
  "case_id": "uuid",
  "model": "claude-sonnet-4-20250514",
  "tokens_input": 2500,
  "tokens_output": 800,
  "cost_usd": 0.02,
  "timestamp": "ISO-8601"
}
```

Stored in: `audit_log` with `action = 'ai_call'`

### 3.3 Budget Alerts

| Threshold | Action |
|-----------|--------|
| 80% of monthly AI budget ($40) | Email alert to admin |
| 100% of monthly AI budget ($50) | Dashboard warning |
| 150% of monthly AI budget ($75) | Block non-critical AI calls |

### 3.4 Cost Optimization Strategies

| Strategy | Savings | Implementation |
|----------|---------|---------------|
| Use Sonnet over Opus | 80% per call | Default model in config |
| Cache repeated queries | 30-50% | Redis/in-memory for duplicate intakes |
| Batch embedding generation | 20% | Process in batches of 50 |
| Truncate irrelevant PDF pages | 40% tokens | Pre-filter before sending to AI |
| Prompt optimization | 10-30% | Monthly prompt audit for token efficiency |

---

## 4. DEVELOPMENT EFFICIENCY

### 4.1 Estimation Guide

| Size | Hours | Typical Tasks |
|------|-------|--------------|
| S (Small) | 0.5-2h | Config change, copy update, simple UI fix |
| M (Medium) | 2-8h | New component, API endpoint, agent prompt |
| L (Large) | 8-24h | Full feature, complex agent, E2E test suite |
| XL (Extra Large) | 24-80h | Major architecture change, new module |

### 4.2 Agent Efficiency Tracking

| Agent Tool | Task Throughput | Cost/Task |
|-----------|----------------|-----------|
| Claude Code | ~3 M-tasks/day | $6.67/task |
| Cursor | ~4 M-tasks/day | $5.00/task |
| Manus | ~2 L-tasks/day | $10.00/task |
| Manual dev (human) | ~1 M-task/day | $100-200/task |

---

## 5. CHECKLIST

- [ ] AI cost logged per call
- [ ] Monthly budget ceiling set ($500 AI)
- [ ] Budget alerts configured
- [ ] Cost-per-case tracking in audit_log
- [ ] Monthly cost review scheduled

---

*END OF COST_EFFICIENCY.md v1.0.0*
=== FILE: REPLICATION_GUIDE.md ===

# REPLICATION GUIDE — Negocios Universales

**Version:** 1.0.0
**Date:** 2026-02-19
**Owner:** PMO (Elena)

---

## 1. PURPOSE

Enable cloning this entire system for a new project in 30-60 minutes. Replace variables, run setup, and you have a new bank-grade SaaS platform.

## 2. VARIABLES TO REPLACE

| Variable | Current Value | Replace With |
|----------|--------------|-------------|
| `{{PROJECT_NAME}}` | Negocios Universales | New project name |
| `{{PROJECT_SLUG}}` | negociosuniversales | URL-safe slug |
| `{{DOMAIN}}` | negociosuniversales.ai | New domain |
| `{{APP_DOMAIN}}` | app.negociosuniversales.ai | app.newdomain.com |
| `{{COMMIT_TAG}}` | [nu] | New project tag |
| `{{SUPABASE_URL}}` | (per project) | New Supabase URL |
| `{{SUPABASE_ANON_KEY}}` | (per project) | New anon key |
| `{{SUPABASE_SERVICE_ROLE_KEY}}` | (per project) | New service role key |
| `{{ANTHROPIC_API_KEY}}` | (per account) | New API key |
| `{{GITHUB_ORG}}` | csorianoai | New org/user |
| `{{VERCEL_TEAM}}` | nadakki-ai-suite | New Vercel team |
| `{{COUNTRY}}` | Dominican Republic | Target market |
| `{{CURRENCY}}` | DOP/USD | Local currency |
| `{{TAX_ID_TYPE}}` | RNC | Local tax ID type |

## 3. REPLICATION STEPS

### Step 1: Clone Repository (5 min)
```bash
git clone https://github.com/{{GITHUB_ORG}}/negociosuniversales.git {{PROJECT_SLUG}}
cd {{PROJECT_SLUG}}
rm -rf .git
git init
git branch -M main
```

### Step 2: Find & Replace Project Name (5 min)
```bash
# Replace in all files
find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.md" -o -name "*.yml" -o -name "*.json" | \
  xargs sed -i 's/negociosuniversales/{{PROJECT_SLUG}}/g'

find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.md" | \
  xargs sed -i 's/Negocios Universales/{{PROJECT_NAME}}/g'

find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.md" -o -name "*.yml" | \
  xargs sed -i 's/negociosuniversales\.ai/{{DOMAIN}}/g'

# Update package.json name
npm pkg set name="{{PROJECT_SLUG}}"
```

### Step 3: Create Supabase Project (10 min)
```
1. supabase.com → New Project
2. Name: {{PROJECT_SLUG}}
3. Region: closest to target market
4. Plan: Pro ($25/mo)
5. Copy 4 keys to .env.local
6. Enable extensions: vector, pg_cron, pgjwt
7. Run schema SQL (from supabase/migrations/)
8. Configure Auth: MFA + URL Config
9. Create Storage buckets: evidence, reports
```

### Step 4: Configure Vercel (5 min)
```
1. vercel.com → Import from GitHub
2. Add 6 environment variables
3. Deploy
4. Add custom domain
5. Configure DNS at registrar
```

### Step 5: GitHub Setup (5 min)
```
1. Create repo: {{GITHUB_ORG}}/{{PROJECT_SLUG}}
2. Push code
3. Add secrets: SUPABASE_URL, SUPABASE_ANON_KEY
4. Enable branch protection on main
```

### Step 6: Customize Business Logic (10-20 min)
```
1. Update prompts/system/*.md for new domain
2. Update docs/ for new project context
3. Modify property_data JSONB schema for market
4. Adjust comparable sources for region
5. Update compliance rules for jurisdiction
```

### Step 7: Verify (5 min)
```
1. npm run dev → localhost loads
2. npx tsc --noEmit → 0 errors
3. git push → Vercel deploys
4. curl https://app.{{DOMAIN}}/api/health → 200 OK
5. Run Gate 0 checklist
```

---

## 4. WHAT TRANSFERS (Reusable)

| Component | Reusable? | Notes |
|-----------|-----------|-------|
| Database schema | ✅ 100% | Multi-tenant by design |
| RLS policies | ✅ 100% | Generic tenant isolation |
| Auth setup | ✅ 100% | MFA + RBAC |
| AI agent pipeline | ✅ 90% | Prompts need domain customization |
| CI/CD workflow | ✅ 100% | Generic build/test/deploy |
| Gate system | ✅ 100% | Universal quality checks |
| API contracts | ✅ 95% | Endpoints are generic |
| Security playbook | ✅ 100% | Universal policies |
| Cost tracking | ✅ 100% | Same logging structure |
| UI components | ✅ 80% | Needs branding changes |

## 5. WHAT NEEDS CUSTOMIZATION

| Component | Effort | Why |
|-----------|--------|-----|
| System prompts (7 agents) | M (4-8h) | Domain-specific knowledge |
| Comparable data sources | L (8-16h) | Market-specific APIs/databases |
| Report template | M (4-8h) | Regulatory format per country |
| Compliance rules | M (4-8h) | Jurisdiction-specific |
| Branding/UI | S (2-4h) | Logo, colors, copy |
| Demo data/seeds | S (2-4h) | Realistic local examples |

---

## 6. COMPLETENESS CHECKLIST

| # | Item | Status |
|---|------|--------|
| 1 | PROJECT_SYSTEM_PROMPT.md — complete | ✅ |
| 2 | PROMPT_MANIFEST.md — complete | ✅ |
| 3 | PROMPT_STYLEGUIDE.md — complete | ✅ |
| 4 | GATES_CHECKLIST.md — complete | ✅ |
| 5 | TASK_TEMPLATES.md — complete with 5 examples | ✅ |
| 6 | HANDOFF_PROTOCOL.md — complete | ✅ |
| 7 | API_CONTRACTS.md — 9 endpoints documented | ✅ |
| 8 | DATA_CONTRACTS.md — 7 tables documented | ✅ |
| 9 | SECURITY_PLAYBOOK.md — complete | ✅ |
| 10 | RUNBOOKS.md — complete | ✅ |
| 11 | COST_EFFICIENCY.md — complete | ✅ |
| 12 | REPLICATION_GUIDE.md — this file | ✅ |

---

## 7. REPLICABILITY CHECKLIST

| # | Requirement | Status |
|---|------------|--------|
| 1 | All secrets use {{ENV_VAR}} placeholders | ✅ |
| 2 | No hardcoded project names (find/replace works) | ✅ |
| 3 | Schema is market-agnostic (JSONB for flexibility) | ✅ |
| 4 | Prompts clearly separate domain logic from infrastructure | ✅ |
| 5 | Documentation self-contained (no external references) | ✅ |
| 6 | Step-by-step replication in < 60 minutes | ✅ |

---

## 8. RISK REGISTER (Top 15)

| # | Risk | Impact | Probability | Mitigation | Evidence |
|---|------|--------|------------|-----------|----------|
| 1 | Cross-tenant data leak | CRITICAL | LOW | RLS + test script + Gate 0 check | G0-04 PASS |
| 2 | Secret exposure in repo | CRITICAL | LOW | .gitignore + gitleaks CI + rotation policy | G0-15 |
| 3 | AI hallucination in reports | HIGH | MEDIUM | VRS score + QA agent + human review | GC-02 |
| 4 | AI cost overrun | MEDIUM | MEDIUM | Per-case budget cap + alerts | Cost tracking |
| 5 | Supabase outage | HIGH | LOW | Vercel cache + status page + BCP | Runbook |
| 6 | Hash chain corruption | HIGH | LOW | Trigger validation + no UPDATE policy | G0-06 |
| 7 | MFA bypass | CRITICAL | LOW | Supabase enforced TOTP | G0-05 |
| 8 | Prompt injection via PDF | HIGH | MEDIUM | Input sanitization + output validation | GB-04 |
| 9 | Database migration failure | MEDIUM | MEDIUM | Backup before migrate + rollback SQL | Runbook |
| 10 | Vercel build failure blocks deploy | MEDIUM | MEDIUM | Rollback to previous deploy | Runbook |
| 11 | Key rotation causes downtime | MEDIUM | LOW | Document procedure + test in staging | Security playbook |
| 12 | Dependency vulnerability | MEDIUM | HIGH | npm audit in CI + monthly review | CI pipeline |
| 13 | Scope creep in MVP | HIGH | HIGH | Gate A scope lock + PMO enforcement | GA checklist |
| 14 | Single point of failure (1 dev) | HIGH | MEDIUM | Document everything + replication guide | This file |
| 15 | Regulatory non-compliance | CRITICAL | MEDIUM | Compliance agent + legal review at Gate D | GD-02 |

---

*END OF REPLICATION_GUIDE.md v1.0.0*
