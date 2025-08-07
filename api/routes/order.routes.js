const express = require("express");
const router = express.Router();
const orderController = require("../controller/order.controller");
const { authenticate, authorizePosition } = require("../middlewares/auth");

router.get(
  "/statics",
  authenticate,
  authorizePosition("admin"),
  orderController.getOrderStats
);
router.post("/checkout", orderController.checkout);
router.get(
  "/",
  authenticate,
  authorizePosition("admin"),
  orderController.getAllOrder
);
router.get(
  "/:id",
  authenticate,
  authorizePosition("admin"),
  orderController.getOrderDetail
);
router.patch(
  "/changeStatus/:id",
  authenticate,
  authorizePosition("admin"),
  orderController.changeStatusOrder
);
module.exports = router;
