const jwt = require("jsonwebtoken");

const IsAuthenticated = (req, res, next) => {
  try {
    const token =
      req.cookies?.accesstoken


    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { _id, role, isverified }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Access token expired",
    });
  }
};

module.exports = IsAuthenticated;
