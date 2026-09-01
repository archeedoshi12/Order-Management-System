# InventoryPro — Mini Inventory & Order Management System (MERN Stack)

A production-ready full-stack **MERN** (MongoDB, Express.js, React.js, Node.js) application designed for high-concurrency inventory tracking, atomic order processing, customer management, and analytical business intelligence.

---

## 🌐 Live Deployments & Documentation Links

| Resource | URL | Description |
|---|---|---|
| **Live Frontend (Vercel)** | [https://oms-mernstack.vercel.app/](https://oms-mernstack.vercel.app/) | Responsive React web app with custom CSS design system |
| **Live Backend API (Render)** | [https://order-management-system-bmr1.onrender.com](https://order-management-system-bmr1.onrender.com) | Express & Node.js RESTful API |
| **Interactive Swagger API Docs** | [https://order-management-system-bmr1.onrender.com/api-docs](https://order-management-system-bmr1.onrender.com/api-docs) | OpenAPI 3.0 Interactive Documentation |
| **Postman Collection** | [`InventoryPro_Postman_Collection.json`](./InventoryPro_Postman_Collection.json) | Ready-to-import Postman collection |

---

## 🔑 Demo Login Credentials

You can use the following pre-configured administrative credentials to log into the live dashboard:

- **Email:** `admin@inventorypro.com`
- **Password:** `admin123`
- **Role:** Administrator

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js (v18.3.1)
- **Routing:** React Router DOM (v6.23.1)
- **HTTP Client:** Axios (configured with base URL normalizer & interceptors)
- **Icons & UI:** Lucide React, React Hot Toast
- **Data Visualization:** Recharts
- **Styling:** Custom CSS Design System (clean dark/light glassmorphism, responsive grid layouts, micro-animations, no third-party CSS bloat)

### Backend
- **Runtime:** Node.js (v20+ / v22+) & Express.js (v4.19.2)
- **Database:** MongoDB Atlas with Mongoose ODM (v8.4.1)
- **Validation:** Express-Validator (v7.1.0)
- **Concurrency & Integrity:** MongoDB ACID Transactions & Sessions
- **API Documentation:** Swagger UI Express & OpenAPI 3.0 (`/api-docs`)
- **Security:** CORS origin whitelisting, HTTP parameter sanitization

---

## 🌟 Key Features

1. **Analytical Dashboard:**
   - Real-time revenue calculation, order volume tracking, low-stock threshold monitoring, and historical performance graphs.
2. **Product Catalog & Stock Management:**
   - Full CRUD for products, auto-categorization, SKU uniqueness validation, real-time stock levels, and search/filter/pagination.
3. **Atomic Order Processing Lifecycle:**
   - Create orders with price snapshots.
   - Atomic stock reservation & deduction using **MongoDB Transactions** upon confirmation.
   - Safe cancellation with automatic stock restoration.
4. **Customer Relationship Management (CRM):**
   - Customer profiles, contact directories, purchase history, and uniqueness validation.
5. **Interactive Swagger Documentation:**
   - Full OpenAPI 3.0 specs with live test requests directly from the browser at `/api-docs`.

---

## 🧠 Critical Business & Concurrency Logic Handled

### 1. Race Conditions & Double-Spend Stock Prevention
- **Challenge:** Two users attempting to buy the last unit in stock simultaneously.
- **Solution:** MongoDB **ACID transactions with database sessions** in `updateOrderStatus`. Stock deduction happens atomically using `$inc: { stock: -item.quantity }` conditional on `{ stock: { $gte: item.quantity } }`. If concurrent requests attempt to oversell stock, the transaction aborts and returns an `Insufficient Stock` error.

### 2. Line Item Merging
- **Challenge:** User adds the same SKU multiple times in one order draft.
- **Solution:** `createOrder` merges identical product entries into a single aggregated quantity before checking stock and persisting items.

### 3. Historical Price Snapshots
- **Challenge:** If a product price changes next month, historical orders must preserve their original purchase amount.
- **Solution:** Each line item stores a permanent snapshot of `unitPrice`, `productName`, and `productSku` at order creation time. Total order amount is frozen and immutable.

### 4. Product Deletion Integrity
- **Challenge:** Deleting a product could corrupt existing historical orders.
- **Solution:** Because orders store item snapshots, products can safely be archived or deleted without breaking past order receipts.

### 5. Order State Machine Transitions
- `pending` ➔ `confirmed` (Validates & deducts inventory)
- `pending` ➔ `cancelled` (No inventory change)
- `confirmed` ➔ `cancelled` (Restores deducted inventory atomically)
- `cancelled` ➔ Cannot be edited, cancelled, or re-confirmed.

---

## 📖 API Documentation & Endpoints

Interactive Swagger UI is accessible at:  
👉 **[https://order-management-system-bmr1.onrender.com/api-docs](https://order-management-system-bmr1.onrender.com/api-docs)**

### Summary of REST Endpoints:

#### 📊 Dashboard
- `GET /api/dashboard` — Fetch analytical summary counters, revenue totals, low-stock count, and recent orders.

#### 📦 Products
- `GET /api/products` — List products (supports `search`, `category`, `status`, `page`, `limit`).
- `GET /api/products/categories` — Get distinct category list.
- `GET /api/products/:id` — Retrieve product details.
- `POST /api/products` — Create product (Validates unique SKU).
- `PUT /api/products/:id` — Update product details.
- `DELETE /api/products/:id` — Delete product.

#### 🛒 Orders
- `GET /api/orders` — List orders (supports `status`, `page`, `limit`).
- `GET /api/orders/:id` — Get single order with populated customer data.
- `POST /api/orders` — Create order (merges duplicate items & creates price snapshots).
- `PATCH /api/orders/:id/status` — Transition status (`pending`, `confirmed`, `cancelled`) with atomic transaction.
- `DELETE /api/orders/:id` — Delete pending or cancelled order.

#### 👥 Customers
- `GET /api/customers` — List customers (supports `search`, `page`, `limit`).
- `GET /api/customers/:id` — Get single customer profile.
- `POST /api/customers` — Create customer (Validates unique email).
- `PUT /api/customers/:id` — Update customer profile.
- `DELETE /api/customers/:id` — Delete customer.

---

## 💻 Local Development Setup

### Prerequisites
- Node.js >= 18.x
- MongoDB (local instance or MongoDB Atlas URI)

### 1. Clone & Install
```bash
git clone https://github.com/archeedoshi12/Order-Management-System.git
cd Order-Management-System
npm run install-all
```

### 2. Configure Environment Variables

**Backend (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/inventory_db?retryWrites=true&w=majority
CLIENT_URL=http://localhost:3000
```

**Frontend (`client/.env`):**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Run Locally
```bash
# Run both backend and frontend concurrently
npm run dev

# Or run separately:
npm run server  # http://localhost:5000
npm run client  # http://localhost:3000
```

---

## 📁 Repository Structure

```
├── client/                     # React Single Page Application
│   ├── public/                 # HTML shell and public assets
│   ├── src/
│   │   ├── components/         # Reusable UI components & layouts
│   │   ├── context/            # AuthContext & global state
│   │   ├── pages/              # Dashboard, Products, Orders, Customers, Login
│   │   ├── services/api.js     # Axios client with base URL normalizer
│   │   ├── styles/             # Modular CSS design system
│   │   └── App.js              # Routing and navigation
│   ├── package.json
│   └── vercel.json             # SPA routing rewrites for Vercel
├── server/                     # Express & Node.js REST API
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── swaggerDoc.js       # OpenAPI 3.0 specification definition
│   ├── controllers/            # Request handlers for Products, Orders, Customers, Dashboard
│   ├── middleware/             # Error handlers & validation middleware
│   ├── models/                 # Mongoose schemas (Product, Customer, Order)
│   ├── routes/                 # Express API routes
│   ├── index.js                # Server entry point with Swagger UI
│   └── package.json
├── InventoryPro_Postman_Collection.json # Postman API collection
├── package.json
└── README.md
```

---

## 📄 License
This project is licensed under the MIT License.
