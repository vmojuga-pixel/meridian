# HANDOVER

## Live

- Worker: meridian-api.vmojuga.workers.dev
- Repo: github.com/vmojuga-pixel/meridian
- Edge: github.com/vmojuga-pixel/meridian-edge

## Cloudflare

- Account ID: rujuk shell env / /root/.cf-key
- D1: meridian-db
- KV: MERIDIAN_KV
- R2: meridian-audit
- DO: Tenant (sqlite-backed)
- AI: Workers AI binding

## Secrets (set via wrangler secret)

- BREVO_API_KEY
- MAILTRAP_TOKEN
- EMAIL_FROM
- STRIPE_SECRET_KEY (optional)
- STRIPE_PRICE_MAP (optional, JSON)

## Deploy

    export CLOUDFLARE_API_TOKEN=$(cat /root/.cf-key)
    export CLOUDFLARE_ACCOUNT_ID=<account_id>
    npx wrangler deploy

## Migrations

0001_init, 0002_auth, 0003_apikeys, 0004_2fa, 0005_invites, 0006_billing, 0007_templates

    npx wrangler d1 migrations apply meridian-db --remote

## Edge Gateway

See meridian-edge repo. Requires MERIDIAN_API_KEY from dashboard.
