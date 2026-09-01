const Product = require("../models/Product");
const Order = require("../models/Order");
const Customer = require("../models/Customer");

const getDashboard = async (req, res, next) => {
  try {
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      stockAgg,
      salesAgg,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Customer.countDocuments(),
      Product.aggregate([{ $group: { _id: null, total: { $sum: "$stock" } } }]),
      Order.aggregate([
        { $match: { status: "confirmed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.find()
        .populate("customer", "name email")
        .sort({ createdAt: -1 })
        .limit(5),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalStock: stockAgg[0]?.total || 0,
        totalSales: salesAgg[0]?.total || 0,
        recentOrders,
        ordersByStatus: ordersByStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
