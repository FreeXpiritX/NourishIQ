
## Evidence API

The Evidence API exposes structured, evidence-based nutrition packs for BANM.

### List all evidence packs

```bash
curl -s http://localhost:8083/api/evidence | jq
{ "items": ["honey","turmeric","omega3","fasting"] }
curl -s http://localhost:8083/api/evidence/honey | jq
{
  "id": "honey",
  "title": "Pure Bee Honey",
  "category": "Foods",
  "summary": "Honey is a natural sweetener rich in sugars, enzymes, and bioactive compounds...",
  "evidence": [...],
  "safety": [...],
  "banm_applications": [...],
  "authenticity": {...},
  "banm_tags": [...]
}
# Close the heredoc you started
