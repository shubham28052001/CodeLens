# Prisma Commands

This section contains the commonly used Prisma commands for the CodeLens project.

---

## 1. Install Prisma

Install Prisma CLI as a development dependency:

```bash
npm install -D prisma
```

Install Prisma Client:

```bash
npm install @prisma/client
```

For the PostgreSQL driver adapter used by CodeLens:

```bash
npm install @prisma/adapter-pg pg
```

---

## 2. Initialize Prisma

Initialize Prisma in a project:

```bash
npx prisma init
```

This creates the Prisma configuration and schema files.

---

## 3. Generate Prisma Client

Generate the Prisma Client from `schema.prisma`:

```bash
npx prisma generate
```

Run this whenever the Prisma schema changes.

The generated client is created in:

```text
generated/prisma/
```

This directory is generated automatically and should not be manually edited.

---

## 4. Create a Migration

Create and apply a development migration:

```bash
npx prisma migrate dev --name init
```

For future schema changes, use a descriptive migration name:

```bash
npx prisma migrate dev --name add_workspace
```

Examples:

```bash
npx prisma migrate dev --name add_auth
npx prisma migrate dev --name add_repository
npx prisma migrate dev --name add_analysis_status
```

This command:

1. Detects schema changes.
2. Creates a migration.
3. Applies the migration to the database.
4. Updates the Prisma Client when required.

---

## 5. Apply Migrations in Production

For production environments:

```bash
npx prisma migrate deploy
```

This applies existing migrations without creating new migrations.

Do not use `migrate dev` for production deployment.

---

## 6. Check Prisma Schema

Validate the Prisma schema:

```bash
npx prisma validate
```

This is useful before creating a migration.

---

## 7. Format Prisma Schema

Format the Prisma schema:

```bash
npx prisma format
```

This automatically formats `schema.prisma`.

---

## 8. Open Prisma Studio

Open Prisma Studio:

```bash
npx prisma studio
```

Prisma Studio provides a browser-based interface for viewing and managing database records.

Useful for development and debugging.

---

## 9. Introspect Existing Database

Pull the structure of an existing database into Prisma:

```bash
npx prisma db pull
```

Use this when the database already contains tables and Prisma needs to generate the corresponding schema.

### Important

`db pull` is generally used for:

```text
Database
    ↓
schema.prisma
```

Whereas migrations are used for:

```text
schema.prisma
    ↓
Database
```

---

## 10. Push Schema Without Migration

Push the Prisma schema directly to the database:

```bash
npx prisma db push
```

This is useful for quick prototyping.

For the CodeLens project, prefer migrations for structured development:

```bash
npx prisma migrate dev
```

---

## 11. Reset Development Database

Reset the development database:

```bash
npx prisma migrate reset
```

This will:

1. Drop the database/schema.
2. Recreate it.
3. Apply all migrations.
4. Run the seed script if configured.

### Warning

This deletes development data.

Do not use this command against a production database.

---

## 12. Check Migration Status

Check whether migrations are synchronized:

```bash
npx prisma migrate status
```

This helps identify pending or failed migrations.

---

## 13. View Prisma Version

Check the installed Prisma version:

```bash
npx prisma version
```

---

# Recommended CodeLens Workflow

For normal development:

```text
1. Edit schema.prisma
        ↓
2. Validate
        ↓
   npx prisma validate
        ↓
3. Format
        ↓
   npx prisma format
        ↓
4. Create migration
        ↓
   npx prisma migrate dev --name <migration_name>
        ↓
5. Generate client
        ↓
   npx prisma generate
        ↓
6. Test database
        ↓
   npx prisma studio
```

---

# Example: Adding a New Field

Suppose we add a `description` field to `Workspace`:

```prisma
model Workspace {
  id          String   @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userId String
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)

  repositories Repository[]
}
```

Then run:

```bash
npx prisma format
```

```bash
npx prisma validate
```

```bash
npx prisma migrate dev --name add_workspace_description
```

If necessary:

```bash
npx prisma generate
```

---

# Recommended Commands by Environment

| Situation                    | Command                                |
| ---------------------------- | -------------------------------------- |
| Validate schema              | `npx prisma validate`                  |
| Format schema                | `npx prisma format`                    |
| Generate client              | `npx prisma generate`                  |
| Create development migration | `npx prisma migrate dev --name <name>` |
| Apply production migrations  | `npx prisma migrate deploy`            |
| Check migration status       | `npx prisma migrate status`            |
| Open database UI             | `npx prisma studio`                    |
| Pull existing DB schema      | `npx prisma db pull`                   |
| Push schema directly         | `npx prisma db push`                   |
| Reset development DB         | `npx prisma migrate reset`             |
| Check Prisma version         | `npx prisma version`                   |

---

# CodeLens Database Rule

For CodeLens development, the preferred workflow is:

```text
schema.prisma
      ↓
prisma validate
      ↓
prisma format
      ↓
prisma migrate dev
      ↓
PostgreSQL
      ↓
Prisma Client
      ↓
Backend
```

Avoid manually modifying generated Prisma Client files.

Whenever the database structure changes, update `schema.prisma` first and create a proper migration.
