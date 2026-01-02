const form = document.querySelector("#bookingform")
const toast = document.querySelector("#toast")


function showToast(message) {
    toast.textContent = message;

    toast.classList.remove("show");
    void toast.offsetWidth; // force reflow
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3100);
}


form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const BookingDate = document.getElementById('dateInput').value;

    const today = new Date();
    const seletedDate = new Date(BookingDate)

    if (seletedDate < today) {
        showToast("You cannot select Past Date!")
        return;
    }

    let formdata = {
        EventName: document.getElementById('eventName').value,
        BookingDate,
        StartTime: document.getElementById('startTime').value,
        EndTime: document.getElementById('endTime').value,
        purpose: document.getElementById('purpose').value
    }


    try {
        // Use the new fetchWithAuth utility
        const response = await fetchWithAuth("http://localhost:3000/api/booking/create", {
            method: "POST",
            body: JSON.stringify(formdata)
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || "Booking failed");
            return;
        }

        showToast(data.message);
        localStorage.setItem("lastBookingId", data.booking._id)
        form.reset();

    } catch (err) {
        console.log(err)
        showToast("Error: " + err.message)
    }
})

