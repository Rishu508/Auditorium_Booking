const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.Role,
      isverified: user.isverified,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.Role,
      isverified: user.isverified,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

const emailverificationToken = (email) => {
  return jwt.sign({ email }, process.env.EMAIL_SECRET, { expiresIn: "1d" });
};

module.exports = {
  generateRefreshToken,
  generateAccessToken,
  emailverificationToken,
};
