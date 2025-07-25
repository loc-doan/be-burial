const User = require("../../model/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await geneToken(email, password);
    if (!result) {
      return res.status(404).json({ message: "Email hoặc mật khẩu không chính xác" });
    }
    const { user, accessToken } = result;
    return res.status(200).json({ 
      message: "Đăng nhập thành công",
      data: { user, accessToken },
   });
  } catch (err) {
    return res.status(400).json(err);
  }
}
async function sendOTP(req, res, next) {
  try {
    const { email } = req.body;
    const findUser = await User.findOne({email});
    if(!findUser){
      return res.status(400).json({
        message: "Email not exited"
      }); 
    };
    let randomOTP = Math.floor(100000 + Math.random() * 900000).toString();
    findUser.otp = randomOTP;
    findUser.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); 
    await findUser.save();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "apexautos1110@gmail.com",
        pass: "kakwgvyrygrsujzk",
      },
    });
    const mailOptions = {
      from: '"burialManager" <apexautos1110@gmail.com>',
      to: email,
      subject: "OTP để thay đổi mật khẩu",
      text: `Mã OTP (OTP sẽ hết hạn sau 5p): ` + randomOTP,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log("Lỗi khi gửi email:", error);
      }
      console.log("Email đã được gửi:", info.response);
    });
    return res.status(200).json({ 
      message: "Gửi OTP thành công"
   });
  } catch (err) {
    next(err)
  }
}
async function verifyOTP(req, res, next) {
  try {
    const { email } = req.body;
    const { otp } = req.body;
    const user = await User.findOne({ email });
    if (!user){
      return res.status(400).json({ message: "Không tìm thấy user." });
    }
    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({ message: "Không có yêu cầu OTP nào." });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ message: "OTP không chính xác." });
    }
    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "OTP đã hết hạn." });
    }
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    return res.status(200).json({ message: "Xác minh OTP thành công." });
  } catch (error) {
    next(error);
  }
}
async function resetPassword(req, res, next) {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user){
      return res.status(400).json({ message: "Không tìm thấy user." });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();
    return res.status(200).json({ message: "Đặt lại mật khẩu thành công." });
  } catch (err) {
    next(err);
  }
}
async function geneToken(email, password) {
  const user = await User.findOne({ email });
  if (!user) return null;
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;
  const accessToken = jwt.sign(
    { id: user._id, role: user.role},
    process.env.JWT_SECRET,
    {
      expiresIn: "5h",
    }
  );
  return { user, accessToken };
}
// async function register(data) {
//   const hashedPassword = await bcrypt.hash(data.password, 10);
//   const user = await User.create({ ...data, password: hashedPassword });
//   return user;
// }
module.exports = {
  login,sendOTP,verifyOTP,resetPassword
};
