# LinguaCamp

LinguaCamp is an exam-oriented language-preparation MVP built with Next.js, TypeScript, Auth.js, Prisma 7 and PostgreSQL. Its core student journey is registration → exam onboarding → generated study plan → lessons and practice → timed mock checkpoint → progress dashboard.

## Local setup

Prerequisites: Node.js 20.9 or later, npm, and Docker Compose or a PostgreSQL 16+ server.

1. Install dependencies:

   ```powershell
   npm ci
   ```

2. Create `.env` from `.env.example`. Set a unique `AUTH_SECRET` before running the app. For example:

   ```powershell
   Copy-Item .env.example .env
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

   Put the generated value in `AUTH_SECRET`. `.env` is ignored by Git.

3. Start PostgreSQL locally if using Docker Compose:

   ```powershell
   docker compose up -d postgres
   ```

   The default development connection is `postgresql://postgres:postgres@localhost:5432/linguacamp?schema=public`; use it for both `DATABASE_URL` and `DIRECT_URL`. For Neon, use its pooled connection string for `DATABASE_URL` and its direct connection string for `DIRECT_URL`. Change both `.env` URLs and the compose password if you change the local database credentials.

4. Apply the checked-in migration and load original demo content:

   ```powershell
   npm run db:deploy
   npm run db:seed
   ```

5. Run the checks and start development:

   ```powershell
   npm run typecheck
   npm run lint
   npm run dev
   ```

   Open `http://localhost:3000`.

## Environment variables

Required:

- `DATABASE_URL` — PostgreSQL connection string.
- `DIRECT_URL` — direct PostgreSQL connection used for Prisma migrations; optional when it is the same as `DATABASE_URL`.
- `AUTH_SECRET` — long, random Auth.js secret.

Optional:

- `AUTH_URL` — public application URL for authentication callbacks.
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — enable Google OAuth when both are set.
- `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL` — enable the OpenAI-compatible AI tutor. The provider request happens server-side. Without `AI_API_KEY`, the tutor returns a configuration message and does not invent a response.
- `RESEND_API_KEY`, `EMAIL_FROM` — enable password-reset email delivery. Password reset intentionally returns an unavailable response when email is not configured.

Never commit real secrets. Configure production secrets through the hosting provider.

## Database and content

The schema is in `prisma/schema.prisma`; the initial SQL migration is in `prisma/migrations`. Prisma configuration is in `prisma.config.ts`. Useful commands:

```powershell
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run db:seed
npm run db:studio
```

The seed is repeatable and inserts exam catalogs, level configurations, original sample questions, lessons and short checkpoint mocks. Seeded questions are explicitly non-official. Examination timing/configuration is data-driven, but seeded values are a starting configuration: verify each level against its linked authority before using it as booking or scoring guidance.

## MVP scope and production gaps

Implemented: public exam pages, credentials registration/login, optional Google sign-in, reset-token flow, onboarding and plan generation, dashboard metrics, lesson progress, original multiple-choice practice, timed section checkpoints, answer review, content library, preferences, and an optional provider-backed text tutor.

Not implemented: official or full-length exam scoring, writing/speaking assessment, audio recording/transcription, AI-generated questions, adaptive rescheduling after missed days, instructor/cohort workflows, admin CRUD, subscriptions and payment processing, account deletion, and email verification. Database models for several later-phase features are groundwork only; they are not working product features.

The dashboard's readiness number is a heuristic based on task completion and recorded answer accuracy. It is not a pass prediction. The mock percentage is raw correctness for the sample questions, not an official scaled score.

## Production checklist

- Use managed PostgreSQL with backups and TLS; run `npm run db:deploy` as a release step.
- Set a production-grade `AUTH_SECRET`, `AUTH_URL`, `DATABASE_URL`, and trusted AI/email provider credentials.
- Configure provider rate limits, monitoring, error reporting, retention and deletion workflows.
- Review examination formats and timings with each official authority; keep source links and format version metadata current.
- Complete privacy, terms, accessibility, security and payment-provider reviews before charging users.
- Add automated integration tests using an isolated PostgreSQL database before launch.
