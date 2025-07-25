const jwt = require("jsonwebtoken");
const User = require("../../model/user");

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const [bearer, token] = authHeader.split(" ");
    if (bearer !== "Bearer" || !token) {
      return res.status(401).json({ message: "Invalid authorization format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User does not exist" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (["JsonWebTokenError", "TokenExpiredError"].includes(error.name)) {
      return res.status(401).json({ message: error.message });
    }
    next(error);
  }
}

function authorizePosition(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Your position not allowed" });
    }
    next();
  };
}

module.exports = { authenticate, authorizePosition };
