const Booking = require("../models/CreateBooking.model");
const User = require("../models/User.model");
const { BookingApproved, BookingRejected } = require("../utils/SendMail");
const BookedDates = require("../models/BookedDates.model");

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate("UserId", "Firstname Lastname email");

    //  Transform bookings to match frontend expectations
    const transformedBookings = bookings.map((booking) => {
      // Handle cases where user might have been deleted
      const user = booking.UserId || {
        Firstname: "Deleted",
        Lastname: "User",
        email: "N/A",
      };

      return {
        _id: booking._id,
        user: {
          name: `${user.Firstname} ${user.Lastname}`,
          email: user.email,
        },
        EventName: booking.EventName,
        BookingDate: booking.BookingDate,
        status: booking.status,
        startTime: booking.StartTime,
        endTime: booking.EndTime,
      };
    });

    // 3️⃣ Send response
    return res.status(200).json({
      success: true,
      bookingcount: transformedBookings.length,
      bookings: transformedBookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const approveBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Validate MongoDB ObjectId
    if (!bookingId || !Booking.exists({ _id: bookingId })) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking ID" });
    }

    const booking = await Booking.findById(bookingId).populate(
      "UserId",
      "Firstname Lastname email"
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Booking already processed",
      });
    }

    // 1️⃣ Fetch booked dates for same date
    const bookedDate = await BookedDates.findOne({
      BookedDate: booking.BookingDate,
    });

    // 2️⃣ Conflict check using minutes
    if (bookedDate) {
      const bookingStart = toMinutes(booking.StartTime);
      let bookingEnd = toMinutes(booking.EndTime);
      if (bookingEnd < bookingStart) bookingEnd += 1440; // midnight crossing

      const hasConflict = bookedDate.timeslot.some((slot) => {
        let slotStart = toMinutes(slot.startTime);
        let slotEnd = toMinutes(slot.endTime);
        if (slotEnd < slotStart) slotEnd += 1440; // midnight crossing
        return bookingStart < slotEnd && bookingEnd > slotStart;
      });

      if (hasConflict) {
        return res.status(400).json({
          success: false,
          message: "Booking time conflicts with an already approved booking",
        });
      }
    }

    // 3️⃣ Approve booking
    booking.status = "Confirmed";
    await booking.save();

    // 4️⃣ Save to BookedDates
    if (bookedDate) {
      bookedDate.timeslot.push({
        startTime: booking.StartTime,
        endTime: booking.EndTime,
      });
      await bookedDate.save();
    } else {
      await BookedDates.create({
        BookedDate: booking.BookingDate,
        timeslot: [
          {
            startTime: booking.StartTime,
            endTime: booking.EndTime,
          },
        ],
      });
    }

    // 5️⃣ Send approval email only if user exists
    if (booking.UserId) {
      await BookingApproved(
        booking.UserId.Firstname,
        booking.UserId.Lastname,
        booking.UserId.email,
        booking.BookingDate,
        booking.StartTime,
        booking.EventName,
        booking._id
      );
    }

    return res.status(200).json({
      success: true,
      message: "Booking approved successfully",
    });
  } catch (error) {
    console.error("Approve booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const rejectBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId).populate(
      "UserId",
      "Firstname Lastname email"
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = "Rejected";
    await booking.save();

    await BookingRejected(
      booking.UserId.Firstname,
      booking.UserId.Lastname,
      booking.UserId.email,
      booking.BookingDate,
      booking.StartTime,
      booking.EventName,
      booking._id
    );

    return res.status(200).json({
      success: true,
      message: "Booking rejected successfully",
    });
  } catch (error) {
    console.error("Reject booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getAllBookings, approveBooking, rejectBooking };
