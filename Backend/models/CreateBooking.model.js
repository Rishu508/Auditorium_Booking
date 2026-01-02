const mongoose = require('mongoose');


const BookingSchema = new mongoose.Schema({
    UserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    EventName: {
        type: String,
        required: true
    },
    BookingDate: {
        type: String,
        required: true

    },
    StartTime: {
        type: String,
        required: true
    },
    EndTime: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Confirmed", "Pending", "Rejected"],
        default: "Pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model("Booking", BookingSchema)