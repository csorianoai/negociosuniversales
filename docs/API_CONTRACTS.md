# API CONTRACTS — Negocios Universales

## Base URL
- Production: https://app.negociosuniversales.ai/api
- Local: http://localhost:3000/api

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|------------|
| GET | /api/health | No | Status check |
| GET | /api/cases | Yes | List cases (tenant filtered) |
| POST | /api/cases | Yes | Create new case |
| GET | /api/cases/:id | Yes | Case detail with evidence |
| POST | /api/cases/:id/evidence | Yes | Upload evidence file |
| POST | /api/agents/run | Yes | Trigger AI pipeline |
| POST | /api/agents/:name | Yes | Run individual agent |
| GET | /api/cases/:id/report | Yes | Download PDF report |
| GET | /api/cases/:id/audit-pack | Yes | Download Audit Pack ZIP |

See docs/SYSTEM_PROMPT_PACKAGE.md Section API_CONTRACTS for full request/response details.
