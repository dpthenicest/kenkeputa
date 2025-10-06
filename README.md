
# 🧩 Full Stack App Setup & Run Guide

This guide explains how to set up and run both the **client (React Native with Expo)** and **server (Node.js + Express + Prisma + PostgreSQL)** for this simple ecommerce project.

---

## ⚙️ Prerequisites

Before proceeding, ensure you have the following installed:

* [Node.js (v18 or later)](https://nodejs.org/)
* [npm](https://www.npmjs.com/)
* [PostgreSQL](https://www.postgresql.org/)
* [Expo CLI](https://docs.expo.dev/get-started/installation/)
* [Prisma CLI](https://www.prisma.io/docs/getting-started)

---

## 📁 Folder Structure

```
project-root/
├── client/     # React Native (Expo) app
└── server/     # Node.js, Express, Prisma, PostgreSQL backend
```

---

## 🖥️ Backend Setup (Node.js + Express + Prisma + PostgreSQL)

### 1. Navigate to the Server Directory

```bash
cd server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create the `.env` File

Create a `.env` file in the `server` directory and add your environment variables:

```bash
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<database_name>?schema=public"
PORT=5000
JWT_SECRET=your_jwt_secret_key
REFRESH_SECRET=your_refresh_secret_key
```

> ⚠️ Replace `<username>`, `<password>`, and `<database_name>` with your PostgreSQL credentials.

### 4. Set Up Prisma Schema

Ensure your `prisma/schema.prisma` file matches your database models, then run:

```bash
npx prisma migrate dev --name init
```

This will create the database tables.

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Seed the Database (Optional)

If you have a `prisma/seed.ts` or `prisma/seed.js` file configured:

```bash
npx prisma db seed
```

### 7. Run the Development Server

```bash
npm run dev
```

Your backend should now be running on:

> 🌐 [http://localhost:5000](http://localhost:5000)

---

## 📱 Frontend Setup (React Native + Expo)

### 1. Navigate to the Client Directory

```bash
cd client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure API URL

In your client’s environment or constants file (e.g. `constants/api.ts`), add your backend base URL:

```ts
export const API_BASE_URL = "http://localhost:5000/api";
```

> 💡 If you’re running the app on a **physical device**, you’ll need to tunnel your local server using [ngrok](https://ngrok.com/) or use your local IP address instead of `localhost`.

Example with ngrok:

```bash
npx ngrok http 5000
```

Then replace the API base URL with the generated HTTPS link.

### 4. Start the Expo App

```bash
npx expo start
```

Expo will prompt you to choose a platform:

* Press **“w”** to open on **Web**
* Press **“a”** for **Android Emulator**
* Press **“i”** for **iOS Simulator** (Mac only)

> ⚠️ If your backend isn’t tunneled, **use the Web platform** or ensure both server and client run on the same network (e.g. `http://192.168.x.x:5000`).

---

## 🧪 Testing the Setup

1. Run the backend:

   ```bash
   cd server
   npm run dev
   ```

2. Run the frontend:

   ```bash
   cd client
   npx expo start
   ```

3. Open the app on web or mobile and test:

   * **Login / Signup**
   * **View Products**
   * **Add to Cart**
   * **Manage Stock (Admin only)**

---

## 🛠️ Troubleshooting

| Issue                           | Possible Fix                                                    |
| ------------------------------- | --------------------------------------------------------------- |
| **Expo app can’t reach server** | Use `ngrok` or replace `localhost` with your machine’s local IP |
| **Prisma client not found**     | Run `npx prisma generate`                                       |
| **Database connection error**   | Check `.env` for correct `DATABASE_URL`                         |
| **CORS errors**                 | Ensure `cors()` middleware is enabled in your Express app       |

---


# E-Commerce API Documentation

Base URL: `http://localhost:PORT/api`
PORT: 5000 | `any other port number`

---

## Authentication

### Register User

**Endpoint:** `POST /api/auth/register`

**Description:** Create a new user account.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
- `fullName`: Minimum 2 characters
- `email`: Valid email format
- `password`: Minimum 6 characters

**Success Response (201):**
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "role": "USER"
  }
}
```

**Error Response (400):**
```json
{
  "message": "Email already in use"
}
```

---

### Login User

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
- `email`: Valid email format
- `password`: Minimum 6 characters

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "role": "USER"
  }
}
```

**Error Response (400):**
```json
{
  "message": "Invalid credentials"
}
```

---

## Products

### Get All Products

**Endpoint:** `GET /api/products`

**Description:** Retrieve all products with optional filtering and pagination.

**Authentication:** Not required

**Query Parameters:**
- `search` (optional): Search by product name or description
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

**Example Request:**
```
GET /api/products?search=laptop&minPrice=500&maxPrice=2000&page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Gaming Laptop",
        "description": "High-performance gaming laptop",
        "price": 1299.99,
        "stockQuantity": 15,
        "imageUrl": "https://example.com/laptop.jpg",
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### Get Product by ID

**Endpoint:** `GET /api/products/:id`

**Description:** Retrieve a single product by its ID.

**Authentication:** Not required

**Path Parameters:**
- `id`: Product ID (number)

**Example Request:**
```
GET /api/products/1
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Gaming Laptop",
    "description": "High-performance gaming laptop",
    "price": 1299.99,
    "stockQuantity": 15,
    "imageUrl": "https://example.com/laptop.jpg",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "message": "Product not found"
}
```

---

### Create Product (Admin Only)

**Endpoint:** `POST /api/products`

**Description:** Create a new product (requires admin privileges).

**Authentication:** Required (Admin role)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Gaming Laptop",
  "description": "High-performance gaming laptop",
  "price": 1299.99,
  "stockQuantity": 15,
  "imageUrl": "https://example.com/laptop.jpg"
}
```

**Validation Rules:**
- `name`: Required, minimum 2 characters
- `description`: Optional
- `price`: Required, must be positive
- `stockQuantity`: Required, must be non-negative integer
- `imageUrl`: Optional, must be valid URL

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Gaming Laptop",
    "description": "High-performance gaming laptop",
    "price": 1299.99,
    "stockQuantity": 15,
    "imageUrl": "https://example.com/laptop.jpg",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

### Update Product (Admin Only)

**Endpoint:** `PUT /api/products/:id`

**Description:** Update an existing product (requires admin privileges).

**Authentication:** Required (Admin role)

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: Product ID (number)

**Request Body:**
```json
{
  "name": "Updated Gaming Laptop",
  "price": 1199.99,
  "stockQuantity": 20
}
```

**Validation Rules:**
- All fields are optional
- `price`: Must be positive if provided
- `stockQuantity`: Must be non-negative integer if provided
- `imageUrl`: Must be valid URL if provided

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Updated Gaming Laptop",
    "description": "High-performance gaming laptop",
    "price": 1199.99,
    "stockQuantity": 20,
    "imageUrl": "https://example.com/laptop.jpg",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T12:45:00.000Z"
  }
}
```

---

### Delete Product (Admin Only)

**Endpoint:** `DELETE /api/products/:id`

**Description:** Delete a product (requires admin privileges).

**Authentication:** Required (Admin role)

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: Product ID (number)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## Cart

All cart endpoints require authentication. Include the JWT token in the Authorization header.

### Get User Cart

**Endpoint:** `GET /api/cart`

**Description:** Retrieve the authenticated user's cart with all items.

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T11:30:00.000Z",
    "cartItems": [
      {
        "id": 1,
        "cartId": 1,
        "productId": 1,
        "quantity": 2,
        "createdAt": "2025-01-15T11:00:00.000Z",
        "updatedAt": "2025-01-15T11:30:00.000Z",
        "product": {
          "id": 1,
          "name": "Gaming Laptop",
          "price": 1299.99,
          "imageUrl": "https://example.com/laptop.jpg"
        },
        "subtotal": 2599.98
      }
    ],
    "total": 2599.98
  }
}
```

---

### Add Item to Cart

**Endpoint:** `POST /api/cart/add`

**Description:** Add a product to cart or increment quantity if already exists.

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Validation Rules:**
- `productId`: Required, must be positive integer
- `quantity`: Required, minimum 1

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "cartId": 1,
    "productId": 1,
    "quantity": 2,
    "createdAt": "2025-01-15T11:00:00.000Z",
    "updatedAt": "2025-01-15T11:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "message": "Product not found"
}
```

---

### Update Cart Item Quantity

**Endpoint:** `PUT /api/cart/update/:cartItemId`

**Description:** Decrease quantity of a cart item (or remove if reaches zero).

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `cartItemId`: Cart item ID (number)

**Request Body:**
```json
{
  "quantity": 1
}
```

**Validation Rules:**
- `quantity`: Required, minimum 1

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "cartId": 1,
    "productId": 1,
    "quantity": 1,
    "createdAt": "2025-01-15T11:00:00.000Z",
    "updatedAt": "2025-01-15T11:45:00.000Z"
  }
}
```

