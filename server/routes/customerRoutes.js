const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const validate = require("../middleware/validate");
const { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } = require("../controllers/customerController");

const customerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").optional().trim(),
  body("address").optional().trim(),
];

router.get("/", getCustomers);
router.get("/:id", getCustomer);
router.post("/", customerValidation, validate, createCustomer);
router.put("/:id", customerValidation, validate, updateCustomer);
router.delete("/:id", deleteCustomer);

module.exports = router;
