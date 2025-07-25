const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    summary: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

module.exports = mongoose.model('News', NewsSchema, "news");