**Response when quantity reaches zero (200):**
```json
{
  "success": true,
  "data": {
    "message": "Item removed from cart"
  }
}
```

---

### Remove Item from Cart

**Endpoint:** `DELETE /api/cart/remove/:cartItemId`

**Description:** Completely remove an item from the cart.

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `cartItemId`: Cart item ID (number)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

**Error Response (404):**
```json
{
  "message": "Cart item not found"
}
```

---

## Orders

All order endpoints require authentication.

### Create Order

**Endpoint:** `POST /api/orders`

**Description:** Create an order from the user's cart. Validates stock availability and clears cart after successful order creation.

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "cartId": 1
}
```

**Validation Rules:**
- `cartId`: Required, must be positive integer

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "totalAmount": 2599.98,
    "status": "PENDING",
    "createdAt": "2025-01-15T12:00:00.000Z",
    "updatedAt": "2025-01-15T12:00:00.000Z",
    "orderItems": [
      {
        "id": 1,
        "orderId": 1,
        "productId": 1,
        "quantity": 2,
        "unitPrice": 1299.99,
        "subtotal": 2599.98,
        "createdAt": "2025-01-15T12:00:00.000Z",
        "updatedAt": "2025-01-15T12:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**

Cart is empty (400):
```json
{
  "message": "Cart is empty"
}
```

Insufficient stock (400):
```json
{
  "message": "Insufficient stock for product \"Gaming Laptop\". Only 1 left."
}
```

Invalid or unauthorized cart (403):
```json
{
  "message": "Invalid or unauthorized cart"
}
```

---

### Update Order Status

**Endpoint:** `PUT /api/orders/:orderId/status`

**Description:** Update the status of an order.

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `orderId`: Order ID (number)

**Request Body:**
```json
{
  "status": "SHIPPED"
}
```

**Validation Rules:**
- `status`: Required, must be one of: `PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "totalAmount": 2599.98,
    "status": "SHIPPED",
    "createdAt": "2025-01-15T12:00:00.000Z",
    "updatedAt": "2025-01-15T14:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "message": "Order not found"
}
```

---

### Get User Orders

**Endpoint:** `GET /api/orders`

**Description:** Retrieve all orders for the authenticated user, sorted by creation date (newest first).

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "userId": 1,
      "totalAmount": 799.99,
      "status": "DELIVERED",
      "createdAt": "2025-01-20T10:00:00.000Z",
      "updatedAt": "2025-01-22T15:30:00.000Z",
      "orderItems": [
        {
          "id": 2,
          "orderId": 2,
          "productId": 2,
          "quantity": 1,
          "unitPrice": 799.99,
          "subtotal": 799.99,
          "product": {
            "id": 2,
            "name": "Wireless Headphones",
            "price": 799.99,
            "imageUrl": "https://example.com/headphones.jpg"
          }
        }
      ]
    },
    {
      "id": 1,
      "userId": 1,
      "totalAmount": 2599.98,
      "status": "SHIPPED",
      "createdAt": "2025-01-15T12:00:00.000Z",
      "updatedAt": "2025-01-15T14:30:00.000Z",
      "orderItems": [
        {
          "id": 1,
          "orderId": 1,
          "productId": 1,
          "quantity": 2,
          "unitPrice": 1299.99,
          "subtotal": 2599.98,
          "product": {
            "id": 1,
            "name": "Gaming Laptop",
            "price": 1299.99,
            "imageUrl": "https://example.com/laptop.jpg"
          }
        }
      ]
    }
  ]
}
```

---

## Common Error Responses

### Authentication Error (401)
```json
{
  "message": "Unauthorized: Missing user ID"
}
```

### Authorization Error (403)
```json
{
  "message": "Access denied. Admin privileges required."
}
```

### Validation Error (400)
```json
{
  "message": "Validation error details"
}
```

### Not Found Error (404)
```json
{
  "message": "Resource not found"
}
```

---

## Notes

1. **Authentication:** Most endpoints require a valid JWT token in the Authorization header using the Bearer scheme.
2. **Admin Routes:** Product creation, updating, and deletion require admin role privileges.
3. **Cart Management:** The cart is automatically created when a user first adds an item.
4. **Order Creation:** Stock quantities are validated and decremented atomically when creating orders. The cart is cleared after successful order creation.
5. **Pagination:** Product listing supports pagination with default values of page=1 and limit=10.


# Technology stack used and any known limitations

### React Native (Expo)
### NodeJs (ExpressJs)
### TypeScript
### Prisma & PrismaORM
### Postgresql

## You can find my seed file in:
- `/server/prisma/seed.ts`

## Limitations: Didn't add error/success message alerts for some views.
