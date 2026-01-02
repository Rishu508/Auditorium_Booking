const express = require("express");
const router = express.Router();
const {
  createBooking,
  getbooking,
  getBookedDates,
} = require("../controllers/booking.controller");

const IsAuthenticated = require("../middleware/auth.middleware");

router.post("/booking/create", IsAuthenticated, createBooking); // Create a booking
router.get("/booking/status/:bookingId", IsAuthenticated, getbooking);
router.get("/booked-dates", IsAuthenticated, getBookedDates); // Get all booked dates

module.exports = router;
