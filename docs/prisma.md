# Prisma

Prisma is the ORM for this project: schema, migrations, and (later) app queries.

## Where things live

| Path                          | Role                                                 |
| ----------------------------- | ---------------------------------------------------- |
| `prisma/schema.prisma`        | Models and enums (source of truth)                   |
| `prisma/migrations/`          | Sequential SQL migrations (`0001_...`, `0002_...`)   |
| `prisma/migrations/README.md` | Migration naming rules + changelog (why each exists) |
| `src/lib/db/client.ts`        | Shared `PrismaClient` for the Next.js app            |

## Why Prisma here

- Popular, simple workflow for Next.js + Postgres
- Schema-first TypeScript client
- Checked-in SQL migrations via `prisma migrate`
- Good enough for a personal MVP without custom migrate scripts

Tradeoff: Prisma is **forward-only**. There is no one-step `migrate down`. Local full reset is `npm run db:reset`.

## Day-to-day commands

```bash
npm run docker:up              # start Postgres (Colima + Compose)
npm run db:migrate             # apply pending migrations (deploy)
npm run db:migrate:dev         # create/apply while iterating on schema
npm run db:migrate:status      # see what is applied
npm run db:studio              # browse tables in the browser
npm run db:generate            # regenerate client after schema pulls
npm run db:reset               # wipe local Docker volume + re-migrate
```

`DATABASE_URL` must be set (see `.env.example` / `.env.local`).

## Sequential migrations

We do **not** keep opaque timestamp folder names as the readable history.

Use:

```text
0001_init/
0002_add_norm_chunks/
0003_...
```

Full rules and the human changelog live in [`prisma/migrations/README.md`](../prisma/migrations/README.md).

### Creating the next migration

1. Edit `prisma/schema.prisma`.
2. Prefer:

```bash
npm run db:migrate:dev -- --create-only --name short_snake_name
```

3. Rename the generated folder to the next number, for example `0002_short_snake_name`.
4. Document **why** in `prisma/migrations/README.md`.
5. Apply with `npm run db:migrate` (or let `migrate:dev` apply after rename if you are still in that flow).

## Using the client in app code

```ts
import { prisma } from "@/lib/db";

const user = await prisma.user.findUnique({
  where: { email: "you@example.com" },
});
```

The MVP API handlers still use `src/lib/mock`. Switch them to `prisma` when you wire durable storage.

## Related docs

- [database.md](./database.md) for ERD and entity overview
- [docker-and-local.md](./docker-and-local.md) for Colima / Compose
- [deployment.md](./deployment.md) for managed Postgres later
