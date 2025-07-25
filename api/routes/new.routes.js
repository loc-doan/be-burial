const express = require("express");
const router = express.Router();
const newController = require("../controller/new.controller");
const { authenticate, authorizePosition } = require("../middlewares/auth");
const upload = require("../../config/upload");
router.post(
  "/add",
  authenticate,
  authorizePosition("admin"),
  upload.single("image"),
  newController.addNews
); 
router.put(
  "/edit/:id",
  authenticate,
  authorizePosition("admin"),
  upload.single("image"),
  newController.editNews
);
router.patch(
  "/changeStatus/:id",
  authenticate,
  authorizePosition("admin"),
  newController.changeStatusNews
);
router.get("/", newController.getAllNews);
router.get("/:id", newController.getNewsDetail);
module.exports = router;
