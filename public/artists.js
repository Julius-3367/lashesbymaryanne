document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/artists')
    .then(response => response.json())
    .then(artists => {
      const artistList = document.getElementById('artist-list');
      artists.forEach(artist => {
        const artistCard = document.createElement('div');
        artistCard.classList.add('artist');
        artistCard.innerHTML = `<img src="${artist.image}" alt="${artist.name}">
          <h3>${artist.name}</h3>
          <button onclick="showBookings('${artist.name}')">View Bookings</button>`; // Fixed template literal syntax
        artistList.appendChild(artistCard);
      });
    });
});

function showBookings(artist) {
  fetch(`/api/bookings/${artist}`)
    .then(response => response.json())
    .then(bookings => {
      const bookingsList = document.getElementById('bookings-list');
      bookingsList.innerHTML = '';
      bookings.forEach(booking => {
        const bookingItem = document.createElement('li');
        bookingItem.innerHTML = `<p>${booking.name} - ${new Date(booking.date).toLocaleDateString()} at ${booking.time}</p>
          <button class="cancel-booking" onclick="cancelBooking('${booking._id}')">Cancel</button>`; // Fixed template literal syntax
        bookingsList.appendChild(bookingItem);
      });
    });
}

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
