const mongoose = require("mongoose");
const Products = require('./products');
const FuneralPackageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Phật giáo", "Công giáo", "Hồi giáo"],
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: [String],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    inclusions: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Products',
        default: []
      },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("Services", FuneralPackageSchema, "services");
