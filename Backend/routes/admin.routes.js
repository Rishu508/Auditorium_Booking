const express = require("express");
const router = express.Router();
const isAdmin = require("../middleware/isAdmin");
const IsAuthenticated = require("../middleware/auth.middleware");
const { getAllBookings , approveBooking , rejectBooking } = require("../controllers/admin.controller");


router.get("/admin/bookings", IsAuthenticated, isAdmin, getAllBookings)

router.put("/admin/approve/:id", IsAuthenticated, isAdmin, approveBooking)

router.put("/admin/reject/:id", IsAuthenticated, isAdmin, rejectBooking) 

module.exports = router;