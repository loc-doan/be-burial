const News = require("../../model/news");
const slugify = require("slugify");
async function getAllNews(req, res, next) {
  try {
    const { page = 1 } = req.query;
    const limit = 9;
    const skip = (page - 1) * limit;
    const filter = { status: "active" };
    const total = await News.countDocuments(filter);
    const allNew = await News.find(filter).skip(skip).limit(limit);
    return res.status(200).json({
      message: `Tìm thấy ${allNew.length} tin tức đang hoạt động trên trang ${page}`,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      data: allNew,
    });
  } catch (error) {
    next(error);
  }
}
async function getNewsDetail(req, res, next) {
  try {
    const { id } = req.params;
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({
        message: "Không tìm thấy dịch vụ",
      });
    }
    return res.status(200).json({
      message: "Lấy bài đăng thành công",
      data: news,
    });
  } catch (error) {
    next(error);
  }
}
async function addNews(req, res, next) {
  try {
    const { title, category, summary, content, tags, status } = req.body;
    console.log(req.body);
    if (!title || !category || !summary || !content || !status) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Vui lòng tải lên 1 ảnh đại diện" });
    }
    const slug = slugify(title, {
      lower: true,
      strict: true,
      locale: "vi",
    });
    const existingTitle = await News.findOne({ title });
    if (existingTitle) {
      return res.status(400).json({ message: "Bài viết đã tồn tại." });
    }
    const existingSlug = await News.findOne({ slug });
    if (existingSlug) {
      return res.status(400).json({ message: "Slug bài viết đã tồn tại." });
    }
    const imagePath = req.file.path;
    const news = new News({
      title,
      slug,
      category,
      summary,
      content,
      image: imagePath,
      status,
    });
    const ne = await news.save();
    return res.status(201).json({
      message: "Thêm bài viết thành công",
      data: ne,
    });
  } catch (error) {
    next(error);
  }
}
async function editNews(req, res, next) {
  try {
    const newsId = req.params.id;
    const { title, category, summary, content } = req.body;
    if (!title || !category || !summary || !content) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }
    const news = await News.findById(newsId);
    if (!news) {
      return res.status(404).json({ message: "Bài viết không tồn tại" });
    }
    const slug = slugify(title, { lower: true, strict: true, locale: "vi" });
    const slugExist = await News.findOne({ slug, _id: { $ne: newsId } });
    if (slugExist) {
      return res
        .status(400)
        .json({ message: "Slug đã tồn tại cho bài viết khác" });
    }
    const titleExist = await News.findOne({ title, _id: { $ne: newsId } });
    if (titleExist) {
      return res.status(400).json({ message: "Tiêu đề bài viết đã tồn tại" });
    }
    let imagePath = news.image;
    if (req.file) {
      imagePath = req.file.path;
    }
    news.title = title;
    news.slug = slug;
    news.category = category;
    news.summary = summary;
    news.content = content;
    news.image = imagePath;
    await news.save();
    return res.status(200).json({
      message: "Cập nhật bài viết thành công",
      data: news,
    });
  } catch (error) {
    next(error);
  }
}
async function changeStatusNews(req, res, next) {
  try {
    const newsId = req.params.id;
    const newz = await News.findById(newsId);
    if (!newz) {
      return res.status(404).json({ message: "Tin tức không tồn tại" });
    }
    let status = "active";
    if (newz.status === "active") {
      status = "inactive";
    }
    newz.status = status;
    await newz.save();
    return res.status(200).json({
      message: "Thay đổi trạng thái thành công",
    });
  } catch (error) {
    next(error);
  }
}
module.exports = {
  getAllNews,
  addNews,
  getNewsDetail,
  editNews,
  changeStatusNews,
};
