const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const {
  generateAccessToken,
  generateRefreshToken,
  emailverificationToken,
} = require("../utils/generateToken");
const jwt = require("jsonwebtoken");
const { PassReset, EmailVerify } = require("../utils/SendMail");
const crypto = require("crypto");

const register = async (req, res) => {
  try {
    const { Firstname, Lastname, email, password } = req.body;
    if (!Firstname || !Lastname || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }
    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = emailverificationToken(email);
    const verificationLink = `${process.env.BACKEND_URL}/api/auth/verify-email/${verificationToken}`;
    await EmailVerify(Firstname, Lastname, email, verificationLink); // Sending mail for verification

    const newUser = await User.create({
      Firstname,
      Lastname,
      email,
      password: hashedPassword,
      emailverificationtoken: verificationToken,
      emailverificationtokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 1 Day exp
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully.Please Verify your email",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please provide email" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isverified) {
      return res.status(400).json({ message: "User already verified" });
    }

    const verificationToken = emailverificationToken(user.email);
    const verificationLink = `${process.env.BACKEND_URL}/api/auth/verify-email/${verificationToken}`;

    user.emailverificationtoken = verificationToken;
    user.emailverificationtokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 1 Day exp
    await user.save();

    await EmailVerify(
      user.Firstname,
      user.Lastname,
      user.email,
      verificationLink
    );

    return res
      .status(200)
      .json({ success: true, message: "Verification email sent successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const token = req.params.token;

    if (!token) {
      return res.status(400).json("Invalid or missing token");
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.EMAIL_SECRET);
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    const user = await User.findOne({
      email: decoded.email,
      emailverificationtoken: token,
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid token or user not found" });
    }

    if (user.emailverificationtokenExpiry < Date.now()) {
      return res
        .status(400)
        .json({ message: "Verification token exp . Request a new one. " });
    }

    // Generate Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update db
    user.isverified = true;
    user.emailverificationtoken = null;
    user.emailverificationtokenExpiry = null;
    user.refreshtoken.push(refreshToken);
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie("accesstoken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.redirect(
      `${process.env.FRONTEND_URL}/Frontend/pages/EmailVerified.html`
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Login Controller
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isverified) {
      return res.status(403).json({
        message: "Please verify your email first",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Saving refresh token in the db
    user.refreshtoken.push(refreshToken);
    await user.save();

    // Send refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS in production
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie("accesstoken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        Firstname: user.Firstname,
        Lastname: user.Lastname,
        email: user.email,
        role: user.Role,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: " Internal Server Error" });
  }
};

// Refresh Token Controller

const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const user = await User.findOne({
      refreshtoken: token,
    });

    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Refresh token expired" });
      }
      // Generate new tokens
      const newaccessToken = generateAccessToken(user);
      const newrefreshToken = generateRefreshToken(user);

      user.refreshtoken = user.refreshtoken.filter((t) => t !== token);
      user.refreshtoken.push(newrefreshToken);
      await user.save();

      // Sending new refresh token as cookie
      res.cookie("refreshToken", newrefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.cookie("accesstoken", newaccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        message: "Token refreshed",
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Google Auth Controller
const googleAuth = async (req, res) => {
  try {
    const user = req.user;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.isverified = true;
    user.refreshtoken.push(refreshToken);
    await user.save();

    // Send refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accesstoken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.redirect(
      `${process.env.FRONTEND_URL}/Frontend/pages/account-created.html`
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Forgot Password controller
const forgotpass = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedtoken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedtoken;
    user.resetPasswordTokenExp = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    const reseturl = `${process.env.FRONTEND_URL}/Frontend/pages/reset-password.html?token=${resetToken}`;

    await PassReset(email, reseturl); // Password Reset Email sending

    return res.json({ message: "Reset link sent to your email" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// ResetPassword controller

const resetpassword = async (req, res) => {
  try {
    const token = req.params.token;
    const { password } = req.body;

    const hashedtoken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedtoken,
      resetPasswordTokenExp: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExp = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Logout controller
const logout = async (req, res) => {
  try {
    res.clearCookie("accesstoken");
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  register,
  login,
  refresh,
  googleAuth,
  verifyEmail,
  resendVerificationEmail,
  forgotpass,
  resetpassword,
  logout,
};
