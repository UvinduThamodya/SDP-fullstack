const Contact = require('../models/contactModel');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // SMTP username
    pass: process.env.SMTP_PASS, // SMTP password
  },
});

const contactController = {
  async submitContact(req, res) {
    try {
      const { name, email, message } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Save to database
      await Contact.create({ name, email, message });

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: "yummyyard67@gmail.com", // Replace with your recipient email
        subject: "New Contact Message",
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Contact message sent successfully" });
    } catch (error) {
      console.error("Error submitting contact:", error);
      res.status(500).json({ error: "Failed to send contact message" });
    }
  },
  
  async getAllMessages(req, res) {
    try {
      const messages = await Contact.getAll();
      return res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = contactController;