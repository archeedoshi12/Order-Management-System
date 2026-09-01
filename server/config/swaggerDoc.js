const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "InventoryPro & Order Management System API",
    version: "1.0.0",
    description:
      "Comprehensive RESTful API documentation for the Inventory & Order Management System (MERN Stack). Provides product catalog management, atomic order processing with stock synchronization, customer management, and analytical dashboard metrics.",
    contact: {
      name: "API Support",
      email: "support@inventorypro.com",
    },
  },
  servers: [
    {
      url: "https://order-management-system-bmr1.onrender.com",
      description: "Production Server (Render)",
    },
    {
      url: "http://localhost:5000",
      description: "Local Development Server",
    },
  ],
  tags: [
    { name: "Dashboard", description: "Analytical statistics, revenue metrics, and overview counters" },
    { name: "Products", description: "Product inventory management, categories, and stock tracking" },
    { name: "Orders", description: "Order creation, lifecycle management, stock validation, and cancellation" },
    { name: "Customers", description: "Customer profile and contact management" },
  ],
  paths: {
    "/api/dashboard": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard analytics and summary metrics",
        description: "Returns total products, total orders, total revenue, low-stock alerts, and recent order history.",
        responses: {
          200: {
            description: "Dashboard summary retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        totalProducts: { type: "integer", example: 45 },
                        totalOrders: { type: "integer", example: 120 },
                        totalRevenue: { type: "number", example: 14520.5 },
                        lowStockCount: { type: "integer", example: 3 },
                        recentOrders: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Order" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "Get paginated list of products",
        description: "Fetch products with search, category filtering, status filtering, and pagination.",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" }, description: "Search by product name, SKU, or description" },
          { name: "category", in: "query", schema: { type: "string" }, description: "Filter by product category" },
          { name: "status", in: "query", schema: { type: "string", enum: ["active", "inactive"] }, description: "Filter by status" },
          { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number" },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 }, description: "Items per page" },
        ],
        responses: {
          200: {
            description: "Products list retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "array", items: { $ref: "#/components/schemas/Product" } },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create a new product",
        description: "Adds a new product to inventory. SKU must be unique across the catalog.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Product created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Product" },
                  },
                },
              },
            },
          },
          400: { description: "Validation error" },
          409: { description: "Duplicate SKU conflict" },
        },
      },
    },
    "/api/products/categories": {
      get: {
        tags: ["Products"],
        summary: "Get distinct product categories",
        description: "Returns a list of all distinct category names currently used across products.",
        responses: {
          200: {
            description: "List of categories",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "array", items: { type: "string" }, example: ["Electronics", "Office Supplies", "Furniture"] },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get a product by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: {
            description: "Product details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Product" },
                  },
                },
              },
            },
          },
          404: { description: "Product not found" },
        },
      },
      put: {
        tags: ["Products"],
        summary: "Update an existing product",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Product updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Product" },
                  },
                },
              },
            },
          },
          400: { description: "Validation error" },
          404: { description: "Product not found" },
          409: { description: "Duplicate SKU conflict" },
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Delete a product",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: {
            description: "Product deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Product deleted successfully" },
                  },
                },
              },
            },
          },
          404: { description: "Product not found" },
        },
      },
    },
    "/api/orders": {
      get: {
        tags: ["Orders"],
        summary: "Get paginated list of orders",
        parameters: [
          { name: "status", in: "query", schema: { type: "string", enum: ["pending", "confirmed", "cancelled"] }, description: "Filter by order status" },
          { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number" },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 }, description: "Items per page" },
        ],
        responses: {
          200: {
            description: "Orders list retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "array", items: { $ref: "#/components/schemas/Order" } },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Orders"],
        summary: "Create a new order",
        description: "Creates an order with price snapshots. Stock is verified and duplicate line items are automatically merged.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OrderInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Order created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Order" },
                  },
                },
              },
            },
          },
          400: { description: "Insufficient stock or invalid input" },
        },
      },
    },
    "/api/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Get order details by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: {
            description: "Order details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Order" },
                  },
                },
              },
            },
          },
          404: { description: "Order not found" },
        },
      },
      delete: {
        tags: ["Orders"],
        summary: "Delete an order",
        description: "Allows deleting pending or cancelled orders.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: {
            description: "Order deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Order deleted successfully" },
                  },
                },
              },
            },
          },
          400: { description: "Cannot delete confirmed order" },
          404: { description: "Order not found" },
        },
      },
    },
    "/api/orders/{id}/status": {
      patch: {
        tags: ["Orders"],
        summary: "Update order status (Atomic stock deduction/restoration)",
        description:
          "Transitions order status between pending, confirmed, and cancelled. Confirming atomically deducts inventory using MongoDB transactions. Cancelling restores inventory.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["pending", "confirmed", "cancelled"], example: "confirmed" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Order status updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Order" },
                  },
                },
              },
            },
          },
          400: { description: "Invalid transition or insufficient stock" },
          404: { description: "Order not found" },
        },
      },
    },
    "/api/customers": {
      get: {
        tags: ["Customers"],
        summary: "Get paginated list of customers",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" }, description: "Search by customer name, email, or phone" },
          { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number" },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 }, description: "Items per page" },
        ],
        responses: {
          200: {
            description: "Customers list retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "array", items: { $ref: "#/components/schemas/Customer" } },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Customers"],
        summary: "Create a new customer",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CustomerInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Customer created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Customer" },
                  },
                },
              },
            },
          },
          400: { description: "Validation error" },
          409: { description: "Duplicate email conflict" },
        },
      },
    },
    "/api/customers/{id}": {
      get: {
        tags: ["Customers"],
        summary: "Get customer by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: {
            description: "Customer details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Customer" },
                  },
                },
              },
            },
          },
          404: { description: "Customer not found" },
        },
      },
      put: {
        tags: ["Customers"],
        summary: "Update customer",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CustomerInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Customer updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Customer" },
                  },
                },
              },
            },
          },
          400: { description: "Validation error" },
          404: { description: "Customer not found" },
          409: { description: "Duplicate email conflict" },
        },
      },
      delete: {
        tags: ["Customers"],
        summary: "Delete customer",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: {
            description: "Customer deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Customer deleted successfully" },
                  },
                },
              },
            },
          },
          404: { description: "Customer not found" },
        },
      },
    },
  },
  components: {
    schemas: {
      Product: {
        type: "object",
        properties: {
          _id: { type: "string", example: "6671a1b2c3d4e5f6a7b8c9d0" },
          name: { type: "string", example: "Ergonomic Office Chair" },
          sku: { type: "string", example: "CHR-ERG-001" },
          price: { type: "number", example: 199.99 },
          stock: { type: "integer", example: 45 },
          category: { type: "string", example: "Furniture" },
          status: { type: "string", enum: ["active", "inactive"], example: "active" },
          description: { type: "string", example: "High back mesh office chair with lumbar support" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProductInput: {
        type: "object",
        required: ["name", "sku", "price", "stock", "category"],
        properties: {
          name: { type: "string", example: "Ergonomic Office Chair" },
          sku: { type: "string", example: "CHR-ERG-001" },
          price: { type: "number", minimum: 0, example: 199.99 },
          stock: { type: "integer", minimum: 0, example: 45 },
          category: { type: "string", example: "Furniture" },
          status: { type: "string", enum: ["active", "inactive"], default: "active" },
          description: { type: "string", example: "High back mesh office chair with lumbar support" },
        },
      },
      Customer: {
        type: "object",
        properties: {
          _id: { type: "string", example: "6671a1b2c3d4e5f6a7b8c9d1" },
          name: { type: "string", example: "Jane Doe" },
          email: { type: "string", format: "email", example: "jane.doe@example.com" },
          phone: { type: "string", example: "+1 (555) 234-5678" },
          address: { type: "string", example: "456 Market St, Suite 200, San Francisco, CA" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CustomerInput: {
        type: "object",
        required: ["name", "email"],
        properties: {
          name: { type: "string", example: "Jane Doe" },
          email: { type: "string", format: "email", example: "jane.doe@example.com" },
          phone: { type: "string", example: "+1 (555) 234-5678" },
          address: { type: "string", example: "456 Market St, Suite 200, San Francisco, CA" },
        },
      },
      OrderItem: {
        type: "object",
        properties: {
          product: { type: "string", example: "6671a1b2c3d4e5f6a7b8c9d0" },
          productName: { type: "string", example: "Ergonomic Office Chair" },
          productSku: { type: "string", example: "CHR-ERG-001" },
          quantity: { type: "integer", minimum: 1, example: 2 },
          unitPrice: { type: "number", example: 199.99 },
          subtotal: { type: "number", example: 399.98 },
        },
      },
      Order: {
        type: "object",
        properties: {
          _id: { type: "string", example: "6671a1b2c3d4e5f6a7b8c9d2" },
          orderNumber: { type: "string", example: "ORD-1718712345678-892" },
          customer: {
            oneOf: [
              { type: "string" },
              { $ref: "#/components/schemas/Customer" },
            ],
          },
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/OrderItem" },
          },
          totalAmount: { type: "number", example: 399.98 },
          status: { type: "string", enum: ["pending", "confirmed", "cancelled"], example: "pending" },
          notes: { type: "string", example: "Deliver before 5 PM" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      OrderInput: {
        type: "object",
        required: ["customer", "items"],
        properties: {
          customer: { type: "string", example: "6671a1b2c3d4e5f6a7b8c9d1" },
          items: {
            type: "array",
            items: {
              type: "object",
              required: ["product", "quantity"],
              properties: {
                product: { type: "string", example: "6671a1b2c3d4e5f6a7b8c9d0" },
                quantity: { type: "integer", minimum: 1, example: 2 },
              },
            },
          },
          notes: { type: "string", example: "Deliver before 5 PM" },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          total: { type: "integer", example: 50 },
          page: { type: "integer", example: 1 },
          pages: { type: "integer", example: 5 },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
