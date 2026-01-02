const passport = require("passport");


//  This middleware starts Google Login
// It tells Google what data your app wants: like your profile info + email
const googleLogin  = passport.authenticate("google", { scope: ["profile", "email"] }); 



const googleCallback = passport.authenticate("google", {
    session: false,   // You are NOT using express-session
    failureRedirect: "/login",
});


module.exports = { googleLogin , googleCallback}