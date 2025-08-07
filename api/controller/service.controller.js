const Services = require("../../model/services");
const slugify = require("slugify");
async function getAllService(req, res, next) {
  try {
    const { keyword = "", page = 1, category, priceRange } = req.query;
    const limit = 9;
    const skip = (page - 1) * limit;
    const query = {};
    if (keyword.trim()) {
      query.title = { $regex: keyword, $options: "i" };
    }
    if (category) {
      query.category = category;
    }
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      query.price = { $gte: min, $lte: max };
    }
    const total = await Services.countDocuments(query);
    const services = await Services.find(query)
      .populate("inclusions")
      .sort({ isFeatured: -1 })
      .skip(skip)
      .limit(limit);
    if (services.length <= 0) {
      return res.status(404).json({
        message: `Không có dịch vụ`,
      });
    }
    return res.status(200).json({
      message: `Tìm thấy ${services.length} dịch vụ trên trang ${page}`,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      data: services,
    });
  } catch (error) {
    next(error);
  }
}
async function getOneService(req, res, next) {
  try {
    const { id } = req.params;
    const service = await Services.findById(id).populate("inclusions");
    if (!service) {
      return res.status(404).json({
        message: "Không tìm thấy dịch vụ",
      });
    }

    return res.status(200).json({
      message: "Lấy dịch vụ thành công",
      data: service,
    });
  } catch (error) {
    next(error);
  }
}
async function addService(req, res, next) {
  try {
    const {
      title,
      category,
      description,
      price,
      status,
      isFeatured,
      inclusions = [],
    } = req.body;
    if (!title || !category || !description || !price || !status) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }
    if (price < 0) {
      return res.status(400).json({ message: "Giá phải là số dương" });
    }
    const slug = slugify(title, {
      lower: true,
      strict: true,
      locale: "vi",
    });
    const findService = await Services.findOne({ title });
    if (findService) {
      return res.status(400).json({ message: "Dịch vụ đã tồn tại." });
    }
    const exist = await Services.findOne({ slug });
    if (exist) {
      return res
        .status(400)
        .json({ message: "Dịch vụ với slug này đã tồn tại." });
    }
    let inclusionArray = [];
    if (inclusions) {
      try {
        inclusionArray = JSON.parse(inclusions);
        if (!Array.isArray(inclusionArray)) {
          return res
            .status(400)
            .json({ message: "Trường inclusions phải là mảng." });
        }
      } catch (err) {
        return res
          .status(400)
          .json({ message: "Trường inclusions không hợp lệ." });
      }
    }
    const imageUrl = req.files.map((file) => file.path);
    const newService = new Services({
      title,
      slug,
      category,
      description,
      price,
      imageUrl: imageUrl,
      inclusions: inclusionArray,
      isFeatured,
      status,
    });
    await newService.save();
    return res.status(201).json({
      message: "Thêm dịch vụ thành công",
      data: newService,
    });
  } catch (error) {
    next(error);
  }
}
async function editService(req, res, next) {
  try {
    const serviceId = req.params.id;
    const { title, price, description, category, isFeatured, inclusions } =
      req.body;
    if (!title || !price || !category || !description) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }
    const service = await Services.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Dịch vụ không tồn tại" });
    }
    const slug = slugify(title, { lower: true, strict: true, locale: "vi" });

    const slugExist = await Services.findOne({ slug, _id: { $ne: serviceId } });
    if (slugExist) {
      return res
        .status(400)
        .json({ message: "Slug đã tồn tại cho dịch vụ khác" });
    }

    const titleExist = await Services.findOne({
      title,
      _id: { $ne: serviceId },
    });
    if (titleExist) {
      return res.status(400).json({ message: "Tên dịch vụ đã tồn tại" });
    }
    let imageUrl = service.imageUrl;
    if (req.files && req.files.length > 0) {
      imageUrl = req.files.map((file) => file.path);
    }
    let inclusionArray = service.inclusions;
    console.log(inclusions);
    if (inclusions) {
      try {
        const parsed = JSON.parse(inclusions);

        if (!Array.isArray(parsed)) {
          return res
            .status(400)
            .json({ message: "Trường inclusions phải là mảng." });
        }
        inclusionArray = parsed;
      } catch (err) {
        return res
          .status(400)
          .json({ message: "inclusions không hợp lệ (không parse được JSON)" });
      }
    }
    service.title = title;
    service.slug = slug;
    service.price = price;
    service.description = description;
    service.category = category;
    service.isFeatured =
      isFeatured !== undefined ? isFeatured : service.isFeatured;
    service.imageUrl = imageUrl;
    service.inclusions = inclusionArray;
    await service.save();
    return res.status(200).json({
      message: "Cập nhật dịch vụ thành công",
      data: service,
    });
  } catch (error) {
    next(error);
  }
}

async function changeStatus(req, res, next) {
  try {
    const seid = req.params.id;
    const product = await Services.findById(seid);
    if (!product) {
      return res.status(404).json({ message: "Dịch vụ không tồn tại" });
    }
    let status = "active";
    if (product.status === "active") {
      status = "inactive";
    }
    product.status = status;
    await product.save();
    return res.status(200).json({
      message: "Thay đổi trạng thái dịch vụ thành công",
    });
  } catch (error) {
    next(error);
  }
}
module.exports = {
  getAllService,
  getOneService,
  addService,
  editService,
  changeStatus,
};
