# NourishIQ Monorepo

This repo contains:

- `apps/admin` (Next.js dashboard)
- `apps/mobile` (Expo React Native)
- `services/api` (Express + Prisma + Stripe)
- `packages/db` (Prisma client wrapper)
- `packages/ds` (Data Science utils)
- `scripts/` (utility scripts)

## Development

```bash
pnpm install
pnpm -r build
pnpm -r dev
```

Use `.env.example` from `services/api/` as base for env vars.
