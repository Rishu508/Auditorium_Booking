const express = require("express")
const router = express.Router()
const { register, login, refresh, googleAuth, verifyEmail, forgotpass, resetpassword, resendVerificationEmail } = require("../controllers/auth.controller");
const { googleLogin, googleCallback } = require("../controllers/google.Auth.controller")

router.post("/auth/register", register)
router.post("/auth/resendemail", resendVerificationEmail)
router.get("/auth/verify-email/:token", verifyEmail)
router.post("/auth/login", login)
router.post("/auth/refresh", refresh)
router.post("/auth/forgot-password", forgotpass)
router.post("/auth/reset-password/:token", resetpassword);




router.get("/auth/google", googleLogin)
// verify back to the page + generate the token (access token and refresh token )
router.get("/auth/google/callback", googleCallback, googleAuth)
module.exports = router;    