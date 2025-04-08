const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise"); // Ensure this is installed
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const path = require("path");

const app = express(); // Initialize the app object here
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files
app.use('/assets', express.static(path.join(__dirname, '../src/assets')));


// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: "restaurant_db", // Ensure this matches your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Contact routes
const contactRoutes = require("./routes/contactRoutes");
app.use("/api/contact", contactRoutes);
const customerRoutes = require('./routes/customerRoutes');
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require('./routes/orderRoutes');

const staffRoutes = require('./routes/staffRoutes');

// Check database connection at startup
app.listen(PORT, async () => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute("SELECT DATABASE() AS dbName");
    connection.release();

    if (!rows || !rows[0].dbName || rows[0].dbName !== "restaurant_db") {
      console.error("❌ Connected to the wrong database! Expected 'restaurant_db'. Exiting...");
      process.exit(1);
    }

    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📂 Connected to database: ${rows[0].dbName}`);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
});

// Routes
app.use("/api/auth", authRoutes);
const menuItemRoutes = require("./routes/menuItemRoutes");
app.use("/api/menu-items", menuItemRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);

app.use('/api/staff', staffRoutes);