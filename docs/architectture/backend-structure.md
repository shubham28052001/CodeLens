# CodeLens Backend Architecture & File Responsibilities

## Overview

CodeLens backend follows a layered architecture where each folder has a specific responsibility.

The main request flow is:

```text
Request
   ↓
Route
   ↓
Middleware
   ↓
Controller
   ↓
Service
   ↓
Prisma
   ↓
PostgreSQL
```

Supporting utilities such as JWT, password hashing, error handling, and API responses are kept inside `utils`.

---

# Backend Structure

```text
Server/
│
├── src/
│   │
│   ├── controllers/
│   │   └── auth.controller.js
│   │
│   ├── routes/
│   │   └── auth.routes.js
│   │
│   ├── services/
│   │   └── auth.service.js
│   │
│   ├── middleware/
│   │   └── error.middleware.js
│   │
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   ├── errors.js
│   │   ├── jwt.js
│   │   ├── password.js
│   │   └── response.js
│   │
│   ├── lib/
│   │   └── prisma.js
│   │
│   ├── app.js
│   └── server.js
│
├── prisma/
│   └── schema.prisma
│
├── .env
├── package.json
└── Dockerfile
```

---

# 1. Routes

Location:

```text
src/routes/
```

Routes define the API endpoints of the application.

Example:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

Example:

```js
router.post("/register", register);
```

### Responsibility

Routes should:

* Define API endpoints
* Connect endpoints to controllers
* Apply route-specific middleware when required

### Routes should NOT

Routes should not contain:

* Database queries
* Business logic
* Password hashing
* JWT generation

---

# 2. Controllers

Location:

```text
src/controllers/
```

Controllers handle HTTP requests and responses.

Example:

```text
auth.controller.js
```

Typical responsibilities:

1. Read request data
2. Call the appropriate service
3. Return the API response

Example:

```js
export const register = asyncHandler(async (req, res) => {
    const user = await registerUser(req.body);

    return successResponse(
        res,
        201,
        "User registered successfully",
        { user }
    );
});
```

Controllers should remain thin.

Business logic should be handled by services.

---

# 3. Services

Location:

```text
src/services/
```

Services contain the application's business logic.

Example:

```text
auth.service.js
```

Registration logic may include:

```text
Check existing email
        ↓
Validate business rules
        ↓
Hash password
        ↓
Create user
        ↓
Generate tokens
        ↓
Return user
```

Example:

```js
const existingUser = await prisma.user.findUnique({
    where: {
        email
    }
});
```

Services can interact with Prisma and other application utilities.

### Services should NOT

Services should not directly handle HTTP responses.

Avoid:

```js
res.status(201).json(...)
```

The controller handles the HTTP response.

---

# 4. Middleware

Location:

```text
src/middleware/
```

Middleware runs between the incoming request and the final request handler.

Current middleware:

```text
error.middleware.js
```

Future middleware may include:

```text
auth.middleware.js
validation.middleware.js
rateLimit.middleware.js
```

### Authentication Middleware

A future authentication middleware can perform:

```text
Request
   ↓
Read JWT
   ↓
Verify JWT
   ↓
Attach user information
   ↓
Next middleware/controller
```

---

# 5. Error Middleware

File:

```text
src/middleware/error.middleware.js
```

The error middleware provides centralized error handling.

Flow:

```text
Service
   ↓
throw Error
   ↓
asyncHandler
   ↓
next(error)
   ↓
error.middleware.js
   ↓
errorResponse()
   ↓
Client
```

Example:

```js
const errorMiddleware = (err, req, res, next) => {
    console.error(err);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    return errorResponse(
        res,
        statusCode,
        message
    );
};
```

The error middleware should be registered after the application routes.

```js
app.use(errorMiddleware);
```

---

# 6. Utils

Location:

```text
src/utils/
```

The `utils` directory contains reusable helper functions.

Current utilities:

```text
asyncHandler.js
errors.js
jwt.js
password.js
response.js
```

---

## 6.1 asyncHandler.js

Purpose:

Handle errors from asynchronous controllers without repeating `try/catch` in every controller.

Example:

```js
const asyncHandler = (handler) => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};
```

Usage:

```js
export const register = asyncHandler(async (req, res) => {
    // controller logic
});
```

---

## 6.2 errors.js

Purpose:

Define custom application errors.

Current errors:

```text
AppError             → 500
BadRequestError      → 400
UnauthorizedError    → 401
ForbiddenError       → 403
NotFoundError        → 404
ConflictError        → 409
```

Example:

```js
throw new ConflictError("Email already registered");
```

This allows the error middleware to determine the correct HTTP status code.

---

## 6.3 jwt.js

Purpose:

Handle JSON Web Token operations.

Expected responsibilities:

```text
Generate Access Token
Generate Refresh Token
Verify Access Token
Verify Refresh Token
```

Authentication flow:

