const mongoose = require("mongoose");
const Products = require("./products");
const Services = require("./services");
const OrderSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
    productId: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Products",
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Services",
    },
    date: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Waiting", "Accept", "Deny"],
      default: "Waiting",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("Order", OrderSchema, "orders");
