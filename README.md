# InventoryPro — Mini Inventory & Order Management System

A full-stack MERN application for managing products, stock, and customer orders.

## Screenshots

> Dashboard, Products, Orders, and Customers pages with full CRUD, search, filters, and modals.

---

## Tech Stack

- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Frontend:** React.js, React Router v6, Axios, Lucide React, React Hot Toast
- **Styling:** Custom CSS Design System (no external UI framework)

---

## Setup Instructions

### Prerequisites
- Node.js >= 16
- MongoDB running locally on port `27017`

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd inventory-order-management
```

### 2. Install all dependencies
```bash
npm run install-all
```

### 3. Configure environment variables
```bash
cp server/.env.example server/.env
```
Edit `server/.env` with your values.

### 4. Run the application
```bash
npm run dev
```
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

---

## Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/inventory_db
NODE_ENV=development
```

---

## API Reference

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (search, filter, paginate) |
| GET | `/api/products/categories` | Get distinct categories |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List orders (filter by status, paginate) |
| GET | `/api/orders/:id` | Get order details |
| POST | `/api/orders` | Create order |
| PATCH | `/api/orders/:id/status` | Update order status |
| DELETE | `/api/orders/:id` | Delete pending/cancelled order |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List customers (search, paginate) |
| GET | `/api/customers/:id` | Get single customer |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get stats and recent orders |

---

## Database Models

### Product
```
name, sku (unique), price, stock, category, status (active/inactive), description, timestamps
```

### Customer
```
name, email (unique), phone, address, timestamps
```

### Order
```
orderNumber (auto-generated), customer (ref), items[], totalAmount, status (pending/confirmed/cancelled), notes, timestamps
```

### Order Item (embedded)
```
product (ref), productName (snapshot), productSku (snapshot), quantity, unitPrice (snapshot), subtotal
```

> Order items store **price snapshots** at the time of order creation. This ensures the order total remains correct even if the product price changes later.

---

## Tricky Logic Explained

### 1. Race Condition — Two users ordering last stock
MongoDB **transactions with sessions** are used in `updateOrderStatus`. Stock is only deducted when an order is **confirmed** (not created). The `$inc` operation is atomic. If two users confirm simultaneously, the second will fail with an "Insufficient stock" error.

### 2. Same product added multiple times in one order
On the backend in `createOrder`, items are **merged by product ID** before processing. Quantities are summed, and the total stock check is done against the merged quantity.

### 3. Product deleted after used in an order
Order items store **snapshots** of `productName`, `productSku`, and `unitPrice` at creation time. Deleting a product does not affect existing orders — all historical data is preserved.

### 4. Cancelled order cancelled again
`updateOrderStatus` checks `if (order.status === "cancelled")` and returns a `400` error: "Cannot update a cancelled order."

### 5. Confirmed order edited
Confirmed orders cannot have their status reverted to pending. The only allowed transition from `confirmed` is to `cancelled` (which restores stock).

### 6. Price changes after order created
Prices are **snapshotted** in `unitPrice` and `subtotal` fields on the order item. The `totalAmount` is calculated at creation time and never recalculated from current product prices.

### 7. Invalid/negative quantity
Validated at both frontend (form validation) and backend (express-validator + manual check). Quantities must be positive integers ≥ 1.

### 8. Duplicate SKU
MongoDB unique index on `sku` field. The error handler catches `code 11000` (duplicate key) and returns a clean `409 Conflict` response.

### 9. Order total correctness
`totalAmount` is computed server-side at order creation using current product prices and stored permanently. It is never derived from current product data.

---

## Folder Structure

```
├── server/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── customerController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   ├── Product.js
│   │   ├── Customer.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── customerRoutes.js
│   │   └── dashboardRoutes.js
│   ├── .env.example
│   └── index.js
├── client/
│   ├── public/index.html
│   └── src/
│       ├── components/
│       │   ├── common/
│       │   │   ├── Modal.jsx
│       │   │   ├── ConfirmDialog.jsx
│       │   │   └── Pagination.jsx
│       │   └── layout/
│       │       ├── Sidebar.jsx
│       │       └── Topbar.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Products.jsx
│       │   ├── ProductForm.jsx
│       │   ├── Orders.jsx
│       │   ├── OrderForm.jsx
│       │   ├── OrderDetail.jsx
│       │   ├── Customers.jsx
│       │   └── CustomerForm.jsx
│       ├── services/api.js
│       ├── utils/helpers.js
│       ├── App.js
│       └── index.js
├── package.json
└── README.md
```
