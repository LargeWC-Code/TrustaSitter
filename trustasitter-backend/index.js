// -----------------------------------
// Dependencies and Setup
// -----------------------------------
const express = require('express');
const app = express();
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Client } = require('pg');
const authMiddleware = require('./middleware/authMiddleware');
const cors = require('cors');
const nodemailer = require('nodemailer');

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

// Uncomment the following lines to connect to a local PostgreSQL instance
// const db = new Client({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'trustasitter',
//   password: 'Senha00!',
//   port: 5432,
// });



// Connect to PostgreSQL
db.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err.stack));

// Test database connection and table structure
const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    const result = await db.query('SELECT NOW()');
    console.log('Database connection test successful:', result.rows[0]);
    
    // Test if tables exist
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'babysitters', 'bookings', 'admins')
    `);
    console.log('Available tables:', tablesResult.rows.map(row => row.table_name));
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
    // Permite qualquer subdomínio do Azure Static Web Apps e localhost
    if (
      !origin ||
      origin.match(/^https:\/\/proud-field-07cdeb800\.2\.azurestaticapps\.net$/) ||
      origin.match(/^https:\/\/trustasitter\.azurewebsites\.net$/) ||
      origin.match(/^http:\/\/localhost:5173$/) ||
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

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'POST' && req.path === '/api/login') {
    console.log('Login request body:', { ...req.body, password: '***' });
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
  const { name, email, password, phone, region, address, children } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (name, email, password, phone, region, address, children_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, phone, region, address, children_count, created_at;
    `;
    const values = [
      name,
      email,
      hashedPassword,
      phone || null,
      region || null,
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
        region: result.rows[0].region,
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
    const query = `SELECT id, name, email, phone, region, address, children_count, created_at FROM users WHERE id = $1`;
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
  const { name, email, password, phone, region, children_count, address } = req.body;
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
      region: region || existingUser.region,
      address: address || existingUser.address,
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
        region = $5,
        children_count = $6,
        address = $7
      WHERE id = $8
      RETURNING id, name, email, phone, region, children_count, address, created_at;
    `;
    const values = [
      updates.name,
      updates.email,
      hashedPassword,
      updates.phone,
      updates.region,
      updates.children_count,
      updates.address,
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
    region,
    available_days,
    available_from,
    available_to,
    about,
    rate
  } = req.body;
  let availableDaysArray = [];
  if (Array.isArray(available_days)) {
    availableDaysArray = available_days;
  } else if (typeof available_days === "string") {
    availableDaysArray = available_days.split(",").map(day => day.trim());
  }
  try {
    if (!name || !email || !password || !region || !available_days || !available_from || !available_to || !rate) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO babysitters
      (name, email, password, phone, region, available_days, available_from, available_to, about, rate)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, name, email, region, created_at;
    `;
    const values = [
      name,
      email,
      hashedPassword,
      phone,
      region,
      availableDaysArray,
      available_from,
      available_to,
      about,
      rate
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
      SELECT id, name, email, region, phone, available_days, available_from, available_to, about, rate, created_at
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
        region,
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
    region,
    available_days,
    available_from,
    available_to,
    about,
    rate
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
      region: region || resultBabysitter.rows[0].region,
      available_days: available_days || resultBabysitter.rows[0].available_days,
      available_from: available_from || resultBabysitter.rows[0].available_from,
      available_to: available_to || resultBabysitter.rows[0].available_to,
      about: about || resultBabysitter.rows[0].about,
      rate: rate || resultBabysitter.rows[0].rate
    };
    const queryUpdate = `
      UPDATE babysitters
      SET name = $1,
          email = $2,
          phone = $3,
          region = $4,
          available_days = $5,
          available_from = $6,
          available_to = $7,
          about = $8,
          rate = $9
      WHERE id = $10
      RETURNING id, name, email, region, phone, available_days, available_from, available_to, about, rate, created_at;
    `;
    const values = [
      updates.name,
      updates.email,
      updates.phone,
      updates.region,
      updates.available_days,
      updates.available_from,
      updates.available_to,
      updates.about,
      updates.rate,
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
        region,
        rate,
        about,
        available_days,
        available_from,
        available_to,
        profile_photo,
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
    await db.query(
      "UPDATE bookings SET status = $1 WHERE id = $2",
      [status, bookingId]
    );
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
  console.log('Login attempt for email:', email);
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    console.log('Checking users table...');
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
    console.log('User not found, checking babysitters table...');
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
    res.status(201).json({
      message: 'Booking created successfully.',
      booking: result.rows[0]
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
    res.status(200).json({
      message: 'Booking status updated successfully.',
      booking: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Internal server error.' });
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
  console.log('Test login endpoint called');
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
        ORDER BY c.updated_at DESC
      `;
      params = [req.user.id];
    }
    
    const result = await db.query(query, params);
    
    res.json({
      conversations: result.rows
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
    `, [conversationId, req.user.id, req.user.role === 'user' ? 'client' : req.user.role, message]);
    
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
    await db.query(`
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
    
    res.json({
      unread_count: parseInt(result.rows[0].unread_count)
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
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
      WHERE cp.user_id = $1 AND cm.sender_id != $1 AND cm.is_read = false
    `, [req.user.id]);
    
    res.json({
      unreadCount: parseInt(result.rows[0].unread_count)
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* -----------------------------------
   Server Initialization
----------------------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Email sending endpoint
app.post('/api/send-email', authMiddleware, async (req, res) => {
  const { to, subject, message, fromName } = req.body;

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
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});
