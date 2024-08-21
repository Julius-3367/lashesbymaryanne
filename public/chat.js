document.getElementById('send-chat').addEventListener('click', () => {
  const message = document.getElementById('chat-input').value;
  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
    .then(response => response.json())
    .then(data => {
      const chatBox = document.getElementById('chat-box');
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message');
      messageDiv.innerHTML = `<p>${data.reply}</p>`; // Fixed
      chatBox.appendChild(messageDiv);
      document.getElementById('chat-input').value = '';
    });
});
