# 🔐 Authentication API Documentation

This document outlines the endpoints for user registration and authentication within the application.

---

## 🧾 Overview

**Base URL:** `/api/auth`

This module manages user registration and secure authentication. All passwords are **hashed** before storage, and successful authentication returns a signed **JSON Web Token (JWT)**.

---

## 📘 Endpoints

### 1. Register a New User

**Endpoint:** `POST /api/auth/register`

Creates a new user account. Input is validated using Zod, and the password is securely stored.

#### 📨 Request Body

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `fullName` | `string` | ✅ | Full name of the user (minimum 2 characters). |
| `email` | `string` | ✅ | Must be a valid email address. |
| `password` | `string` | ✅ | Must be at least 6 characters long. |

**Example Request:**
JSON:
{
  "fullName": "Fortune Precious",
  "email": "fortune@example.com",
  "password": "mypassword123"
}

#### ✅ Response — 201 Created

| Field | Type | Description |
| :--- | :--- | :--- |
| `message` | `string` | `"Registration successful"` |
| `token` | `string` | Signed JWT for immediate authentication. |
| `user` | `object` | Newly created user data. |

JSON:
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "fullName": "Fortune Precious",
    "email": "fortune@example.com",
    "role": "USER"
  }
}

### ❌ Response — 400 Bad Request
JSON:
{
  "message": "Email already in use"
}

