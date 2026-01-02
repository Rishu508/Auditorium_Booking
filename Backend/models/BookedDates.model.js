// This is only for showing the booking dates on the calender
const mongoose = require("mongoose");


const Dates = new mongoose.Schema({
    BookedDate: {
        type: String,
        required: true
    },
    timeslot: [
        {
            startTime: { type: String, required: true },
            endTime: { type: String, required: true }
        }
    ],

}, { timestamps: true })



module.exports = mongoose.model("BookedDates", Dates)