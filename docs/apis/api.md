# CodeLens API Documentation

## Base URL

http://localhost:5000/api/v1

---

# Authentication APIs

## 1. Register User

Creates a new user account.

### Endpoint

POST /auth/register

### Request Body

{
  "name": "Shubham",
  "email": "shubham@gmail.com",
  "password": "12345678"
}

### Validation Rules

- name: Required, minimum 2 characters
- email: Required, valid email
- password: Required, minimum 8 characters

### Success Response

Status: 201 Created

{
  "success": true,
  "message": "User Registered Successfully",
  "data": {
    "id": "user-id",
    "name": "Shubham",
    "email": "shubham@gmail.com",
    "createdAt": "2026-08-17T00:00:00.000Z"
  }
}

### Errors

#### 400 Bad Request

Validation failed.

#### 409 Conflict

{
  "success": false,
  "message": "User already exists"
}

---

# 2. Login User

Authenticates an existing user and returns a JWT token.

### Endpoint

POST /auth/login

### Request Body

{
  "email": "shubham@gmail.com",
  "password": "12345678"
}

### Validation Rules

- email: Required, valid email
- password: Required

### Success Response

Status: 200 OK

{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-id",
      "name": "Shubham",
      "email": "shubham@gmail.com"
    },
    "token": "JWT_TOKEN"
  }
}

### Errors

#### 400 Bad Request

Validation failed.

#### 401 Unauthorized

{
  "success": false,
  "message": "Invalid email or password"
}

---

# Response Format

## Success Response

{
  "success": true,
  "message": "Operation successful",
  "data": {}
}

## Error Response

{
  "success": false,
  "message": "Something went wrong"
}

---

# Authentication Flow

Register
   ↓
User Created
   ↓
Login
   ↓
Email + Password Verification
   ↓
JWT Generated
   ↓
Client Receives Token
   ↓
Protected API
   ↓
Authorization: Bearer <token>

---

# Security

- Passwords are hashed using bcrypt.
- Plain-text passwords are never stored.
- Passwords are never returned in API responses.
- JWT contains only the required user identifier.
- Invalid credentials return a generic error message.
- Protected APIs require a valid JWT.

---

# Current API Endpoints

| Method | Endpoint | Authentication | Description |
|--------|----------|----------------|-------------|
| POST | /auth/register | No | Register a new user |
| POST | /auth/login | No | Login and receive JWT |

---

# HTTP Status Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Request successful |
| 201 | Resource created |
| 400 | Bad request / validation error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource not found |
| 409 | Resource already exists |
| 500 | Internal server error |