```text
Login
  ↓
Generate Access Token
  ↓
Generate Refresh Token
  ↓
Return/store tokens
```

---

## 6.4 password.js

Purpose:

Handle password hashing and comparison.

Functions:

```text
hashPassword()
comparePassword()
```

Registration:

```text
Plain Password
      ↓
hashPassword()
      ↓
Password Hash
      ↓
Database
```

Login:

```text
Entered Password
      ↓
comparePassword()
      ↓
Stored Hash
```

Passwords must never be stored in plain text.

---

## 6.5 response.js

Purpose:

Maintain a consistent API response structure.

Success response:

```js
successResponse(
    res,
    201,
    "User registered successfully",
    { user }
);
```

Example response:

```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {}
    }
}
```

Error response:

```js
errorResponse(
    res,
    409,
    "Email already registered"
);
```

Example:

```json
{
    "success": false,
    "message": "Email already registered",
    "error": null
}
```

---

# 7. lib

Location:

```text
src/lib/
```

The `lib` directory contains initialized external libraries and clients.

Current file:

```text
prisma.js
```

It creates and exports the Prisma client.

Other application files can use:

```js
import prisma from "../lib/prisma.js";
```

This prevents Prisma client initialization from being duplicated throughout the application.

---

# 8. app.js

File:

```text
src/app.js
```

`app.js` creates and configures the Express application.

Responsibilities include:

* Creating the Express app
* Configuring CORS
* Configuring JSON parsing
* Registering routes
* Registering middleware
* Registering the global error handler

Typical flow:

```text
Express App
    ↓
CORS
    ↓
JSON Parser
    ↓
Routes
    ↓
Error Middleware
```

`app.js` should not contain major business logic.

---

# 9. server.js

File:

```text
src/server.js
```

`server.js` starts the HTTP server.

Example:

```js
import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`CodeLens API running on port ${PORT}`);
});
```

The responsibility is simply to start the server.

---

# 10. Prisma

Location:

```text
prisma/schema.prisma
```

Prisma schema defines the application's database models and relationships.

Current hierarchy:

```text
User
 └── Workspace
      └── Repository
           └── Analysis
                └── Finding
```

Prisma handles:

* Database models
* Relationships
* Migrations
* Type-safe database queries
* Generated Prisma Client

---

# 11. Environment Variables

Server environment variables are stored in:

```text
Server/.env
```

Example:

```text
DATABASE_URL=...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
PORT=5000
```

Environment files must not be committed to Git.

Add:

```text
.env
```

to `.gitignore`.

---

# Complete Request Flow

A typical registration request follows this architecture:

```text
POST /api/auth/register
          │
          ▼
   auth.routes.js
          │
          ▼
 auth.controller.js
          │
          ▼
    asyncHandler
          │
          ▼
   auth.service.js
          │
     ┌────┴────┐
     ▼         ▼
password.js  prisma.js
     │         │
     ▼         ▼
   bcrypt   PostgreSQL
          │
          ▼
   auth.controller
          │
          ▼
    response.js
          │
          ▼
       Client
```

---

# Error Flow

If an error occurs:

```text
Service
   │
   ▼
throw new ConflictError(...)
   │
   ▼
asyncHandler
   │
   ▼
next(error)
   │
   ▼
error.middleware.js
   │
   ▼
errorResponse()
   │
   ▼
Client
```

---

# Architecture Rules

## Rule 1 — Keep Controllers Thin

Controllers should coordinate requests and responses.

Business logic belongs in services.

---

## Rule 2 — Keep Routes Simple

Routes should only define endpoints and middleware.

Avoid database queries inside route files.

---

## Rule 3 — Keep Database Access Centralized

Use Prisma through:

```text
src/lib/prisma.js
```

---

## Rule 4 — Do Not Store Passwords Directly

Always hash passwords before storing them.

---

## Rule 5 — Do Not Return Passwords

User queries should explicitly select safe fields when returning user data.

---

## Rule 6 — Use Centralized Error Handling

Avoid repeating error response logic across controllers.

Use:

```text
asyncHandler
     +
errors.js
     +
error.middleware.js
     +
response.js
```

---

# Summary

| Layer          | Responsibility                         |
| -------------- | -------------------------------------- |
| `routes/`      | Define API endpoints                   |
| `controllers/` | Handle HTTP request/response           |
| `services/`    | Business logic                         |
| `middleware/`  | Request processing and error handling  |
| `utils/`       | Reusable helper functions              |
| `lib/`         | External library/client initialization |
| `app.js`       | Express application configuration      |
| `server.js`    | Start HTTP server                      |
| `prisma/`      | Database schema and migrations         |

The overall architecture is:

```text
Client
  ↓
Routes
  ↓
Middleware
  ↓
Controllers
  ↓
Services
  ↓
Utils / Prisma
  ↓
PostgreSQL
```
