require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const Customer = require("./models/Customer");
const Order = require("./models/Order");

const products = [
  { name: "MacBook Pro 14\"", sku: "APPLE-MBP14", price: 1999.99, stock: 25, category: "Laptops", status: "active", description: "Apple M3 Pro chip, 18GB RAM, 512GB SSD" },
  { name: "Dell XPS 15", sku: "DELL-XPS15", price: 1549.00, stock: 18, category: "Laptops", status: "active", description: "Intel Core i7, 16GB RAM, 512GB NVMe" },
  { name: "Sony WH-1000XM5", sku: "SONY-WH1000XM5", price: 349.99, stock: 60, category: "Audio", status: "active", description: "Industry-leading noise cancelling headphones" },
  { name: "Samsung 27\" 4K Monitor", sku: "SAM-MON27-4K", price: 499.99, stock: 30, category: "Monitors", status: "active", description: "IPS panel, 144Hz, USB-C" },
  { name: "Logitech MX Master 3S", sku: "LOGI-MXM3S", price: 99.99, stock: 80, category: "Peripherals", status: "active", description: "Advanced wireless mouse, 8K DPI" },
  { name: "Keychron K2 Keyboard", sku: "KEY-K2-RGB", price: 89.99, stock: 45, category: "Peripherals", status: "active", description: "Wireless mechanical keyboard, RGB backlight" },
  { name: "iPad Pro 12.9\"", sku: "APPLE-IPADPRO129", price: 1099.00, stock: 20, category: "Tablets", status: "active", description: "M2 chip, Liquid Retina XDR display" },
  { name: "Samsung Galaxy S24 Ultra", sku: "SAM-S24U", price: 1299.99, stock: 35, category: "Smartphones", status: "active", description: "200MP camera, S Pen, 12GB RAM" },
  { name: "Anker 65W USB-C Charger", sku: "ANK-65W-USBC", price: 35.99, stock: 120, category: "Accessories", status: "active", description: "GaN technology, 3-port fast charger" },
  { name: "WD 2TB External SSD", sku: "WD-2TB-SSD", price: 179.99, stock: 55, category: "Storage", status: "active", description: "USB 3.2 Gen 2, 1050MB/s read speed" },
  { name: "Razer DeathAdder V3", sku: "RAZ-DAV3", price: 69.99, stock: 40, category: "Peripherals", status: "active", description: "30K DPI optical sensor, ergonomic design" },
  { name: "LG 34\" UltraWide Monitor", sku: "LG-34UW-WQHD", price: 699.99, stock: 12, category: "Monitors", status: "inactive", description: "WQHD 3440x1440, 160Hz, HDR10" },
];

const customers = [
  { name: "Alice Johnson", email: "alice.johnson@email.com", phone: "+1 (555) 234-5678", address: "123 Maple Street, New York, NY 10001" },
  { name: "Bob Martinez", email: "bob.martinez@email.com", phone: "+1 (555) 345-6789", address: "456 Oak Avenue, Los Angeles, CA 90001" },
  { name: "Carol Williams", email: "carol.williams@email.com", phone: "+1 (555) 456-7890", address: "789 Pine Road, Chicago, IL 60601" },
  { name: "David Chen", email: "david.chen@email.com", phone: "+1 (555) 567-8901", address: "321 Elm Street, Houston, TX 77001" },
  { name: "Emma Davis", email: "emma.davis@email.com", phone: "+1 (555) 678-9012", address: "654 Cedar Lane, Phoenix, AZ 85001" },
  { name: "Frank Wilson", email: "frank.wilson@email.com", phone: "+1 (555) 789-0123", address: "987 Birch Blvd, Philadelphia, PA 19101" },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  await Product.deleteMany({});
  await Customer.deleteMany({});
  await Order.deleteMany({});
  console.log("Cleared existing data");

  const createdProducts = await Product.insertMany(products);
  const createdCustomers = await Customer.insertMany(customers);
  console.log(`Seeded ${createdProducts.length} products, ${createdCustomers.length} customers`);

  const p = (sku) => createdProducts.find((x) => x.sku === sku);
  const c = (email) => createdCustomers.find((x) => x.email === email);

  const orderDefs = [
    {
      customer: c("alice.johnson@email.com")._id,
      items: [
        { product: p("APPLE-MBP14")._id, quantity: 1 },
        { product: p("LOGI-MXM3S")._id, quantity: 2 },
      ],
      status: "confirmed",
      notes: "Gift wrapping requested",
    },
    {
      customer: c("bob.martinez@email.com")._id,
      items: [
        { product: p("SAM-MON27-4K")._id, quantity: 2 },
        { product: p("KEY-K2-RGB")._id, quantity: 1 },
      ],
      status: "confirmed",
      notes: "Office setup order",
    },
    {
      customer: c("carol.williams@email.com")._id,
      items: [
        { product: p("SONY-WH1000XM5")._id, quantity: 1 },
        { product: p("ANK-65W-USBC")._id, quantity: 3 },
      ],
      status: "pending",
    },
    {
      customer: c("david.chen@email.com")._id,
      items: [
        { product: p("APPLE-IPADPRO129")._id, quantity: 1 },
        { product: p("WD-2TB-SSD")._id, quantity: 2 },
      ],
      status: "confirmed",
    },
    {
      customer: c("emma.davis@email.com")._id,
      items: [
        { product: p("SAM-S24U")._id, quantity: 1 },
        { product: p("SONY-WH1000XM5")._id, quantity: 1 },
      ],
      status: "cancelled",
      notes: "Customer changed mind",
    },
    {
      customer: c("frank.wilson@email.com")._id,
      items: [
        { product: p("DELL-XPS15")._id, quantity: 1 },
        { product: p("RAZ-DAV3")._id, quantity: 1 },
        { product: p("KEY-K2-RGB")._id, quantity: 1 },
      ],
      status: "pending",
    },
  ];

  for (const def of orderDefs) {
    const productIds = def.items.map((i) => i.product);
    const prods = await Product.find({ _id: { $in: productIds } });

    const items = def.items.map((item) => {
      const prod = prods.find((p) => p._id.toString() === item.product.toString());
      return {
        product: prod._id,
        productName: prod.name,
        productSku: prod.sku,
        quantity: item.quantity,
        unitPrice: prod.price,
        subtotal: prod.price * item.quantity,
      };
    });

    const totalAmount = items.reduce((s, i) => s + i.subtotal, 0);
    const order = await Order.create({ customer: def.customer, items, totalAmount, status: def.status, notes: def.notes });

    if (def.status === "confirmed") {
      for (const item of items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      }
    }

    console.log(`Created order ${order.orderNumber} — ${def.status} — $${totalAmount.toFixed(2)}`);
  }

  console.log("\nSeed complete!");
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
