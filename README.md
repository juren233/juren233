# juren233.top

Cloudflare Worker powered personal portal for `juren233.top`.

## What is included

- Brand-first homepage for the main domain
- Featured subdomain entrance cards, including `share.juren233.top`
- Cooperation application form
- Short-update feed with publish/draft/pinned support
- Admin dashboard for posts and application review
- D1 schema for posts and applications

## Local setup

1. Install dependencies: `npm install`
2. Create a D1 database named `juren233web`
3. Replace `database_id` in `wrangler.toml` with the real D1 database UUID
4. Apply migrations: `wrangler d1 migrations apply juren233web --local`
5. Set local secrets:
   - `wrangler secret put ADMIN_TOKEN`
   - optionally set `ADMIN_EMAIL` if using Cloudflare Access
6. Start local dev server: `npm run dev`

## Important D1 note

`database_name` can be `juren233web`, but `database_id` cannot be the string `juren233web`.
Cloudflare requires the actual D1 database UUID in `wrangler.toml`.

## Cloudflare Access

Protect `/admin*` with Cloudflare Access and set `ADMIN_EMAIL` to the allowed email.
When Access is not active, the app falls back to a token-based admin login using `ADMIN_TOKEN`.
