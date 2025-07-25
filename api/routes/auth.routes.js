const express = require("express");
const router = express.Router();
const authController = require("../controller/auth.controller");

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Đăng nhập tài khoản
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: an.nguyen@example.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/forgetPassword:
 *   post:
 *     summary: Gửi OTP đến email để đặt lại mật khẩu
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: an.nguyen@example.com
 *     responses:
 *       200:
 *         description: Gửi OTP thành công
 *       400:
 *         description: Email không tồn tại
 */
router.post("/forgetPassword", authController.sendOTP);

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Xác minh OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: an.nguyen@example.com
 *               otp:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Xác minh thành công
 *       400:
 *         description: OTP không đúng hoặc hết hạn
 */
router.post("/verify", authController.verifyOTP);

/**
 * @swagger
 * /auth/resetPassword:
 *   post:
 *     summary: Đặt lại mật khẩu mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: an.nguyen@example.com
 *               newPassword:
 *                 type: string
 *                 example: newStrongPassword123!
 *     responses:
 *       200:
 *         description: Đặt lại mật khẩu thành công
 *       400:
 *         description: Lỗi hoặc OTP không hợp lệ
 */
router.post("/resetPassword", authController.resetPassword);

module.exports = router;
