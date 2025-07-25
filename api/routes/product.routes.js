const express = require("express");
const router = express.Router();
const productController = require("../controller/product.controller");
const { authenticate, authorizePosition } = require("../middlewares/auth");
const upload = require("../../config/upload");
router.post(
  "/add",
  authenticate,
  authorizePosition("admin"),
  upload.array("images", 5),
  productController.addProduct
);
router.put(
  "/edit/:id",
  authenticate,
  authorizePosition("admin"),
  upload.array("images", 5),
  productController.editProduct
);
router.patch(
  "/changeStatus/:id",
  authenticate,
  authorizePosition("admin"),
  productController.changeStatusProduct
);
router.get("/", productController.getAllPro);
router.get("/:id", productController.getProductById);
module.exports = router;
