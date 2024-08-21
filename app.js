const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const multer = require('multer');

// Load environment variables
dotenv.config();

// Validate environment variables
if (!process.env.MONGO_URI || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define the Booking schema and model
const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  artist: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
});

const Booking = mongoose.model('Booking', bookingSchema);

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Basic route for home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Booking route with email functionality
app.post('/api/bookings', async (req, res) => {
  const { name, artist, date, time } = req.body;

  if (!name || !artist || !date || !time) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check for existing bookings at the same time
    const existingBooking = await Booking.findOne({ artist, date, time });
    if (existingBooking) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    const newBooking = new Booking({ name, artist, date, time });
    await newBooking.save();

    // Send email notification to the artist
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'artist-email@example.com', // Replace with the artist's email
      subject: 'New Booking Notification',
      text: `Dear ${artist},\n\nYou have a new booking from ${name} on ${new Date(date).toLocaleDateString()} at ${time}.\n\nBest regards,\nLashesByMaryanne Team`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Error sending email' });
      }
      res.json({ message: 'Booking successful and email sent to artist' });
    });

  } catch (error) {
    console.error('Error saving booking:', error);
    res.status(500).json({ error: 'Error saving booking' });
  }
});

// Chat route with predefined responses
app.post('/api/chat', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const lowerCaseMessage = message.toLowerCase();
  let reply;

  if (lowerCaseMessage.includes('hi') || lowerCaseMessage.includes('hello')) {
    reply = 'Hello! How can we assist you today? We’re here to help with any questions you may have about our services.';
  } else if (lowerCaseMessage.includes('how can i book an appointment')) {
    reply = 'Booking an appointment is easy! You can book directly on our website or reach out to us via WhatsApp for assistance.';
  } else if (lowerCaseMessage.includes('thank you')) {
    reply = 'You’re very welcome! If you have any more questions, feel free to ask.';
  } else if (lowerCaseMessage.includes('pricing') || lowerCaseMessage.includes('cost')) {
    reply = 'Our services are competitively priced. Please visit our Pricing page for detailed information or ask us directly here!';
  } else {
    reply = 'Thank you for reaching out! For more detailed inquiries, you can call us directly at (+254707670780) or email us at support@example.com.';
  }

  res.json({ reply });
});

// Retrieve all bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    console.error('Error retrieving bookings:', error);
    res.status(500).json({ error: 'Error retrieving bookings' });
  }
});

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Handle image upload
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ message: 'Image uploaded successfully' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
