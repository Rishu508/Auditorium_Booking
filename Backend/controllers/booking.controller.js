const Booking = require("../models/CreateBooking.model");
const BookedDates = require("../models/BookedDates.model");
const User = require("../models/User.model");
const { BookingRequest } = require("../utils/SendMail");

const createBooking = async (req, res) => {
  try {
    const { EventName, BookingDate, StartTime, EndTime, purpose } = req.body;

    if (!BookingDate || !StartTime || !EndTime || !purpose) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    if (new Date(BookingDate).getTime() < Date.now()) {
      return res.status(400).json({
        message: "You cannot book past dates",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.Role === "admin") {
      return res.status(403).json({
        message: "Admin cannot create bookings",
      });
    }

    if (!user.isverified) {
      return res.status(403).json({
        message: "Please verify your email first",
      });
    }

    // Checking the Booking Date is already booked?
    let daterecord = await BookedDates.findOne({ BookedDate: BookingDate });

    if (daterecord) {
      const toMinutes = (timeStr) => {
        const [h, m] = timeStr.split(":").map(Number);
        return h * 60 + m;
      };

      const BUFFER_MINUTES = 120; // 2 hours buffer

      let startMin = toMinutes(StartTime);
      let endMin = toMinutes(EndTime);

      // Handle midnight crossing for new booking
      if (endMin < startMin) {
        endMin += 1440;
      }

      if (daterecord) {
        const isOverlap = daterecord.timeslot.some((slot) => {
          let slotStart = toMinutes(slot.startTime);
          let slotEnd = toMinutes(slot.endTime);

          // Handle midnight crossing for existing booking
          if (slotEnd < slotStart) {
            slotEnd += 1440;
          }

          // 🔥 APPLY BUFFER
          const blockedEnd = slotEnd + BUFFER_MINUTES;

          /*
      Overlap rule with buffer:
      NewStart < BlockedEnd
      AND
      NewEnd > SlotStart
    */
          return startMin < blockedEnd && endMin > slotStart;
        });

        if (isOverlap) {
          return res.status(400).json({
            message:
              "This time slot is unavailable due to an existing booking buffer period",
          });
        }
      }
    }

    const newBooking = await Booking.create({
      EventName,
      BookingDate,
      StartTime,
      EndTime,
      purpose,
      UserId: user._id,
      status: "Pending", // Important
    });

    const admin = await User.findOne({ Role: "admin" });

    if (admin) {
      await BookingRequest(
        user.Firstname,
        user.Lastname,
        admin.email,
        user.email,
        BookingDate,
        `${StartTime} - ${EndTime}`,
        EventName,
        newBooking._id
      );
    }

    return res.status(201).json({
      success: true,
      message: "Booking request sent to admin for approval",
      booking: newBooking,
    });
  } catch (error) {
    console.error("Create Booking Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getbooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({
        message: "Booking ID is required",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.UserId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to view this booking",
      });
    }
    return res.status(200).json({
      success: true,
      booking: {
        bookingId: booking._id,
        eventName: booking.EventName,
        date: booking.BookingDate,
        startTime: booking.StartTime,
        endTime: booking.EndTime,
        purpose: booking.purpose,
        status: booking.status, // pending | confirmed | rejected
        createdAt: booking.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// Fetch all booked dates and time slots
const getBookedDates = async (req, res) => {
  try {
    const bookedDates = await BookedDates.find({});
    return res.status(200).json({
      success: true,
      data: bookedDates,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createBooking,
  getbooking,
  getBookedDates,
};
