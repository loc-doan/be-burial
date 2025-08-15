const Order = require("../../model/orders");
const Services = require("../../model/services");
const Product = require("../../model/products");
const nodemailer = require("nodemailer");
async function getOrderStats(req, res, next) {
  try {
    const orders = await Order.find().populate("serviceId productId");
    let totalRevenue = 0;
    const customerEmails = new Set();
    for (const order of orders) {
      if (order.serviceId && order.serviceId.price) {
        totalRevenue += order.serviceId.price;
      }
      if (Array.isArray(order.productId)) {
        order.productId.forEach((product) => {
          if (product && product.price) {
            totalRevenue += product.price;
          }
        });
      }
      if (order.email) {
        customerEmails.add(order.email);
      }
    }
    const totalOrders = orders.length;
    const totalCustomers = customerEmails.size;
    const averageOrderValue =
      totalOrders > 0 ? Math.floor(totalRevenue / totalOrders) : 0;
    return res.status(200).json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      averageOrderValue,
    });
  } catch (error) {
    next(error);
  }
}

async function checkout(req, res, next) {
  try {
    const {
      firstName,
      lastName,
      address,
      city,
      province,
      phone,
      email,
      note,
      productId,
      serviceId,
      date,
    } = req.body;
    console.log(req.body);
    if (
      !firstName ||
      !lastName ||
      !address ||
      !city ||
      !province ||
      !phone ||
      !email
    ) {
      return res.status(400).json({
        message: "Yêu cầu nhập đủ trường",
      });
    }
    const orderData = {
      firstName,
      lastName,
      address,
      city,
      province,
      phone,
      email,
      note,
      serviceId,
      status: "Waiting",
    };
    if (Array.isArray(productId) && productId.length > 0) {
      orderData.productId = productId;
    }
    if (date !== null) {
      orderData.date = date;
    }
    const newOrder = new Order(orderData);
    const newO = await newOrder.save();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });
    const fullname = firstName + " " + lastName;
    let findService = null;
    if (serviceId !== null) {
      findService = await Services.findById(serviceId);
    }
    let productTitles = "";
    if (Array.isArray(productId) && productId.length > 0) {
      orderData.productId = productId;
      const products = await Promise.all(
        productId.map((id) => Product.findById(id))
      );
      productTitles = products
        .filter((p) => p)
        .map((p) => p.name)
        .join(", ");
    }
    let serviceRowHTML = "";
    if (serviceId && findService) {
      serviceRowHTML = `
    <tr>
      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Dịch vụ:</strong></td>
      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">${findService.title}</td>
    </tr>
  `;
    }

    let productRowHTML = "";
    if (productTitles && productTitles.trim() !== "") {
      productRowHTML = `
    <tr>
      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Sản phẩm:</strong></td>
      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">${productTitles}</td>
    </tr>
  `;
    }

    let dateRowHTML = "";
    if (date !== null) {
      dateRowHTML = `
    <tr>
      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Ngày đặt:</strong></td>
      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">${date}</td>
    </tr>
  `;
    }
    const mailOptions = {
      from: '"Thiên An Lạc"',
      to: email,
      subject: "Đơn xác nhận đặt hàng và thông tin",
      text: `
  Kính gửi ${fullname},
  
  Trân trọng,
  Hệ thống HRM
  `,
      html: `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>a</title>
        </head>
        <body style="font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
            <!-- Header -->
            <tr>
              <td style="padding: 20px; text-align: center; background-color: #007bff;">
                <h1 style="color: #ffffff; font-size: 18px; margin: 10px 0;">Đơn xác nhận đặt hàng và thông tin</h1>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding: 20px;">
                <p style="color: #333333; font-size: 14px; margin: 0 0 10px;">Kính gửi ${fullname}</p>
                <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse: collapse; background-color: #f9f9f9;">
                  <tr>
                    <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Địa chỉ:</strong></td>
                    <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">${address}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Thành phố:</strong></td>
                    <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">${city}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Tỉnh/thành:</strong></td>
                    <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">${province}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Số điện thoại:</strong></td>
                    <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">${phone}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Địa chỉ email:</strong></td>
                    <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">${email}</td>
                  </tr>
                  ${serviceRowHTML}
                  ${productRowHTML}
               
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };
    let mailOptions2;
    if (serviceId !== null) {
      const user = req.user;
      let toMail;
      let cus;
      if (!user) {
        cus = "Khách hàng";
        toMail = email;
      } else {
        cust = user.role;
        toMail = user.email;
      }
       mailOptions2 = {
        from: '"Thiên An Lạc"',
        to: toMail,
        subject: "Thông báo ngày giờ khách hàng đặt dịch vụ",
        text: `
    Kính gửi ${cus},

    Trân trọng,
    Hệ thống HRM
    `,
        html: `
          <!DOCTYPE html>
          <html lang="vi">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>a</title>
          </head>
          <body style="font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
              <!-- Header -->
              <tr>
                <td style="padding: 20px; text-align: center; background-color: #007bff;">
                  <h1 style="color: #ffffff; font-size: 18px; margin: 10px 0;">Đơn thông báo ngày giờ khách hàng đặt dịch vụ</h1>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 20px;">
                  <p style="color: #333333; font-size: 14px; margin: 0 0 10px;">Kính gửi ${cus}</p>
                  <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse: collapse; background-color: #f9f9f9;">
                    <tr>
                      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Địa chỉ:</strong></td>
                      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">${address}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Thành phố:</strong></td>
                      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">${city}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Tỉnh/thành:</strong></td>
                      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">${province}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Số điện thoại:</strong></td>
                      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">${phone}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Địa chỉ email:</strong></td>
                      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">${email}</td>
                    </tr>
                    ${serviceRowHTML}
                    ${productRowHTML}
                    ${dateRowHTML}
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      };
    }
    if (!date || date.trim() === "") {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log("Lỗi khi gửi email:", error);
        }
        console.log("Email mailOptions đã được gửi:", info.response);
      });
    } else {
      transporter.sendMail(mailOptions2, (error, info) => {
        if (error) {
          return console.log("Lỗi khi gửi email:", error);
        }
        console.log("Email mailOptions2 đã được gửi:", info.response);
      });
    }

    return res.status(200).json({
      message: "Đặt hàng thành công",
      newO,
    });
  } catch (error) {
    next(error);
  }
}
async function getAllOrder(req, res, next) {
  try {
    const { page = 1 } = req.query;
    const limit = 5;
    const skip = (page - 1) * limit;
    const total = await Order.countDocuments();
    const allOrder = await Order.find()
      .populate("productId serviceId")
      .skip(skip)
      .limit(limit);
    return res.status(200).json({
      message: `Tìm thấy ${allOrder.length} hóa đơn trên trang ${page}`,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      data: allOrder,
    });
  } catch (error) {
    next(error);
  }
}
async function getOrderDetail(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("productId serviceId");
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    return res.status(200).json(order);
  } catch (error) {
    next(error);
  }
}
async function changeStatusOrder(req, res, next) {
  try {
    const orID = req.params.id;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Vui lòng nhập trạng thái" });
    }
    const order = await Order.findById(orID);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    order.status = status;
    const newO = await order.save();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });
    const fullname = newO.firstName + " " + newO.lastName;
    let findService = null;
    if (newO.serviceId !== null) {
      findService = await Services.findById(newO.serviceId);
    }
    let productTitles = "";
    if (Array.isArray(newO.productId) && newO.productId.length > 0) {
      newO.productId = newO.productId;
      const products = await Promise.all(
        newO.productId.map((id) => Product.findById(id))
      );
      productTitles = products
        .filter((p) => p)
        .map((p) => p.name)
        .join(", ");
    }
    let serviceRowHTML = "";
    if (newO.serviceId && findService) {
      serviceRowHTML = `
    <tr>
      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Dịch vụ:</strong></td>
      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">${findService.title}</td>
    </tr>
  `;
    }

    let productRowHTML = "";
    if (productTitles && productTitles.trim() !== "") {
      productRowHTML = `
    <tr>
      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Sản phẩm:</strong></td>
      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">${productTitles}</td>
    </tr>
  `;
    }

    let dateRowHTML = "";
    if (newO.date !== null) {
      dateRowHTML = `
    <tr>
      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Ngày đặt:</strong></td>
      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">${newO.date}</td>
    </tr>
  `;
    }

    let statusRowHTML = "";
    if (status === "Accept") {
      statusRowHTML = `
    <tr>
      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Trạng thái:</strong></td>
      <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">Đã được duyệt</td>
    </tr>
  `;
    }
    if (status === "Deny") {
      statusRowHTML = `
  <tr>
    <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Trạng thái:</strong></td>
    <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">Đã bị từ chối</td>
  </tr>
`;
    }
    const mailOptions = {
      from: '"Thiên An Lạc"',
      to: newO.email,
      subject: "Thông báo về trạng thái đơn hàng",
      text: `
  Kính gửi ${fullname},
  
  Trân trọng,
  Hệ thống HRM
  `,
      html: `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>a</title>
        </head>
        <body style="font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
            <!-- Header -->
            <tr>
              <td style="padding: 20px; text-align: center; background-color: #007bff;">
                <h1 style="color: #ffffff; font-size: 18px; margin: 10px 0;">Đơn xác nhận đặt hàng và thông tin</h1>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding: 20px;">
                <p style="color: #333333; font-size: 14px; margin: 0 0 10px;">Kính gửi ${fullname}</p>
                <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse: collapse; background-color: #f9f9f9;">
                  <tr>
                    <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Địa chỉ:</strong></td>
                    <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">${newO.address}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Thành phố:</strong></td>
                    <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">${newO.city}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Tỉnh/thành:</strong></td>
                    <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">${newO.province}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Số điện thoại:</strong></td>
                    <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">${newO.phone}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;"><strong>Địa chỉ email:</strong></td>
                    <td style="font-size: 14px; color: #333333; border-bottom: 1px solid #e0e0e0;">${newO.email}</td>
                  </tr>
                  ${serviceRowHTML}
                  ${productRowHTML}
                  ${dateRowHTML}
                  ${statusRowHTML}
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log("Lỗi khi gửi email:", error);
      }
      console.log("Email đã được gửi:", info.response);
    });
    return res.status(200).json({
      message: "Thay đổi trạng thái thành công",
      data: newO,
    });
  } catch (error) {
    next(error);
  }
}
module.exports = {
  getOrderStats,
  checkout,
  getAllOrder,
  getOrderDetail,
  changeStatusOrder,
};
