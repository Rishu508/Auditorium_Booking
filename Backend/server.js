const express = require("express");
const app = express();
require("dotenv").config();
const ConnectDb = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const cors = require("cors");
const bookingroutes = require("./routes/booking.routes");
const cookieparser = require("cookie-parser");
const adminroutes = require("./routes/admin.routes");

// Passport config
require("./config/passport");

app.use(
  cors({
    origin: process.env.FRONTEND_URL, // your frontend URL
    credentials: true, // allow cookies
  })
);

app.use(cookieparser());
app.use(express.json());
ConnectDb();

app.use("/api", authRoutes);
app.use("/api", bookingroutes);
app.use("/api", adminroutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
