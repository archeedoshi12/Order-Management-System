const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

const getOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: orders,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("customer", "name email phone address");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { customer, items, notes } = req.body;

    if (!items || items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Order must have at least one item" });
    }

    // Merge duplicate product entries by summing quantities
    const mergedItems = items.reduce((acc, item) => {
      const existing = acc.find((i) => i.product.toString() === item.product.toString());
      if (existing) {
        existing.quantity += Number(item.quantity);
      } else {
        acc.push({ ...item, quantity: Number(item.quantity) });
      }
      return acc;
    }, []);

    // Validate all quantities are positive integers
    for (const item of mergedItems) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: "Quantity must be a positive integer ≥ 1" });
      }
    }

    const productIds = mergedItems.map((i) => i.product);
    const products = await Product.find({ _id: { $in: productIds } }).session(session);

    if (products.length !== productIds.length) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "One or more products not found" });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of mergedItems) {
      const product = products.find((p) => p._id.toString() === item.product.toString());

      if (product.status === "inactive") {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: `Product "${product.name}" is inactive` });
      }

      // Check stock is sufficient at creation time (prevents ordering out-of-stock items)
      if (product.stock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }

      // Snapshot price at time of order — price changes later won't affect this order
      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;
      orderItems.push({
        product: product._id,
        productName: product.name,
        productSku: product.sku,
        quantity: item.quantity,
        unitPrice: product.price,   // price snapshot
        subtotal,                   // subtotal snapshot
      });
    }

    // totalAmount stored permanently — never recalculated from current prices
    const [order] = await Order.create([{ customer, items: orderItems, totalAmount, notes }], { session });
    await session.commitTransaction();

    const populated = await Order.findById(order._id).populate("customer", "name email phone");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

const updateOrderStatus = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Cannot update a cancelled order (handles "cancel again" case)
    if (order.status === "cancelled") {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Cannot update a cancelled order" });
    }

    // Cannot re-confirm an already confirmed order
    if (order.status === "confirmed" && status === "confirmed") {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Order is already confirmed" });
    }

    // Cannot revert confirmed → pending (confirmed order cannot be edited)
    if (order.status === "confirmed" && status === "pending") {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Cannot revert a confirmed order to pending" });
    }

    // Confirming a pending order: deduct stock atomically
    if (status === "confirmed" && order.status === "pending") {
      for (const item of order.items) {
        // Atomic conditional decrement — prevents race condition when two users
        // confirm simultaneously for the last available stock unit
        const updated = await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session, new: true }
        );

        if (!updated) {
          // Either product deleted or stock insufficient (race condition caught here)
          const prod = await Product.findById(item.product).session(session);
          await session.abortTransaction();
          if (!prod) {
            return res.status(404).json({ success: false, message: `Product "${item.productName}" no longer exists` });
          }
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for "${prod.name}". Available: ${prod.stock}, Requested: ${item.quantity}`,
          });
        }
      }
    }

    // Cancelling a confirmed order: restore stock
    if (status === "cancelled" && order.status === "confirmed") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } },
          { session }
        );
      }
    }

    order.status = status;
    await order.save({ session });
    await session.commitTransaction();

    const updated = await Order.findById(order._id).populate("customer", "name email phone");
    res.json({ success: true, data: updated });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.status === "confirmed") {
      return res.status(400).json({ success: false, message: "Cannot delete a confirmed order. Cancel it first." });
    }
    await order.deleteOne();
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getOrders, getOrder, createOrder, updateOrderStatus, deleteOrder };
