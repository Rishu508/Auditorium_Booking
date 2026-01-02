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

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

if (process.env.FRONTEND_URL) {
  // Add production URL, stripping trailing slash if present
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(cookieparser());
app.use(express.json());
ConnectDb();

app.use("/api", authRoutes);
app.use("/api", bookingroutes);
app.use("/api", adminroutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
