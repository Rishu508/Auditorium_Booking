/*************************************************
 * Booking Status Page (Cookie-based Auth)
 *************************************************/

const statusCard = document.getElementById("statusCard");
const statusBadge = document.getElementById("statusBadge");
const statusIcon = document.getElementById("statusIcon");
const statusTitle = document.getElementById("statusTitle");
const statusText = document.getElementById("statusText");
const bookingIdText = document.getElementById("bookingId");
const dateText = document.getElementById("dateText");
const timeText = document.getElementById("timeText");
const actionBtn = document.getElementById("actionBtn");



const bookingId = localStorage.getItem("lastBookingId");

if (!bookingId) {
    alert("No booking found. Please make a booking first.");
    window.location.href = "../pages/booking.html";
}


/* ================= FETCH BOOKING STATUS ================= */
async function fetchBookingStatus() {
    try {
        // Loading UI
        statusBadge.textContent = "LOADING...";
        statusIcon.textContent = "⏳";
        statusTitle.textContent = "Checking Status...";
        statusText.textContent = "Fetching booking details...";

        const res = await fetchWithAuth(
            `http://localhost:3000/api/booking/status/${bookingId}`,
            {
                method: "GET"
            }
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to fetch status");
        }

        updateBookingStatus(data.booking);

    } catch (err) {
        console.error(err);
        statusBadge.textContent = "ERROR";
        statusIcon.textContent = "⚠️";
        statusTitle.textContent = "Access Denied";
        statusText.textContent = err.message;
    }
}

/* ================= UPDATE UI ================= */
function updateBookingStatus(booking) {
    bookingIdText.textContent = booking.bookingId;
    dateText.textContent = booking.date;
    timeText.textContent = `${booking.startTime} - ${booking.endTime}`;

    statusCard.classList.remove("Confirmed", "Pending", "Failed");

    if (booking.status === "Confirmed") {
        statusCard.classList.add("Confirmed");
        statusBadge.textContent = "CONFIRMED";
        statusIcon.textContent = "✅";
        statusTitle.textContent = "Booking Confirmed";
        statusText.textContent = "Your booking is approved!";
        actionBtn.textContent = "Dashboard";
        actionBtn.href = "../landingpg.html";

    } else if (booking.status === "Pending") {
        statusCard.classList.add("Pending");
        statusBadge.textContent = "PENDING";
        statusIcon.textContent = "⏳";
        statusTitle.textContent = "Booking Pending";
        statusText.textContent = "Admin approval required.";
        actionBtn.textContent = "Refresh";
        actionBtn.onclick = () => window.location.reload();

    } else {
        statusCard.classList.add("Failed");
        statusBadge.textContent = "REJECTED";
        statusIcon.textContent = "❌";
        statusTitle.textContent = "Booking Rejected";
        statusText.textContent = "Please try again.";
        actionBtn.textContent = "Book Again";
        actionBtn.href = "../pages/booking.html";
    }
}

/* ================= ON PAGE LOAD ================= */
fetchBookingStatus();
