const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const validate = require("../middleware/validate");
const { getOrders, getOrder, createOrder, updateOrderStatus, deleteOrder } = require("../controllers/orderController");

const orderValidation = [
  body("customer").notEmpty().withMessage("Customer is required"),
  body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
  body("items.*.product").notEmpty().withMessage("Product ID is required for each item"),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

const statusValidation = [
  body("status").isIn(["pending", "confirmed", "cancelled"]).withMessage("Invalid status"),
];

router.get("/", getOrders);
router.get("/:id", getOrder);
router.post("/", orderValidation, validate, createOrder);
router.patch("/:id/status", statusValidation, validate, updateOrderStatus);
router.delete("/:id", deleteOrder);

module.exports = router;
