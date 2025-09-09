# Quickstart (Solo Founder)

1. Clone repo & install deps
```bash
git clone <your_repo_url>
cd nourishiq
pnpm install
```

2. Configure DB & Stripe
- Copy `.env.example` from `services/api` → `.env` and fill in secrets.

3. Push schema
```bash
pnpm -F @nourishiq/api db:push
```

4. Run API
```bash
pnpm -F @nourishiq/api dev
```

5. Run Admin & Mobile
```bash
pnpm -F @nourishiq/admin dev
pnpm -F @nourishiq/mobile start
```
