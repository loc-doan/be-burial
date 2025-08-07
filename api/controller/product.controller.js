const Product = require("../../model/products");
const slugify = require("slugify");
async function addProduct(req, res, next) {
  try {
    const { name, quantity, price, description, category, status, isFeatured } =
      req.body;
    console.log(req.body);
    if (!name || !price || !category || !quantity || !status) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }
    if (price < 0 || quantity < 0) {
      return res
        .status(400)
        .json({ message: "Giá và số lượng phải là số dương" });
    }
    const slug = slugify(name, {
      lower: true,
      strict: true,
      locale: "vi",
    });
    const findProduct = await Product.findOne({ name });
    if (findProduct) {
      return res.status(400).json({ message: "Sản phẩm đã tồn tại." });
    }
    const exist = await Product.findOne({ slug });
    if (exist) {
      return res
        .status(400)
        .json({ message: "Sản phẩm với slug này đã tồn tại." });
    }
    const images = req.files.map((file) => file.path);
    const product = new Product({
      name,
      slug,
      price,
      image: images,
      description,
      category,
      status: status,
      quantity,
      isFeatured,
    });
    await product.save();
    return res.status(201).json({
      message: "Thêm sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    next(error);
  }
}
async function editProduct(req, res, next) {
  try {
    const productId = req.params.id;
    const { name, price, quantity, description, category, isFeatured } =
      req.body;
    if (!name || !price || !category || !quantity || !category) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    let images = product.image;
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.path);
    }
    const slug = slugify(name, { lower: true, strict: true, locale: "vi" });
    const existing = await Product.findOne({ slug, _id: { $ne: productId } });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Slug này đã tồn tại cho sản phẩm khác" });
    }
    const exitName = await Product.findOne({ name, _id: { $ne: productId } });
    if (existing) {
      return res.status(400).json({ message: "Tên sản phẩm đã tồn tại" });
    }
    product.name = name || product.name;
    product.slug = slug;
    product.price = price || product.price;
    product.quantity = quantity || product.quantity;
    product.description = description || product.description;
    product.category = category || product.category;
    product.isFeatured =
      isFeatured !== undefined ? isFeatured : product.isFeatured;
    product.image = images;
    await product.save();
    return res.status(200).json({
      message: "Cập nhật sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    next(error);
  }
}
async function changeStatusProduct(req, res, next) {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    let status = "active";
    if (product.status === "active") {
      status = "inactive";
    }
    product.status = status;
    await product.save();
    return res.status(200).json({
      message: "Thay đổi trạng thái sản phẩm thành công",
    });
  } catch (error) {
    next(error);
  }
}
async function getAllPro(req, res, next) {
  try {
    const { keyword = "", page = 1, category, priceRange } = req.query;
    const limit = 9;
    const skip = (page - 1) * limit;
    const query = {
      name: { $regex: keyword, $options: "i" },
    };
    if (category) {
      query.category = category;
    }
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      query.price = { $gte: min, $lte: max };
    }
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ isFeatured: -1 })
      .skip(skip)
      .limit(limit);
    if (products.length <= 0) {
      return res.status(404).json({
        message: `Không có sản phẩm`,
      });
    }
    return res.status(200).json({
      message: `Tìm thấy ${products.length} sản phẩm trên trang ${page}`,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      data: products,
    });
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    return res.status(200).json({
      message: "Lấy sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    next(error);
  }
}
module.exports = {
  addProduct,
  editProduct,
  changeStatusProduct,
  getAllPro,
  getProductById,
};
