const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

// Route to submit a contact message
router.post("/submit", contactController.submitContact);

// Route to get all contact messages
router.get("/messages", contactController.getAllMessages);

module.exports = router;
