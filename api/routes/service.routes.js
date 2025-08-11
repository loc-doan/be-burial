const express = require("express");
const router = express.Router();
const serviceController = require("../controller/service.controller");
const { authenticate, authorizePosition } = require("../middlewares/auth");
const upload = require("../../config/upload");
router.post(
  "/add",
  authenticate,
  authorizePosition("admin"),
  upload.array("images", 5),
  serviceController.addService
);
router.put(
  "/edit/:id",
  authenticate,
  authorizePosition("admin"),
  upload.array("images", 5),
  serviceController.editService
);
router.patch(
  "/changeStatus/:id",
  authenticate,
  authorizePosition("admin"),
  serviceController.changeStatus
);
router.get("/", serviceController.getAllService);
router.get("/:id", serviceController.getOneService);
module.exports = router;
