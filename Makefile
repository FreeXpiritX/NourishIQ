db\:up:
	pnpm -F @nourishiq/api db:push

api\:dev:
	cd services/api && pnpm dev

report:
	echo "Generate demo report (stub)"
