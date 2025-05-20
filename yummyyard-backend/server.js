const express = require("express");
const http = require('http');
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
require("dotenv").config();
const path = require("path");

// Routes
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require('./routes/customerRoutes');
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require('./routes/orderRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const staffRoutes = require('./routes/staffRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const menuItemRoutes = require("./routes/menuItemRoutes");
const availabilityRoutes = require('./routes/availabilityRoutes');

// Database initialization
const { initializeDatabase } = require('./config/initDb');

const PORT = process.env.PORT || 3000;

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for development (restrict in production)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }
});

io.on('connection', (socket) => {
  console.log('Staff dashboard connected:', socket.id);
});

// Make io accessible in routes/controllers
app.set('io', io);

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Your React frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json());

// Serve static files
app.use('/assets', express.static(path.join(__dirname, '../src/assets')));

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: "restaurant_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Attach routes
app.use("/api/auth", authRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/availability', availabilityRoutes);

// Start server and check DB connection
server.listen(PORT, async () => {
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
    
    // Initialize database tables
    await initializeDatabase();
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
});
