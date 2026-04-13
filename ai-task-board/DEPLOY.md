# AI Task Board — Railway Deployment

## Services

Create two Railway services from this monorepo:

### 1. API Service
- **Root directory:** `apps/api`
- **Build command:** `pnpm install && pnpm db:generate && pnpm build`
- **Start command:** `node dist/index.js`
- **Environment variables:**
  - `DATABASE_URL` — Railway PostgreSQL plugin (auto-injected)
  - `OPENAI_API_KEY` — your OpenAI API key
  - `FRONTEND_URL` — URL of the deployed web service
  - `BETTER_AUTH_SECRET` — random 32-char string (e.g. `openssl rand -hex 32`)
  - `PORT` — Railway sets this automatically

### 2. Web Service
- **Root directory:** `apps/web`
- **Build command:** `pnpm install && pnpm build`
- **Start command:** `pnpm start`
- **Environment variables:**
  - `NEXT_PUBLIC_API_URL` — URL of the deployed API service

### 3. PostgreSQL Plugin
- Add Railway PostgreSQL plugin to the API service
- `DATABASE_URL` is auto-injected

## Post-Deploy
After first deploy, run migrations:
```bash
railway run --service api pnpm db:migrate
```

## Local Development
```bash
cp apps/api/.env.example apps/api/.env
# Fill in DATABASE_URL and OPENAI_API_KEY
pnpm install
pnpm --filter @ai-task-board/api db:push
pnpm dev
```
