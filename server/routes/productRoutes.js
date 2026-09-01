const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const validate = require("../middleware/validate");
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} = require("../controllers/productController");

const productValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("sku").trim().notEmpty().withMessage("SKU is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a non-negative number"),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status"),
];

router.get("/categories", getCategories);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", productValidation, validate, createProduct);
router.put("/:id", productValidation, validate, updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
