document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/bookings')
    .then(response => response.json())
    .then(bookings => {
      const bookingsList = document.getElementById('bookings-list');
      bookings.forEach(booking => {
        const bookingItem = document.createElement('li');
        bookingItem.innerHTML = `<p>${booking.name} - ${new Date(booking.date).toLocaleDateString()} at ${booking.time}</p>
          <button class="cancel-booking" onclick="cancelBooking('${booking._id}')">Cancel</button>`; // Fixed template literal syntax
        bookingsList.appendChild(bookingItem);
      });
    });
});

function cancelBooking(id) {
  fetch(`/api/bookings/${id}`, { method: 'DELETE' }) // Fixed endpoint URL syntax
    .then(response => response.json())
    .then(result => {
      if (result.message) {
        alert(result.message);
        location.reload();
      }
    });
}
