const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    image: {
      type: [String],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ['Quan tài an táng', 'Quan tài hỏa táng', 'Tiểu quách', 'Hũ tro cốt', 'Áo quan'] 
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model('Products', ProductSchema, "products");
