# CodeLens Database Schema

## Overview

CodeLens uses PostgreSQL with Prisma ORM for database management.

The database is organized around a hierarchical code-analysis workflow:

```text
User
 └── Workspace
      └── Repository
           └── Analysis
                └── Finding
```

Each level represents a different part of the CodeLens workflow.

---

# Models

The database currently contains five models:

1. `User`
2. `Workspace`
3. `Repository`
4. `Analysis`
5. `Finding`

---

# 1. User

The `User` model represents an application user.

### Fields

| Field       | Type     | Required | Constraints       | Description            |
| ----------- | -------- | -------- | ----------------- | ---------------------- |
| `id`        | String   | Yes      | Primary Key, CUID | Unique user identifier |
| `email`     | String   | Yes      | Unique            | User's email address   |
| `name`      | String   | No       | —                 | User's display name    |
| `password`  | String   | Yes      | —                 | Hashed password        |
| `createdAt` | DateTime | Yes      | Default: `now()`  | Account creation time  |
| `updatedAt` | DateTime | Yes      | Auto updated      | Last modification time |

### Relationships

```text
User 1 ──────── N Workspace
```

One user can have multiple workspaces.

```prisma
workspaces Workspace[]
```

---

# 2. Workspace

A `Workspace` represents a user's working environment inside CodeLens.

### Fields

| Field       | Type     | Required | Constraints       | Description            |
| ----------- | -------- | -------- | ----------------- | ---------------------- |
| `id`        | String   | Yes      | Primary Key, CUID | Workspace identifier   |
| `name`      | String   | Yes      | —                 | Workspace name         |
| `createdAt` | DateTime | Yes      | Default: `now()`  | Creation time          |
| `updatedAt` | DateTime | Yes      | Auto updated      | Last modification time |
| `userId`    | String   | Yes      | Foreign Key       | Owner user ID          |

### Relationships

```text
Workspace N ──────── 1 User
Workspace 1 ──────── N Repository
```

Each workspace belongs to one user and can contain multiple repositories.

### Foreign Key

```text
Workspace.userId → User.id
```

### Delete Behavior

```text
User DELETE
     ↓
Workspace DELETE
```

The relationship uses:

```prisma
onDelete: Cascade
```

Deleting a user will delete their workspaces.

---

# 3. Repository

A `Repository` represents a source-code repository connected to a workspace.

### Fields

| Field         | Type     | Required | Constraints       | Description            |
| ------------- | -------- | -------- | ----------------- | ---------------------- |
| `id`          | String   | Yes      | Primary Key, CUID | Repository identifier  |
| `name`        | String   | Yes      | —                 | Repository name        |
| `url`         | String   | Yes      | —                 | Repository URL         |
| `createdAt`   | DateTime | Yes      | Default: `now()`  | Creation time          |
| `updatedAt`   | DateTime | Yes      | Auto updated      | Last modification time |
| `workspaceId` | String   | Yes      | Foreign Key       | Parent workspace ID    |

### Relationships

```text
Repository N ──────── 1 Workspace
Repository 1 ──────── N Analysis
```

### Foreign Key

```text
Repository.workspaceId → Workspace.id
```

### Delete Behavior

```text
Workspace DELETE
       ↓
Repository DELETE
       ↓
Analysis DELETE
```

Cascade deletion is enabled.

---

# 4. Analysis

An `Analysis` represents one code-analysis execution for a repository.

### Fields

| Field          | Type     | Required | Default     | Description              |
| -------------- | -------- | -------- | ----------- | ------------------------ |
| `id`           | String   | Yes      | CUID        | Analysis identifier      |
| `status`       | String   | Yes      | `"pending"` | Current analysis status  |
| `startedAt`    | DateTime | No       | `null`      | Analysis start time      |
| `completedAt`  | DateTime | No       | `null`      | Analysis completion time |
| `createdAt`    | DateTime | Yes      | `now()`     | Analysis creation time   |
| `repositoryId` | String   | Yes      | —           | Parent repository ID     |

### Relationships

```text
Analysis N ──────── 1 Repository
Analysis 1 ──────── N Finding
```

### Foreign Key

```text
Analysis.repositoryId → Repository.id
```

### Status

The initial status is:

```text
pending
```

Recommended future statuses:

```text
pending
running
completed
failed
```

These may later be converted into a Prisma enum for stronger type safety.

### Delete Behavior

```text
Repository DELETE
       ↓
Analysis DELETE
       ↓
Finding DELETE
```

Cascade deletion is enabled.

---

# 5. Finding

A `Finding` represents an individual issue discovered during code analysis.

