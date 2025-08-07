const express = require("express");
const authRoutes = require("./auth.routes");
const productRoutes = require("./product.routes");
const orderRoutes = require("./order.routes");
const serviceRoutes = require("./service.routes");
const newRoutes = require("./new.routes");
const chatRoutes = require("./chatBot.routes");
const router = express.Router();
const { authenticate, authorizePosition } = require("../middlewares/auth");
// Health check specific to API
router.get("/hello", (req, res) => {
  res.status(200).json({ message: "API is running" });
});
router.get("/protect", authenticate, authorizePosition("admin"), (req, res) => {
  res.status(200).json({ message: "API is protect for user" });
});
// Mount routes
router.use("/auth", authRoutes);
router.use("/product", productRoutes);
router.use("/order", orderRoutes);
router.use("/service", serviceRoutes);
router.use("/news", newRoutes);
router.use("/chat", chatRoutes);
module.exports = router;
