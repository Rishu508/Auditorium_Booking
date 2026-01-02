// Get table body
const bookingTable = document.getElementById("bookingTable");
let allBookings = [];

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

function showToast(message) {
  const container = document.getElementById("toastContainer");

  // Create toast element
  const toast = document.createElement("div");
  toast.className = "toast show";
  toast.textContent = message;
  container.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove());
  }, 3000);
}

// Function to show bookings in table
function renderBookings(bookings) {
  // Clear old rows
  bookingTable.innerHTML = "";

  // Loop through each booking
  bookings.forEach((booking) => {
    // Create table row
    const row = document.createElement("tr");

    // ---- Date Formatting ----
    const date = new Date(booking.BookingDate);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    // Time string
    const time = `${booking.startTime} - ${booking.endTime}`;

    // Status class (pending / confirmed / cancelled)
    const statusClass = booking.status.toLowerCase();

    // Row content
    row.innerHTML = `
            <td><strong>#${booking._id.slice(-6).toUpperCase()}</strong></td>
            <td>${booking.EventName || "N/A"}</td>
            <td>${booking.user.name}</td>
            <td>${booking.user.email}</td>
            <td>
                <div>${formattedDate}</div>
                <small>${time}</small>
            </td>
            <td>
                <span class="status ${statusClass}">
                    ${booking.status}
                </span>
            </td>
            <td>
    <button 
        class="action-btn approve"
        onclick="approveBooking('${booking._id}')"
        ${booking.status !== "Pending" ? "disabled" : ""}
    >
        ✔ 
    </button>

    <button 
        class="action-btn reject"
        onclick="rejectBooking('${booking._id}')"
        ${booking.status !== "Pending" ? "disabled" : ""}
    >
        ✖
    </button>
</td>

        `;

    // Add row to table
    bookingTable.appendChild(row);
  });
}

// Fetch bookings from backend
async function fetchBookings() {
  try {
    const response = await fetchWithAuth("/admin/bookings");
    const result = await response.json();

    // Store fetched bookings in our global variable so we can filter them later
    allBookings = result.bookings;

    // Send data to render function to show them on the screen
    renderBookings(allBookings);
  } catch (error) {
    console.log("Error:", error);
  }
}

async function approveBooking(bookingId) {
  try {
    const response = await fetchWithAuth("/admin/approve/" + bookingId, {
      method: "PUT",
    });

    const result = await response.json();

    if (result.success) {
      showToast("Booking Approved Successfully");
      fetchBookings();
    }
  } catch (error) {
    console.log("Error:", error);
  }
}

async function rejectBooking(bookingId) {
  try {
    const response = await fetchWithAuth("/admin/reject/" + bookingId, {
      method: "PUT",
    });

    const result = await response.json();

    if (result.success) {
      showToast("Booking Rejected Successfully");
      fetchBookings();
    }
  } catch (error) {
    console.log("Error:", error);
  }
}

function handleFilters() {
  const searchQuery = searchInput.value;
  const statusValue = statusFilter.value;

  const filtered = filterBookings(allBookings, searchQuery, statusValue);

  renderBookings(filtered);
}

searchInput.addEventListener("input", handleFilters);
statusFilter.addEventListener("change", handleFilters);
// Call function when page loads
fetchBookings();