### Fields

| Field        | Type     | Required | Description                |
| ------------ | -------- | -------- | -------------------------- |
| `id`         | String   | Yes      | Unique finding identifier  |
| `title`      | String   | Yes      | Short issue title          |
| `message`    | String   | Yes      | Detailed issue description |
| `severity`   | String   | Yes      | Issue severity             |
| `filePath`   | String   | Yes      | File containing the issue  |
| `line`       | Int      | No       | Line number                |
| `column`     | Int      | No       | Column number              |
| `suggestion` | String   | No       | Suggested fix              |
| `createdAt`  | DateTime | Yes      | Finding creation time      |
| `analysisId` | String   | Yes      | Parent analysis ID         |

### Relationships

```text
Finding N ──────── 1 Analysis
```

### Foreign Key

```text
Finding.analysisId → Analysis.id
```

### Example

A finding could represent:

```text
Title:
Unused Variable

Message:
Variable `userData` is declared but never used.

Severity:
warning

File:
src/controllers/user.js

Line:
42

Column:
11

Suggestion:
Remove the unused variable or use it in the function.
```

---

# Relationship Diagram

```text
┌──────────────┐
│     User     │
└──────┬───────┘
       │
       │ 1:N
       ▼
┌──────────────┐
│  Workspace   │
└──────┬───────┘
       │
       │ 1:N
       ▼
┌──────────────┐
│ Repository   │
└──────┬───────┘
       │
       │ 1:N
       ▼
┌──────────────┐
│   Analysis   │
└──────┬───────┘
       │
       │ 1:N
       ▼
┌──────────────┐
│   Finding    │
└──────────────┘
```

---

# Cascade Delete Strategy

All major parent-child relationships use `onDelete: Cascade`.

```text
User
 │
 └── Workspace
      │
      └── Repository
           │
           └── Analysis
                │
                └── Finding
```

Therefore:

### Delete User

```text
User
 └── Workspace
      └── Repository
           └── Analysis
                └── Finding
```

The entire hierarchy belonging to that user is removed.

### Delete Workspace

```text
Workspace
 └── Repository
      └── Analysis
           └── Finding
```

### Delete Repository

```text
Repository
 └── Analysis
      └── Finding
```

### Delete Analysis

```text
Analysis
 └── Finding
```

This prevents orphan records from remaining in the database.

---

# Primary Keys

Every model uses a CUID-based primary key:

```prisma
@id @default(cuid())
```

Example:

```text
clx8k2n4p0000abc123xyz
```

CUIDs provide application-level unique identifiers without relying on sequential integer IDs.

---

# Foreign Keys

The current foreign-key structure is:

```text
Workspace.userId
        ↓
User.id

Repository.workspaceId
        ↓
Workspace.id

Analysis.repositoryId
        ↓
Repository.id

Finding.analysisId
        ↓
Analysis.id
```

---

# Timestamp Strategy

All models use timestamps to track record lifecycle information.

Most models contain:

```prisma
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

`Analysis` and `Finding` additionally contain workflow-specific timestamps where required.

---

# Security Considerations

## Password

The `User.password` field must contain a hashed password.

Never store:

```text
password123
```

Store a secure password hash instead.

The password should never be returned from API responses.

## Repository URLs

Repository URLs may contain sensitive information depending on the repository provider.

Private repository credentials or access tokens should never be stored directly in the `url` field.

---

# Current Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  workspaces Workspace[]
}

model Workspace {
  id        String @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userId String
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)

  repositories Repository[]
}

model Repository {
  id        String   @id @default(cuid())
  name      String
  url       String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  analysis Analysis[]
}

model Analysis {
  id          String   @id @default(cuid())
  status      String   @default("pending")
  startedAt   DateTime?
  completedAt DateTime?
  createdAt   DateTime @default(now())

  repositoryId String
  repository   Repository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)

  findings Finding[]
}

model Finding {
  id         String   @id @default(cuid())
  title      String
  message    String
  severity   String
  filePath   String
  line       Int?
  column     Int?
  suggestion String?
  createdAt  DateTime @default(now())

  analysisId String
  analysis   Analysis @relation(fields: [analysisId], references: [id], onDelete: Cascade)
}
```

---

# Future Improvements

The following improvements can be considered as the application grows:

* Convert `Analysis.status` into a Prisma enum.
* Convert `Finding.severity` into a Prisma enum.
* Add repository provider information.
* Add repository branch information.
* Add commit SHA to analysis records.
* Add analysis duration.
* Add indexes for frequently queried foreign keys.
* Add authentication/session models if required.
* Add team/member support for shared workspaces.
