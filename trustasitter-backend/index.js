// -----------------------------------
// Dependencies and Setup
// -----------------------------------
const express = require('express');
const app = express();
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Client } = require('pg');
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required.' });
  }
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'trustasitter-super-secret-jwt-key-2024');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
};
const cors = require('cors');
const nodemailer = require('nodemailer');
const { createServer } = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');

// Create HTTP server
const server = createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Multer config for babysitter reports
const reportsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/reports'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext); }
});
const uploadReportPhoto = multer({ storage: reportsStorage });

// PostgreSQL client configuration

const db = new Client({
  host: "20.40.73.193",
  port: 5432,
  user: "postgres",
  password: "LargeWC<123456>",
  database: "postgres",
  // ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000
});

/*
const db = new Client({
  host: "10.0.0.4",
  port: 5432,
  user: "developer",
  password: "LargeWC<123456>",
  database: "postgres",
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000
});
*/

// Connect to PostgreSQL
db.connect()
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('Connection error', err.stack));

// Test database connection and table structure
const testDatabaseConnection = async () => {
  try {
    const result = await db.query('SELECT NOW()');
    
    // Test if tables exist
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'babysitters', 'bookings', 'admins')
    `);
  } catch (error) {
    console.error('Database connection test failed:', error);
  }
};

testDatabaseConnection();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: (origin, callback) => {
    // Allow any Azure Static Web Apps subdomain and localhost
    if (
      !origin ||
      origin.match(/^https:\/\/proud-field-07cdeb800\.2\.azurestaticapps\.net$/) ||
      origin.match(/^https:\/\/trustasitter\.azurewebsites\.net$/) ||
      origin.match(/^https:\/\/trustasitter-api-cwahftcwg4e5axah\.australiaeast-01\.azurewebsites\.net$/) ||
      origin.match(/^http:\/\/localhost:5173$/) ||
      origin.match(/^http:\/\/localhost:5174$/) ||
      origin.match(/^http:\/\/localhost:3000$/)
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add request logging middleware (only for errors)
app.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/api/login') {

  }
  next();
});

/* -----------------------------------
   Admin Routes
----------------------------------- */

// Admin Register
app.post("/api/admin/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await db.query("SELECT * FROM admins WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Admin with this email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO admins (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashedPassword]
    );
    res.json({ message: "Admin created successfully" });
  } catch (err) {
    console.error("Admin register error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin Login
app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM admins WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const admin = result.rows[0];
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: "admin" },
        process.env.JWT_SECRET || 'trustasitter-super-secret-jwt-key-2024',
      { expiresIn: "8h" }
    );
    res.json({
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin Summary
app.get("/api/admin/summary", async (req, res) => {
  try {
    const usersResult = await db.query("SELECT COUNT(*) FROM users");
    const usersCount = parseInt(usersResult.rows[0].count);
    const babysittersResult = await db.query("SELECT COUNT(*) FROM babysitters");
    const babysittersCount = parseInt(babysittersResult.rows[0].count);
    const bookingsResult = await db.query("SELECT COUNT(*) FROM bookings");
    const bookingsCount = parseInt(bookingsResult.rows[0].count);
    const pendingResult = await db.query(
      "SELECT COUNT(*) FROM bookings WHERE status = 'pending'"
    );
    const pendingBookings = parseInt(pendingResult.rows[0].count);
    res.json({
      usersCount,
      babysittersCount,
      bookingsCount,
      pendingBookings,
    });
  } catch (err) {
    console.error("Admin summary error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin Bookings List
app.get("/api/admin/bookings", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        b.id,
        b.date,
        b.time_start,
        b.time_end,
        b.status,
        u.name AS client_name,
        s.name AS babysitter_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN babysitters s ON b.babysitter_id = s.id
      ORDER BY b.date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Admin bookings error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin Users List
app.get("/api/admin/users", async (req, res) => {
  try {
    const usersResult = await db.query(`
      SELECT id, name, email, 'client' AS role, created_at
      FROM users
    `);
    const babysittersResult = await db.query(`
      SELECT id, name, email, 'babysitter' AS role, created_at
      FROM babysitters
    `);
    const combined = [...usersResult.rows, ...babysittersResult.rows];
    res.json(combined);
  } catch (err) {
    console.error("Admin users error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin Update Booking Status
app.put("/api/admin/bookings/:id/status", async (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;
  const allowedStatuses = ["pending", "approved", "cancelled"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }
  try {
    await db.query(
      "UPDATE bookings SET status = $1 WHERE id = $2",
      [status, bookingId]
    );
    res.json({ message: "Booking status updated successfully" });
  } catch (err) {
    console.error("Update booking status error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin Delete User
app.delete("/api/admin/users/:role/:id", async (req, res) => {
  const { role, id } = req.params;
  if (role !== "client" && role !== "babysitter") {
    return res.status(400).json({ message: "Invalid role" });
  }
  const table = role === "client" ? "users" : "babysitters";
  try {
    if (role === "client") {
      await db.query("DELETE FROM bookings WHERE user_id = $1", [id]);
    } else if (role === "babysitter") {
      await db.query("DELETE FROM bookings WHERE babysitter_id = $1", [id]);
    }
    await db.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
    res.json({ message: `${role} and related bookings deleted successfully` });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin Delete Booking
app.delete("/api/admin/bookings/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM bookings WHERE id = $1", [req.params.id]);
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* -----------------------------------
   Clients Routes
----------------------------------- */

// Client Register
app.post('/api/users/register', async (req, res) => {
  const { name, email, password, phone, address, children } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (name, email, password, phone, address, children_count)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, phone, address, children_count, created_at;
    `;
    const values = [
      name,
      email,
      hashedPassword,
      phone || null,
      address || null,
      children === "" || children === undefined ? null : parseInt(children, 10)
    ];
    const result = await db.query(query, values);
    const token = jwt.sign(
      { id: result.rows[0].id, email: result.rows[0].email, role: 'user' },
      process.env.JWT_SECRET || 'trustasitter-super-secret-jwt-key-2024',
      { expiresIn: '3h' }
    );
    res.status(201).json({
      message: 'User registered successfully.',
      token,
      role: 'user',
      user: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        email: result.rows[0].email,
        phone: result.rows[0].phone,
        address: result.rows[0].address,
        children_count: result.rows[0].children_count,
        created_at: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -----------------------------------
// Clients Routes
// -----------------------------------

// Client Login
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await db.query(query, [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'trustasitter-super-secret-jwt-key-2024',
      { expiresIn: '3h' }
    );
    res.status(200).json({
      message: 'Login successful',
      token,
      role: 'user',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Client Profile Get
app.get('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    const query = `SELECT id, name, email, phone, address, children_count, latitude, longitude, created_at FROM users WHERE id = $1`;
    const result = await db.query(query, [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Client Profile Update
app.put('/api/users/profile', authMiddleware, async (req, res) => {
  const { name, email, password, phone, children_count, address, latitude, longitude } = req.body;
  try {
    const queryUser = `SELECT * FROM users WHERE id = $1`;
    const resultUser = await db.query(queryUser, [req.user.id]);
    if (resultUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const existingUser = resultUser.rows[0];
    const updates = {
      name: name || existingUser.name,
      email: email || existingUser.email,
      phone: phone || existingUser.phone,
      address: address || existingUser.address,
      latitude: latitude !== undefined ? latitude : existingUser.latitude,
      longitude: longitude !== undefined ? longitude : existingUser.longitude,
      children_count:
      children_count === "" || children_count === undefined
        ? existingUser.children_count
        : Number.isNaN(parseInt(children_count, 10))
          ? existingUser.children_count
          : parseInt(children_count, 10)
    };
    let hashedPassword = existingUser.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    const queryUpdate = `
      UPDATE users
      SET
        name = $1,
        email = $2,
        password = $3,
        phone = $4,
        children_count = $5,
        address = $6,
        latitude = $7,
        longitude = $8
      WHERE id = $9
      RETURNING id, name, email, phone, children_count, address, latitude, longitude, created_at;
    `;
    const values = [
      updates.name,
      updates.email,
      hashedPassword,
      updates.phone,
      updates.children_count,
      updates.address,
      updates.latitude,
      updates.longitude,
      req.user.id
    ];
    const result = await db.query(queryUpdate, values);
    res.status(200).json({
      message: 'Profile updated successfully.',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Client Delete Account
app.delete('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    const bookingCheck = await db.query(
      `SELECT id FROM bookings WHERE user_id = $1`,
      [req.user.id]
    );
    if (bookingCheck.rows.length > 0) {
      return res.status(400).json({
        error: 'You must cancel all bookings before deleting your account.'
      });
    }
    const result = await db.query(
      `DELETE FROM users WHERE id = $1 RETURNING id`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ message: 'User account deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user account:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Client List All Users
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const query = `SELECT id, name, email, created_at FROM users ORDER BY id ASC`;
    const result = await db.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* -----------------------------------
   Babysitters Routes
----------------------------------- */

// Babysitter Register
app.post('/api/babysitters/register', async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    available_days,
    available_from,
    available_to,
    about,
    rate,
    latitude,
    longitude,
    address
  } = req.body;
  let availableDaysArray = [];
  if (Array.isArray(available_days)) {
    availableDaysArray = available_days;
  } else if (typeof available_days === "string") {
    availableDaysArray = available_days.split(",").map(day => day.trim());
  }
  try {
    if (!name || !email || !password || !available_days || !available_from || !available_to || !rate) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO babysitters
      (name, email, password, phone, available_days, available_from, available_to, about, rate, latitude, longitude, address)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, name, email, latitude, longitude, address, created_at;
    `;
    const values = [
      name,
      email,
      hashedPassword,
      phone,
      availableDaysArray,
      available_from,
      available_to,
      about,
      rate,
      latitude,
      longitude,
      address
    ];
    const result = await db.query(query, values);
    res.status(201).json({
      message: 'Babysitter registered successfully.',
      babysitter: result.rows[0]
    });
  } catch (error) {
    console.error('Error registering babysitter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Babysitter Login
app.post('/api/babysitters/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const query = `SELECT * FROM babysitters WHERE email = $1`;
    const result = await db.query(query, [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const babysitter = result.rows[0];
    const isMatch = await bcrypt.compare(password, babysitter.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = jwt.sign(
      { id: babysitter.id, email: babysitter.email },
      process.env.JWT_SECRET || 'trustasitter-super-secret-jwt-key-2024',
      { expiresIn: '3h' }
    );
    res.status(200).json({
      message: 'Login successful',
      token,
      role: 'babysitter',
      user: {
        id: babysitter.id,
        name: babysitter.name,
        email: babysitter.email,
        region: babysitter.region
      }
    });
  } catch (error) {
    console.error('Babysitter login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Babysitter Profile Get (Self)
app.get('/api/babysitters/profile', authMiddleware, async (req, res) => {
  try {
    const query = `
      SELECT id, name, email, phone, available_days, available_from, available_to, about, rate, latitude, longitude, address, created_at
      FROM babysitters
      WHERE id = $1
    `;
    const result = await db.query(query, [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Babysitter not found.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching babysitter profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Babysitter Profile Get by ID
app.get("/api/babysitters/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        id,
        name,
        email,
        background_check_uploaded,
        created_at,
        available_days,
        available_from,
        available_to,
        phone,
        rate,
        about,
        profile_photo
      FROM babysitters
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Babysitter not found." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching babysitter profile:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Babysitter Profile Update
app.put('/api/babysitters/profile', authMiddleware, async (req, res) => {
  const {
    name,
    email,
    phone,
    available_days,
    available_from,
    available_to,
    about,
    rate,
    latitude,
    longitude,
    address
  } = req.body;
  try {
    const queryBabysitter = `SELECT * FROM babysitters WHERE id = $1`;
    const resultBabysitter = await db.query(queryBabysitter, [req.user.id]);
    if (resultBabysitter.rows.length === 0) {
      return res.status(404).json({ error: 'Babysitter not found.' });
    }
    const updates = {
      name: name || resultBabysitter.rows[0].name,
      email: email || resultBabysitter.rows[0].email,
      phone: phone || resultBabysitter.rows[0].phone,
      available_days: available_days || resultBabysitter.rows[0].available_days,
      available_from: available_from || resultBabysitter.rows[0].available_from,
      available_to: available_to || resultBabysitter.rows[0].available_to,
      about: about || resultBabysitter.rows[0].about,
      rate: rate || resultBabysitter.rows[0].rate,
      latitude: latitude !== undefined ? latitude : resultBabysitter.rows[0].latitude,
      longitude: longitude !== undefined ? longitude : resultBabysitter.rows[0].longitude,
      address: address || resultBabysitter.rows[0].address
    };
    const queryUpdate = `
      UPDATE babysitters
      SET name = $1,
          email = $2,
          phone = $3,
          available_days = $4,
          available_from = $5,
          available_to = $6,
          about = $7,
          rate = $8,
          latitude = $9,
          longitude = $10,
          address = $11
      WHERE id = $12
      RETURNING id, name, email, phone, available_days, available_from, available_to, about, rate, latitude, longitude, address, created_at;
    `;
    const values = [
      updates.name,
      updates.email,
      updates.phone,
      updates.available_days,
      updates.available_from,
      updates.available_to,
      updates.about,
      updates.rate,
      updates.latitude,
      updates.longitude,
      updates.address,
      req.user.id
    ];
    const result = await db.query(queryUpdate, values);
    res.status(200).json({
      message: 'Babysitter profile updated successfully.',
      babysitter: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating babysitter profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Babysitter Delete Account
app.delete('/api/babysitters/profile', authMiddleware, async (req, res) => {
  try {
    const bookingCheck = await db.query(
      `SELECT id FROM bookings WHERE babysitter_id = $1`,
      [req.user.id]
    );
    if (bookingCheck.rows.length > 0) {
      return res.status(400).json({
        error: 'You must cancel all bookings before deleting your account.'
      });
    }
    const result = await db.query(
      `DELETE FROM babysitters WHERE id = $1 RETURNING id`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Babysitter not found.' });
    }
    res.status(200).json({ message: 'Babysitter account deleted successfully.' });
  } catch (error) {
    console.error('Error deleting babysitter account:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Babysitter List All
app.get('/api/babysitters', async (req, res) => {
  try {
    const query = `
      SELECT
        id,
        name,
        email,
        phone,
        rate,
        about,
        available_days,
        available_from,
        available_to,
        profile_photo,
        latitude,
        longitude,
        address,
        created_at
      FROM babysitters
      ORDER BY created_at DESC;
    `;
    const result = await db.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching babysitters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Babysitter Bookings List
app.get("/api/babysitters/:id/bookings", async (req, res) => {
  const babysitterId = req.params.id;
  try {
    const result = await db.query(
      `
      SELECT
        bookings.*,
        users.name AS parent_name,
        users.address AS client_address,
        users.phone AS client_phone,
        users.region AS client_region,
        users.children_count AS client_children
      FROM bookings
      JOIN users
        ON bookings.user_id = users.id
      WHERE bookings.babysitter_id = $1
      ORDER BY bookings.date DESC
      `,
      [babysitterId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching babysitter bookings:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Babysitter Update Booking Status
app.put("/api/babysitters/bookings/:bookingId/status", async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;
  if (!["approved", "cancelled"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  try {
    // Get booking info first
    const bookingResult = await db.query(
      "SELECT * FROM bookings WHERE id = $1",
      [bookingId]
    );
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }
    const booking = bookingResult.rows[0];

    // Update booking status
    await db.query(
      "UPDATE bookings SET status = $1 WHERE id = $2",
      [status, bookingId]
    );

    // Create notification for parent
    let notificationType = null;
    if (status === 'approved') {
      notificationType = 'booking_confirmed';
    } else if (status === 'cancelled') {
      notificationType = 'booking_cancelled';
    }

    if (notificationType) {
      try {
        await db.query(
          `INSERT INTO notifications_read (user_id, notification_type, notification_id, is_read, read_at)
           VALUES ($1, $2, $3, false, NULL)
           ON CONFLICT (user_id, notification_type, notification_id) DO NOTHING`,
          [booking.user_id, notificationType, String(booking.id)]
        );
        
        // Emit WebSocket event for parent
        if (global.io) {
          console.log('📤 Sending notification to user:', booking.user_id);
          global.io.to(`user_${booking.user_id}`).emit('notification', {
            userId: booking.user_id,
            type: notificationType,
            notificationId: String(booking.id),
            title: getNotificationTitle(notificationType),
            message: getNotificationMessage(notificationType, booking.id),
            createdAt: new Date().toISOString()
          });
          console.log('✅ Notification sent successfully');
        }
      } catch (notifyErr) {
        console.error('Error creating notification for parent:', notifyErr);
        // Only log, do not return error to user
      }
    }

    res.json({ message: "Booking status updated successfully" });
  } catch (err) {
    console.error("Error updating booking status:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* -----------------------------------
   Password Management Routes
----------------------------------- */

// Babysitter Change Password
app.put('/api/babysitters/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required.' });
    }
    const query = `SELECT * FROM babysitters WHERE id = $1`;
    const result = await db.query(query, [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Babysitter not found.' });
    }
    const babysitter = result.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, babysitter.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      `UPDATE babysitters SET password = $1 WHERE id = $2`,
      [hashedPassword, req.user.id]
    );
    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error changing password:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Change Password
app.put('/api/users/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new passwords are required.' });
    }
    const queryUser = `SELECT * FROM users WHERE id = $1`;
    const resultUser = await db.query(queryUser, [req.user.id]);
    if (resultUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const user = resultUser.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      `UPDATE users SET password = $1 WHERE id = $2`,
      [hashedPassword, req.user.id]
    );
    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* -----------------------------------
   Universal Login
----------------------------------- */

// Universal Login (User or Babysitter)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    
    const userQuery = `SELECT * FROM users WHERE email = $1`;
    const userResult = await db.query(userQuery, [email]);
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
      const token = jwt.sign(
        { id: user.id, email: user.email, role: 'user' },
        process.env.JWT_SECRET || 'trustasitter-super-secret-jwt-key-2024',
        { expiresIn: '3h' }
      );
      return res.status(200).json({
        message: 'Login successful',
        token,
        role: 'user',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at
        }
      });
    }
    
    const babysitterQuery = `SELECT * FROM babysitters WHERE email = $1`;
    const babysitterResult = await db.query(babysitterQuery, [email]);
    if (babysitterResult.rows.length > 0) {
      const babysitter = babysitterResult.rows[0];
      const isMatch = await bcrypt.compare(password, babysitter.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
      const token = jwt.sign(
        { id: babysitter.id, email: babysitter.email, role: 'babysitter' },
        process.env.JWT_SECRET || 'trustasitter-super-secret-jwt-key-2024',
        { expiresIn: '3h' }
      );
      return res.status(200).json({
        message: 'Login successful',
        token,
        role: 'babysitter',
        user: {
          id: babysitter.id,
          name: babysitter.name,
          email: babysitter.email,
          region: babysitter.region
        }
      });
    }
    return res.status(401).json({ error: 'Invalid email or password.' });
  } catch (error) {
    console.error('Universal login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});
/* -----------------------------------
   Bookings Routes
----------------------------------- */

// Create Booking
app.post('/api/bookings', async (req, res) => {
  const { user_id, babysitter_id, date, time_start, time_end } = req.body;
  try {
    const query = `
      INSERT INTO bookings (user_id, babysitter_id, date, time_start, time_end)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [user_id, babysitter_id, date, time_start, time_end];
    const result = await db.query(query, values);
    const booking = result.rows[0];

    // Create notification for babysitter
    try {
      await db.query(
        `INSERT INTO notifications_read (user_id, notification_type, notification_id, is_read, read_at)
         VALUES ($1, $2, $3, false, NULL)
         ON CONFLICT (user_id, notification_type, notification_id) DO NOTHING`,
        [babysitter_id, 'booking_created', String(booking.id)]
      );
      // Emitir evento WebSocket para o babysitter
      if (global.io) {
        global.io.to(`user_${babysitter_id}`).emit('notification', {
          userId: babysitter_id,
          type: 'booking_created',
          notificationId: String(booking.id),
          title: getNotificationTitle('booking_created'),
          message: getNotificationMessage('booking_created', booking.id),
          createdAt: new Date().toISOString()
        });
      }
    } catch (notifyErr) {
      console.error('Error creating notification for babysitter:', notifyErr);
      // Only log, do not return error to user
    }

    res.status(201).json({
      message: 'Booking created successfully.',
      booking: booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Bookings for User
app.get('/api/bookings/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const query = `
      SELECT 
        b.id, b.date, b.time_start, b.time_end, b.status,
        bs.name AS babysitter_name, bs.region
      FROM bookings b
      JOIN babysitters bs ON b.babysitter_id = bs.id
      WHERE b.user_id = $1
      ORDER BY b.date ASC;
    `;
    const result = await db.query(query, [user_id]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Bookings for Babysitter
app.get('/api/babysitters/:id/bookings', async (req, res) => {
  const babysitterId = req.params.id;
  try {
    const query = `
      SELECT 
        b.id,
        b.date,
        b.time_start,
        b.time_end,
        b.status,
        u.name AS parent_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.babysitter_id = $1
      ORDER BY b.date ASC, b.time_start ASC;
    `;
    const result = await db.query(query, [babysitterId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching babysitter bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Booking Status (Generic)
app.put('/api/bookings/:id/status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const validStatuses = ['pending', 'confirmed', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }
    const query = `
      UPDATE bookings
      SET status = $1
      WHERE id = $2
      RETURNING *;
    `;
    const values = [status, id];
    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    const booking = result.rows[0];

    // Determine who should be notified based on who is making the action
    let notificationType = null;
    let targetUserId = null;
    
    if (status === 'cancelled') {
      notificationType = 'booking_cancelled';
      // If the current user is the parent (booking.user_id), notify the babysitter
      // If the current user is the babysitter (booking.babysitter_id), notify the parent
      if (req.user.id === booking.user_id) {
        // Parent is cancelling, notify babysitter
        targetUserId = booking.babysitter_id;
      } else if (req.user.id === booking.babysitter_id) {
        // Babysitter is cancelling, notify parent
        targetUserId = booking.user_id;
      }
    } else if (status === 'confirmed') {
      notificationType = 'booking_confirmed';
      // Babysitter confirming, notify parent
      targetUserId = booking.user_id;
    } else if (status === 'rejected') {
      notificationType = 'booking_rejected';
      // Babysitter rejecting, notify parent
      targetUserId = booking.user_id;
    }

    if (notificationType && targetUserId) {
      try {
        await db.query(
          `INSERT INTO notifications_read (user_id, notification_type, notification_id, is_read, read_at)
           VALUES ($1, $2, $3, false, NULL)
           ON CONFLICT (user_id, notification_type, notification_id) DO NOTHING`,
          [targetUserId, notificationType, String(booking.id)]
        );
        // Emitir evento WebSocket para o usuário correto
        if (global.io) {
          global.io.to(`user_${targetUserId}`).emit('notification', {
            userId: targetUserId,
            type: notificationType,
            notificationId: String(booking.id),
            title: getNotificationTitle(notificationType),
            message: getNotificationMessage(notificationType, booking.id),
            createdAt: new Date().toISOString()
          });
        }
      } catch (notifyErr) {
        console.error('Error creating notification:', notifyErr);
        // Only log, do not return error to user
      }
    }

    res.status(200).json({
      message: 'Booking status updated successfully.',
      booking: booking,
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Update Booking Date/Time
app.put('/api/bookings/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { date, time_start, time_end } = req.body;
  try {
    // Get current booking info
    const bookingResult = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    const booking = bookingResult.rows[0];

    // Update booking
    const updateQuery = `
      UPDATE bookings
      SET date = $1, time_start = $2, time_end = $3
      WHERE id = $4
      RETURNING *;
    `;
    const updateValues = [date || booking.date, time_start || booking.time_start, time_end || booking.time_end, id];
    const updatedResult = await db.query(updateQuery, updateValues);
    const updatedBooking = updatedResult.rows[0];

    // Notify both users (parent and babysitter)
    const notificationType = 'booking_time_changed';
    const notificationId = String(updatedBooking.id);
    const usersToNotify = [updatedBooking.user_id, updatedBooking.babysitter_id];
    for (const userId of usersToNotify) {
      try {
        await db.query(
          `INSERT INTO notifications_read (user_id, notification_type, notification_id, is_read, read_at)
           VALUES ($1, $2, $3, false, NULL)
           ON CONFLICT (user_id, notification_type, notification_id) DO NOTHING`,
          [userId, notificationType, notificationId]
        );
      } catch (notifyErr) {
        console.error('Error creating notification for user:', userId, notifyErr);
        // Only log, do not return error to user
      }
    }

    res.status(200).json({
      message: 'Booking date/time updated successfully.',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error updating booking date/time:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/bookings/:bookingId/reports - List all reports for a booking
app.get('/api/bookings/:bookingId/reports', async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const query = `
      SELECT * FROM reports
      WHERE booking_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await db.query(query, [bookingId]);
    res.status(200).json({ reports: result.rows });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/reports - Create a new babysitter report
app.post('/api/reports', uploadReportPhoto.single('photo'), async (req, res) => {
  try {
    const { booking_id, checklist, comment } = req.body;
    const babysitter_id = req.body.babysitter_id; // Should come from token in the future
    let checklistArray = [];
    if (checklist) {
      if (Array.isArray(checklist)) {
        checklistArray = checklist;
      } else if (typeof checklist === 'string') {
        // Can come as a comma-separated string
        checklistArray = checklist.split(',').map(item => item.trim());
      }
    }
    let photo_url = null;
    if (req.file) {
      photo_url = `/uploads/reports/${req.file.filename}`;
    }
    const insertQuery = `
      INSERT INTO reports (booking_id, babysitter_id, checklist, comment, photo_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      booking_id,
      babysitter_id,
      checklistArray.length > 0 ? checklistArray : null,
      comment || null,
      photo_url
    ];
    const result = await db.query(insertQuery, values);
    const createdReport = result.rows[0];

    // Notify parent when babysitter sends a report
    try {
      // Get booking to find parent user_id
      const bookingResult = await db.query('SELECT user_id FROM bookings WHERE id = $1', [booking_id]);
      if (bookingResult.rows.length > 0) {
        const parentId = bookingResult.rows[0].user_id;
        await db.query(
          `INSERT INTO notifications_read (user_id, notification_type, notification_id, is_read, read_at)
           VALUES ($1, $2, $3, false, NULL)
           ON CONFLICT (user_id, notification_type, notification_id) DO NOTHING`,
          [parentId, 'report_sent', String(createdReport.id)]
        );
        // Emitir evento WebSocket para o pai
        if (global.io) {
          global.io.to(`user_${parentId}`).emit('notification', {
            userId: parentId,
            type: 'report_sent',
            notificationId: String(createdReport.id),
            title: getNotificationTitle('report_sent'),
            message: getNotificationMessage('report_sent', createdReport.id),
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (notifyErr) {
      console.error('Error creating notification for parent (report):', notifyErr);
      // Only log, do not return error to user
    }

    res.status(201).json({ message: 'Report created successfully', report: createdReport });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports/:id - Get a specific report by ID
app.get('/api/reports/:id', async (req, res) => {
  try {
    const reportId = req.params.id;
    const query = `
      SELECT * FROM reports
      WHERE id = $1
      LIMIT 1;
    `;
    const result = await db.query(query, [reportId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.status(200).json({ report: result.rows[0] });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* -----------------------------------
   Notifications Read Status Routes
----------------------------------- */

// Mark notification as read
app.post('/api/notifications/read', authMiddleware, async (req, res) => {
  const { notification_type, notification_id } = req.body;
  const user_id = req.user.id;

  try {
    if (!notification_type || !notification_id) {
      return res.status(400).json({ error: 'Notification type and ID are required' });
    }

    // Insert or update the read status
    const query = `
      INSERT INTO notifications_read (user_id, notification_type, notification_id, is_read, read_at)
      VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, notification_type, notification_id)
      DO UPDATE SET is_read = true, read_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const result = await db.query(query, [user_id, notification_type, notification_id]);
    
    res.status(200).json({
      message: 'Notification marked as read',
      notification: result.rows[0]
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as unread
app.post('/api/notifications/unread', authMiddleware, async (req, res) => {
  const { notification_type, notification_id } = req.body;
  const user_id = req.user.id;

  try {
    if (!notification_type || !notification_id) {
      return res.status(400).json({ error: 'Notification type and ID are required' });
    }

    // Insert or update the read status
    const query = `
      INSERT INTO notifications_read (user_id, notification_type, notification_id, is_read, read_at)
      VALUES ($1, $2, $3, false, NULL)
      ON CONFLICT (user_id, notification_type, notification_id)
      DO UPDATE SET is_read = false, read_at = NULL
      RETURNING *
    `;
    
    const result = await db.query(query, [user_id, notification_type, notification_id]);
    
    res.status(200).json({
      message: 'Notification marked as unread',
      notification: result.rows[0]
    });
  } catch (error) {
    console.error('Error marking notification as unread:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete notification for a user
app.delete('/api/notifications/:type/:id', authMiddleware, async (req, res) => {
  const user_id = req.user.id;
  const { type, id } = req.params;
  try {
    // Delete from notifications_read table
    await db.query(
      'DELETE FROM notifications_read WHERE user_id = $1 AND notification_type = $2 AND notification_id = $3',
      [user_id, type, id]
    );
    
    // Also delete from notifications_saved table if it exists there
    await db.query(
      'DELETE FROM notifications_saved WHERE user_id = $1 AND notification_type = $2 AND notification_id = $3',
      [user_id, type, id]
    );
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint DELETE /api/notifications/:type/:id já permite que qualquer usuário autenticado (cliente ou babá) delete suas próprias notificações, pois usa req.user.id para filtrar.
// Não é necessário ajuste extra, apenas garantir que ambos os papéis usam o mesmo endpoint.

// Get read status for notifications
app.get('/api/notifications/status', authMiddleware, async (req, res) => {
  const user_id = req.user.id;
  const { notification_type, notification_ids } = req.query;

  try {
    if (!notification_type || !notification_ids) {
      return res.status(400).json({ error: 'Notification type and IDs are required' });
    }

    // Parse notification_ids from query string (comma-separated)
    const ids = notification_ids.split(',').map(id => id.trim());

    // Get read status for multiple notifications
    const query = `
      SELECT notification_id, is_read, read_at
      FROM notifications_read
      WHERE user_id = $1 
      AND notification_type = $2 
      AND notification_id = ANY($3)
    `;
    
    const result = await db.query(query, [user_id, notification_type, ids]);
    
    // Create a map of notification_id to read status
    const statusMap = {};
    result.rows.forEach(row => {
      statusMap[row.notification_id] = {
        is_read: row.is_read,
        read_at: row.read_at
      };
    });

    // Add default false for notifications not in database
    ids.forEach(id => {
      if (!statusMap[id]) {
        statusMap[id] = {
          is_read: false,
          read_at: null
        };
      }
    });
    
    res.status(200).json({
      notification_status: statusMap
    });
  } catch (error) {
    console.error('Error getting notification status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all read notifications for a user
app.get('/api/notifications/read', authMiddleware, async (req, res) => {
  const user_id = req.user.id;
  const { notification_type } = req.query;

  try {
    let query = `
      SELECT notification_type, notification_id, is_read, read_at, created_at
      FROM notifications_read
      WHERE user_id = $1
    `;
    let params = [user_id];

    if (notification_type) {
      query += ` AND notification_type = $2`;
      params.push(notification_type);
    }

    query += ` ORDER BY created_at DESC`;
    
    const result = await db.query(query, params);
    
    res.status(200).json({
      notifications: result.rows
    });
  } catch (error) {
    console.error('Error getting read notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all notifications for a user (for the notification bell)
app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;
    
    const query = `
      SELECT notification_type, notification_id, is_read, read_at, created_at
      FROM notifications_read
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    
    const result = await db.query(query, [userId, limit]);
    
    // Transform the data to include human-readable information
    const notifications = result.rows.map(row => {
      const notification = {
        id: row.notification_id,
        type: row.notification_type,
        isRead: row.is_read,
        readAt: row.read_at,
        createdAt: row.created_at,
        title: getNotificationTitle(row.notification_type),
        message: getNotificationMessage(row.notification_type, row.notification_id),
        timestamp: row.created_at
      };
      return notification;
    });
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unread count for a user
app.get('/api/notifications/unread-count', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT COUNT(*) as count
      FROM notifications_read
      WHERE user_id = $1 AND is_read = false
    `;
    
    const result = await db.query(query, [userId]);
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions for notification titles and messages
function getNotificationTitle(type) {
  const titles = {
    'booking_created': 'New Booking Request',
    'booking_confirmed': 'Booking Confirmed',
    'booking_rejected': 'Booking Rejected',
    'booking_cancelled': 'Booking Cancelled',
    'report_sent': 'Report Received',
    'booking_reminder_12h': 'Booking Reminder (12h)',
    'booking_reminder_1h': 'Booking Reminder (1h)',
    'booking_time_changed': 'Booking Time Changed',
    'chat_message': 'New Message',
    'payment_confirmed': 'Payment Confirmed'
  };
  return titles[type] || 'Notification';
}

function getNotificationMessage(type, notificationId) {
  const messages = {
    'booking_created': 'You have a new booking request',
    'booking_confirmed': 'Your booking has been confirmed',
    'booking_rejected': 'Your booking has been rejected',
    'booking_cancelled': 'Your booking has been cancelled',
    'report_sent': 'You received a report from your babysitter',
    'booking_reminder_12h': 'Your booking is in 12 hours',
    'booking_reminder_1h': 'Your booking is in 1 hour',
    'booking_time_changed': 'Your booking time has been changed',
    'chat_message': 'You have a new message',
    'payment_confirmed': 'Payment has been confirmed'
  };
  return messages[type] || 'You have a new notification';
}

// Save notification
app.post('/api/notifications/save', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { notification_type, notification_id } = req.body;
    
    const query = `
      INSERT INTO notifications_saved (user_id, notification_type, notification_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, notification_type, notification_id) DO NOTHING
      RETURNING id
    `;
    
    const result = await db.query(query, [userId, notification_type, notification_id]);
    
    if (result.rows.length > 0) {
      res.json({ message: 'Notification saved successfully' });
    } else {
      res.json({ message: 'Notification already saved' });
    }
  } catch (error) {
    console.error('Error saving notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unsave notification
app.delete('/api/notifications/save', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { notification_type, notification_id } = req.body;
    
    const query = `
      DELETE FROM notifications_saved
      WHERE user_id = $1 AND notification_type = $2 AND notification_id = $3
    `;
    
    await db.query(query, [userId, notification_type, notification_id]);
    res.json({ message: 'Notification unsaved successfully' });
  } catch (error) {
    console.error('Error unsaving notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get saved notifications
app.get('/api/notifications/saved', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50 } = req.query;
    
    const query = `
      SELECT ns.notification_type, ns.notification_id, ns.saved_at,
             nr.is_read, nr.read_at, nr.created_at
      FROM notifications_saved ns
      LEFT JOIN notifications_read nr ON 
        ns.user_id = nr.user_id AND 
        ns.notification_type = nr.notification_type AND 
        ns.notification_id = nr.notification_id
      WHERE ns.user_id = $1
      ORDER BY ns.saved_at DESC
      LIMIT $2
    `;
    
    const result = await db.query(query, [userId, limit]);
    
    // Transform the data to include human-readable information
    const notifications = result.rows.map(row => {
      const notification = {
        id: row.notification_id,
        type: row.notification_type,
        isRead: row.is_read || false,
        readAt: row.read_at,
        createdAt: row.created_at,
        savedAt: row.saved_at,
        title: getNotificationTitle(row.notification_type),
        message: getNotificationMessage(row.notification_type, row.notification_id),
        timestamp: row.created_at
      };
      return notification;
    });
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching saved notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get saved count
app.get('/api/notifications/saved-count', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT COUNT(*) as count
      FROM notifications_saved
      WHERE user_id = $1
    `;
    
    const result = await db.query(query, [userId]);
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Error fetching saved count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if notification is saved
app.get('/api/notifications/saved-status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { notification_type, notification_id } = req.query;
    
    const query = `
      SELECT id FROM notifications_saved
      WHERE user_id = $1 AND notification_type = $2 AND notification_id = $3
    `;
    
    const result = await db.query(query, [userId, notification_type, notification_id]);
    res.json({ isSaved: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking saved status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* -----------------------------------
   Health Check Endpoint
----------------------------------- */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'TrustaSitter API is running'
  });
});

// Test login endpoint
app.post('/api/test-login', (req, res) => {
  
  res.json({ 
    message: 'Test login endpoint working',
    receivedData: { ...req.body, password: '***' }
  });
});

/* -----------------------------------
   Root Endpoint
----------------------------------- */
app.get('/', (req, res) => {
  res.send('TrustaSitter backend is running!');
});

/* -----------------------------------
   Chat System Routes
----------------------------------- */

// Create a new conversation
app.post('/api/chat/conversations', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'INSERT INTO chat_conversations DEFAULT VALUES RETURNING *'
    );
    res.status(201).json({
      message: 'Conversation created successfully',
      conversation: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create conversation for booking
app.post('/api/chat/bookings/:bookingId/conversation', authMiddleware, async (req, res) => {
  const { bookingId } = req.params;
  
  try {
    // Get booking details
    const bookingResult = await db.query(`
      SELECT user_id, babysitter_id, status
      FROM bookings
      WHERE id = $1
    `, [bookingId]);
    
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const booking = bookingResult.rows[0];
    
    // Check if user is authorized to access this booking
    if (req.user.role === 'user' && booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (req.user.role === 'babysitter' && booking.babysitter_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Check if conversation already exists
    const existingConversation = await db.query(`
      SELECT c.id
      FROM chat_conversations c
      JOIN chat_participants cp1 ON c.id = cp1.conversation_id
      JOIN chat_participants cp2 ON c.id = cp2.conversation_id
      WHERE cp1.user_id = $1 AND cp2.user_id = $2
    `, [booking.user_id, booking.babysitter_id]);
    
    if (existingConversation.rows.length > 0) {
      return res.status(200).json({
        message: 'Conversation already exists',
        conversation_id: existingConversation.rows[0].id
      });
    }
    
    // Create new conversation
    const conversationResult = await db.query(
      'INSERT INTO chat_conversations DEFAULT VALUES RETURNING *'
    );
    
    const conversationId = conversationResult.rows[0].id;
    
    // Add both participants
    await db.query(
      'INSERT INTO chat_participants (conversation_id, user_id, user_type) VALUES ($1, $2, $3)',
      [conversationId, booking.user_id, 'client']
    );
    
    await db.query(
      'INSERT INTO chat_participants (conversation_id, user_id, user_type) VALUES ($1, $2, $3)',
      [conversationId, booking.babysitter_id, 'babysitter']
    );
    
    res.status(201).json({
      message: 'Conversation created successfully',
      conversation_id: conversationId
    });
  } catch (error) {
    console.error('Error creating conversation for booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add participant to conversation
app.post('/api/chat/conversations/:conversationId/participants', authMiddleware, async (req, res) => {
  const { conversationId } = req.params;
  const { userId, userType } = req.body;
  
  try {
    const result = await db.query(
      'INSERT INTO chat_participants (conversation_id, user_id, user_type) VALUES ($1, $2, $3) RETURNING *',
      [conversationId, userId, userType]
    );
    res.status(201).json({
      message: 'Participant added successfully',
      participant: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's conversations with booking info
app.get('/api/chat/conversations', authMiddleware, async (req, res) => {
  try {
    // First, check if chat tables exist
    const tableCheck = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('chat_conversations', 'chat_participants', 'chat_messages')
    `);
    

    
    // Check if sender_type column exists in chat_messages table

    
    // Create tables if they don't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS chat_participants (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES chat_conversations(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL,
        user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('client', 'babysitter')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(conversation_id, user_id)
      )
    `);
    
    // Create chat_messages table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES chat_conversations(id) ON DELETE CASCADE,
        sender_id INTEGER NOT NULL,
        sender_type VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Check if sender_type column exists, if not add it
    const columnCheck = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'chat_messages' AND column_name = 'sender_type'
    `);
    
    if (columnCheck.rows.length === 0) {
      await db.query(`ALTER TABLE chat_messages ADD COLUMN sender_type VARCHAR(20) NOT NULL DEFAULT 'client'`);
    }
    
    let query;
    let params;
    
    if (req.user.role === 'user') {
      // For clients: get conversations with babysitters
      query = `
        SELECT DISTINCT 
          c.id,
          c.created_at,
          c.updated_at,
          b.id as booking_id,
          b.date as booking_date,
          b.status as booking_status,
          bs.name as participant_name,
          bs.id as participant_id,
          (SELECT COUNT(*) FROM chat_messages cm 
           WHERE cm.conversation_id = c.id 
           AND cm.sender_id != $1 
           AND cm.is_read = false) as unread_count,
          (SELECT cm.message FROM chat_messages cm 
           WHERE cm.conversation_id = c.id 
           ORDER BY cm.created_at DESC 
           LIMIT 1) as last_message
        FROM chat_conversations c
        JOIN chat_participants cp ON c.id = cp.conversation_id
        JOIN bookings b ON (b.user_id = $1 AND b.babysitter_id = cp.user_id)
        JOIN babysitters bs ON cp.user_id = bs.id
        WHERE cp.user_id != $1
        AND EXISTS (
          SELECT 1 FROM chat_participants cp2 
          WHERE cp2.conversation_id = c.id 
          AND cp2.user_id = $1
        )
        ORDER BY c.updated_at DESC
      `;
      params = [req.user.id];
    } else {
      // For babysitters: get conversations with clients
      query = `
        SELECT DISTINCT 
          c.id,
          c.created_at,
          c.updated_at,
          b.id as booking_id,
          b.date as booking_date,
          b.status as booking_status,
          u.name as participant_name,
          u.id as participant_id,
          (SELECT COUNT(*) FROM chat_messages cm 
           WHERE cm.conversation_id = c.id 
           AND cm.sender_id != $1 
           AND cm.is_read = false) as unread_count,
          (SELECT cm.message FROM chat_messages cm 
           WHERE cm.conversation_id = c.id 
           ORDER BY cm.created_at DESC 
           LIMIT 1) as last_message
        FROM chat_conversations c
        JOIN chat_participants cp ON c.id = cp.conversation_id
        JOIN bookings b ON (b.babysitter_id = $1 AND b.user_id = cp.user_id)
        JOIN users u ON cp.user_id = u.id
        WHERE cp.user_id != $1
        AND EXISTS (
          SELECT 1 FROM chat_participants cp2 
          WHERE cp2.conversation_id = c.id 
          AND cp2.user_id = $1
        )
        ORDER BY c.updated_at DESC
      `;
      params = [req.user.id];
    }
    
    const result = await db.query(query, params);
    
    console.log('Conversations query result:', result.rows);
    
    // Convert unread_count to number for each conversation
    const conversations = result.rows.map(row => ({
      ...row,
      unread_count: parseInt(row.unread_count) || 0
    }));
    
    console.log('Processed conversations:', conversations);
    
    res.json({
      conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get conversation participants
app.get('/api/chat/conversations/:conversationId/participants', authMiddleware, async (req, res) => {
  const { conversationId } = req.params;
  
  try {
    const result = await db.query(`
      SELECT user_id, user_type
      FROM chat_participants
      WHERE conversation_id = $1
    `, [conversationId]);
    
    console.log('Participants for conversation', conversationId, ':', result.rows);
    
    res.json({
      participants: result.rows
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send a message
app.post('/api/chat/conversations/:conversationId/messages', authMiddleware, async (req, res) => {
  const { conversationId } = req.params;
  const { message } = req.body;
  
  try {
    // First, check if user is participant in this conversation
    const participantCheck = await db.query(`
      SELECT * FROM chat_participants 
      WHERE conversation_id = $1 AND user_id = $2
    `, [conversationId, req.user.id]);
    
    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to send messages in this conversation' });
    }
    
    // Update conversation timestamp
    await db.query(
      'UPDATE chat_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [conversationId]
    );
    
    // Insert message
    const result = await db.query(`
      INSERT INTO chat_messages (conversation_id, sender_id, sender_type, message)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [conversationId, req.user.id, req.user.role === 'user' ? 'client' : 'babysitter', message]);
    
    res.status(201).json({
      message: 'Message sent successfully',
      chatMessage: result.rows[0]
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get conversation messages
app.get('/api/chat/conversations/:conversationId/messages', authMiddleware, async (req, res) => {
  const { conversationId } = req.params;
  
  try {
    // First, check if user is participant in this conversation
    const participantCheck = await db.query(`
      SELECT * FROM chat_participants 
      WHERE conversation_id = $1 AND user_id = $2
    `, [conversationId, req.user.id]);
    
    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to access this conversation' });
    }
    
    const result = await db.query(`
      SELECT 
        id,
        sender_id,
        sender_type,
        message,
        created_at,
        is_read
      FROM chat_messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
    `, [conversationId]);
    
    console.log('Messages for conversation', conversationId, ':', result.rows);
    
    res.json({
      messages: result.rows
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark messages as read
app.put('/api/chat/conversations/:conversationId/messages/read', authMiddleware, async (req, res) => {
  const { conversationId } = req.params;
  
  try {
    const result = await db.query(`
      UPDATE chat_messages 
      SET is_read = true 
      WHERE conversation_id = $1 AND sender_id != $2
    `, [conversationId, req.user.id]);
    
    res.json({
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Delete conversation
app.delete('/api/chat/conversations/:conversationId', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Check if user is participant in this conversation
    const participantCheck = await db.query(`
      SELECT * FROM chat_participants 
      WHERE conversation_id = $1 AND user_id = $2
    `, [conversationId, req.user.id]);
    
    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to delete this conversation' });
    }
    
    // Delete conversation (cascade will delete participants and messages)
    const result = await db.query(`
      DELETE FROM chat_conversations 
      WHERE id = $1
    `, [conversationId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json({
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Get unread message count
app.get('/api/chat/unread-count', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT COUNT(*) as unread_count
      FROM chat_messages cm
      JOIN chat_participants cp ON cm.conversation_id = cp.conversation_id
      WHERE cp.user_id = $1 
      AND cm.sender_id != $1 
      AND cm.is_read = false
    `, [req.user.id]);
    
    const unreadCount = parseInt(result.rows[0].unread_count);
    
    res.json({
      unread_count: unreadCount
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
/* -----------------------------------
   WebSocket Implementation
----------------------------------- */

// Store connected users
const connectedUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {

  // Authenticate user and join their room
  socket.on('authenticate', async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'trustasitter-super-secret-jwt-key-2024');
      const userId = decoded.id;
      
      // Store user connection
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      
      // Join user's personal room
      socket.join(`user_${userId}`);
      
      socket.emit('authenticated', { userId });
    } catch (error) {
      console.error('Socket authentication failed:', error);
      socket.emit('auth_error', { message: 'Authentication failed' });
    }
  });

  // Register user for notifications (used by NotificationBell)
  socket.on('register', async (userId) => {
    try {
      // Store user connection
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      
      // Join user's personal room
      socket.join(`user_${userId}`);
      
      console.log(`User ${userId} registered for notifications`);
    } catch (error) {
      console.error('Socket registration failed:', error);
    }
  });

  // Join conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  // Handle new message
  socket.on('send_message', async (data) => {
    try {
      const { conversationId, message, senderType } = data;
      
      console.log('WebSocket send_message:', {
        conversationId,
        message,
        senderType,
        socketUserId: socket.userId
      });
      
      // Check if user is participant in this conversation
      const participantCheck = await db.query(`
        SELECT * FROM chat_participants 
        WHERE conversation_id = $1 AND user_id = $2
      `, [conversationId, socket.userId]);
      
      console.log('Participant check result:', participantCheck.rows);
      
      if (participantCheck.rows.length === 0) {
        console.log('User not authorized to send message in conversation');
        socket.emit('message_error', { message: 'Not authorized to send messages in this conversation' });
        return;
      }
      
      // Save message to database
      const result = await db.query(`
        INSERT INTO chat_messages (conversation_id, sender_id, sender_type, message)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [conversationId, socket.userId, senderType, message]);
      
      const savedMessage = result.rows[0];
      
      // Emit message to all users in conversation
      io.to(`conversation_${conversationId}`).emit('new_message', {
        conversationId,
        message: savedMessage
      });
      
      console.log('Message emitted to conversation:', conversationId);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message_error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicator
  socket.on('typing_start', (conversationId) => {
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      conversationId,
      userId: socket.userId
    });
  });

  socket.on('typing_stop', (conversationId) => {
    socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
      conversationId,
      userId: socket.userId
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
    }
  });
});

/* -----------------------------------
   Server Initialization
----------------------------------- */

// Global io for use in routes
global.io = io;

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server is ready`);
});

// Email sending endpoint
app.post('/api/send-email', authMiddleware, async (req, res) => {
  const { to, subject, message, fromName } = req.body;

  // Log environment variables
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'MISSING');

  // Check if email configuration exists
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email configuration missing:', {
      EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'MISSING',
      EMAIL_PASS: process.env.EMAIL_PASS ? 'SET' : 'MISSING'
    });
    return res.status(500).json({ error: 'Email service not configured.' });
  }

  console.log('Attempting to send email:', { to, subject, fromName });

  // Configure transporter (Gmail SMTP)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `TrustaSitter <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: `Message from ${fromName} via TrustaSitter:\n\n${message}`,
  };

  try {
    console.log('Sending email with options:', { ...mailOptions, pass: '***' });
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', to);
    res.json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response
    });
    res.status(500).json({ 
      error: 'Failed to send email.',
      details: error.message 
    });
  }
});

// Utility: Send booking reminder notification to both users
async function sendBookingReminderNotifications(bookingId, reminderType = '12h') {
  try {
    // Get booking info
    const bookingResult = await db.query('SELECT id, user_id, babysitter_id FROM bookings WHERE id = $1', [bookingId]);
    if (bookingResult.rows.length === 0) return;
    const booking = bookingResult.rows[0];
    const usersToNotify = [booking.user_id, booking.babysitter_id];
    const notificationType = reminderType === '1h' ? 'booking_reminder_1h' : 'booking_reminder_12h';
    for (const userId of usersToNotify) {
      try {
        await db.query(
          `INSERT INTO notifications_read (user_id, notification_type, notification_id, is_read, read_at)
           VALUES ($1, $2, $3, false, NULL)
           ON CONFLICT (user_id, notification_type, notification_id) DO NOTHING`,
          [userId, notificationType, String(booking.id)]
        );
      } catch (notifyErr) {
        console.error('Error creating reminder notification for user:', userId, notifyErr);
      }
    }
  } catch (error) {
    console.error('Error sending booking reminder notifications:', error);
  }
}
