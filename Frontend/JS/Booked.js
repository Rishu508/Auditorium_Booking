/* ===============================
   ELEMENTS
=============================== */
const daysEl = document.querySelector(".days");
const monthYearEl = document.getElementById("monthYear");
const bookedSlotsBox = document.getElementById("bookedSlots");
const dateInput = document.getElementById("dateInput");
const startTime = document.getElementById("startTime");
const endTime = document.getElementById("endTime");

const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");

/* ===============================
   API & STATE
=============================== */
let bookings = {}; // Will be populated from API

async function fetchBookedDates() {
  try {
    const response = await fetchWithAuth("/booked-dates"); // Ensure this matches your route
    const data = await response.json();

    if (data.success) {
      // Transform API data to match our frontend structure: { "YYYY-MM-DD": [{start, end}] }
      bookings = {};

      data.data.forEach((item) => {
        const date = item.BookedDate; // "YYYY-MM-DD"
        if (!bookings[date]) bookings[date] = [];

        item.timeslot.forEach((slot) => {
          bookings[date].push({
            start: slot.startTime,
            end: slot.endTime,
          });
        });
      });

      renderCalendar(); // Re-render after data load
    }
  } catch (error) {
    console.error("Failed to fetch booked dates:", error);
  }
}

// Call on load
// fetchBookedDates(); // Moved to INIT section

/* ===============================
   STATE
=============================== */
let currentDate = new Date();
let selectedDate = null;

/* ===============================
   CALENDAR RENDER
=============================== */
function renderCalendar() {
  daysEl.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthYearEl.textContent = currentDate.toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    daysEl.appendChild(document.createElement("span"));
  }

  // Days
  for (let d = 1; d <= totalDays; d++) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      d
    ).padStart(2, "0")}`;
    const dayEl = document.createElement("span");
    dayEl.textContent = d;

    // Fully booked check
    if (isFullyBooked(date)) {
      dayEl.classList.add("fully-booked");
    } else {
      dayEl.addEventListener("click", () => selectDate(date, dayEl));
    }

    // Keep selected highlight when switching months
    if (date === selectedDate) {
      dayEl.classList.add("selected");
    }

    daysEl.appendChild(dayEl);
  }
}

/* ===============================
   HELPERS
=============================== */
function isFullyBooked(date) {
  if (!bookings[date]) return false;
  return bookings[date].some((b) => b.start === "08:00" && b.end === "22:00");
}

/* ===============================
   DATE SELECT
=============================== */
function selectDate(date, el) {
  // Remove existing selection
  document
    .querySelectorAll(".days span")
    .forEach((d) => d.classList.remove("selected"));

  // Add highlight to new element (if passed)
  if (el) el.classList.add("selected");

  selectedDate = date;
  dateInput.value = date;

  renderBookedSlots();
}

/* ===============================
   BOOKED SLOTS DISPLAY
=============================== */
function renderBookedSlots() {
  bookedSlotsBox.innerHTML = "";

  const title = document.createElement("div");
  title.className = "slots-title";
  title.textContent = "Booked time slots on this date";
  bookedSlotsBox.appendChild(title);

  if (!bookings[selectedDate] || bookings[selectedDate].length === 0) {
    bookedSlotsBox.innerHTML += `<span class="hint">No bookings for this date</span>`;
    return;
  }

  bookings[selectedDate].forEach((slot) => {
    const div = document.createElement("div");
    div.className = "slot";
    div.textContent = `${slot.start} – ${slot.end}`;
    bookedSlotsBox.appendChild(div);
  });
}

/* ===============================
   INIT
=============================== */
// Initialize with today's date
const today = new Date();
// Format: YYYY-MM-DD
const todayStr = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

// Set initial state
currentDate = today;
selectedDate = todayStr;
dateInput.value = todayStr;

fetchBookedDates();

/* ===============================
   MONTH NAVIGATION
=============================== */
prevBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});
