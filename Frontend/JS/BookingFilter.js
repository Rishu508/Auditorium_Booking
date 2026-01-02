function filterBookings(bookings, searchQuery, statusFilter) {
  let filtered = [...bookings];

  // ---- Status Filter ----
  if (statusFilter !== "all") {
    filtered = filtered.filter(
      (booking) => booking.status.toLowerCase() === statusFilter.toLowerCase()
    );
  }

  // ---- Search Filter ----
  if (searchQuery.trim() !== "") {
    const query = searchQuery.toLowerCase();

    filtered = filtered.filter((booking) => {
      return (
        booking._id.toLowerCase().includes(query) ||
        booking.user.name.toLowerCase().includes(query) ||
        booking.user.email.toLowerCase().includes(query)
      );
    });
  }

  return filtered;
}
