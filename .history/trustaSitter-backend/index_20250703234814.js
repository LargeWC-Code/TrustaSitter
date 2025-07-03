// Import dependencies
const express = require('express');
const app = express();
require('dotenv').config(); // Load environment variables
const bcrypt = require('bcrypt'); // For hashing passwords
const jwt = require('jsonwebtoken'); // JSON Web Token for authentication
const { Client } = require('pg'); // PostgreSQL client
const authMiddleware = require('./middleware/authMiddleware'); // Custom authentication middleware
const cors = require('cors'); // For handling CORS

// PostgreSQL client configuration
const db = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'trustasitter',
  password: 'Senha00!',
  port: 5432,
});

// Connect to PostgreSQL
db.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err.stack));

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors());

/* -----------------------------------
   Admin Routes
----------------------------------- */
/**
 * Admin Login Endpoint
 * POST /api/admin/login
 * Request Body: { email, password }
 * Response: { token, user }
 */
app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if admin with this email already exists
    const existing = await db.query("SELECT * FROM admins WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Admin with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new admin
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


/**
 * Admin Summary Endpoint
 * GET /api/admin/summary
 * Response: { usersCount, babysittersCount, bookingsCount, pendingBookings }
 */
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

/**
 * Admin Bookings Endpoint
 * GET /api/admin/bookings
 * Response: array of bookings with client and babysitter names
 */
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

/**
 * Admin Users Endpoint
 * GET /api/admin/users
 * Response: array of users and babysitters
 */
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


/* -----------------------------------
   Babysitters Routes
----------------------------------- */

// Route: Register a new babysitter
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
  // Ensure available_days is an array
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

// Route: Babysitter login with JWT
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
      process.env.JWT_SECRET,
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

// Route: Get babysitter profile (protected)
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
// Route: Get babysitter profile by ID
app.get("/api/babysitters/:id", async (req, res) => {
  const { id } = req.params;

  try {

    // Query to select all relevant fields except password
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

// Route: Update babysitter profile (protected)
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

// Route: Delete babysitter account (protected, must have no bookings)
app.delete('/api/babysitters/profile', authMiddleware, async (req, res) => {
  try {
    // Check if babysitter has related bookings
    const bookingCheck = await db.query(
      `SELECT id FROM bookings WHERE babysitter_id = $1`,
      [req.user.id]
    );

    if (bookingCheck.rows.length > 0) {
      return res.status(400).json({
        error: 'You must cancel all bookings before deleting your account.'
      });
    }

    // Delete babysitter
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

// Route: Get all babysitters
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

/* -----------------------------------
   Users Routes
----------------------------------- */

// Route: Register a new user
app.post('/api/users/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at;
    `;

    const values = [name, email, hashedPassword];
    const result = await db.query(query, values);
    const token = jwt.sign(
      { id: result.rows[0].id, email: result.rows[0].email, role: 'user' },
      process.env.JWT_SECRET,
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
        created_at: result.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: User login with JWT
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
      process.env.JWT_SECRET,
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

// Route: Get logged-in user profile (protected)
app.get('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    const query = `SELECT id, name, email, created_at FROM users WHERE id = $1`;
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

// Route: Update user profile (protected)
app.put('/api/users/profile', authMiddleware, async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const queryUser = `SELECT * FROM users WHERE id = $1`;
    const resultUser = await db.query(queryUser, [req.user.id]);

    if (resultUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updates = {
      name: name || resultUser.rows[0].name,
      email: email || resultUser.rows[0].email
    };

    let hashedPassword = resultUser.rows[0].password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const queryUpdate = `
      UPDATE users
      SET name = $1, email = $2, password = $3
      WHERE id = $4
      RETURNING id, name, email, created_at;
    `;

    const values = [updates.name, updates.email, hashedPassword, req.user.id];
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

// Route: Delete user account (protected, must have no bookings)
app.delete('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    // Check if user has related bookings
    const bookingCheck = await db.query(
      `SELECT id FROM bookings WHERE user_id = $1`,
      [req.user.id]
    );

    if (bookingCheck.rows.length > 0) {
      return res.status(400).json({
        error: 'You must cancel all bookings before deleting your account.'
      });
    }

    // Delete user
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

// Route: Get all users (protected)
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

// Route: Universal login (users or babysitters)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // First try to find in users
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
        process.env.JWT_SECRET,
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

    // If not found, try babysitters
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
        process.env.JWT_SECRET,
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

    // Not found in either table
    return res.status(401).json({ error: 'Invalid email or password.' });

  } catch (error) {
    console.error('Universal login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Change babysitter password (protected)
app.put('/api/babysitters/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required.' });
    }

    // Fetch babysitter from DB
    const query = `SELECT * FROM babysitters WHERE id = $1`;
    const result = await db.query(query, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Babysitter not found.' });
    }

    const babysitter = result.rows[0];

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, babysitter.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in DB
    const updateQuery = `
      UPDATE babysitters
      SET password = $1
      WHERE id = $2
    `;
    await db.query(updateQuery, [hashedPassword, req.user.id]);

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error changing password:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Change user password (protected)
app.put('/api/users/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new passwords are required.' });
    }

    // Get the user
    const queryUser = `SELECT * FROM users WHERE id = $1`;
    const resultUser = await db.query(queryUser, [req.user.id]);

    if (resultUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = resultUser.rows[0];

    // Compare current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const queryUpdate = `
      UPDATE users
      SET password = $1
      WHERE id = $2
    `;
    await db.query(queryUpdate, [hashedPassword, req.user.id]);

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Update user password (protected)
app.put('/api/users/profile/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required.' });
    }

    // Fetch user
    const queryUser = `SELECT * FROM users WHERE id = $1`;
    const resultUser = await db.query(queryUser, [req.user.id]);

    if (resultUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = resultUser.rows[0];

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const queryUpdate = `
      UPDATE users
      SET password = $1
      WHERE id = $2
      RETURNING id;
    `;
    await db.query(queryUpdate, [hashedPassword, req.user.id]);

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Update booking status (protected)
app.put('/api/bookings/:id/status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Valida status permitido
    const validStatuses = ['pending', 'confirmed', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    // update database
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
   Bookings Routes
----------------------------------- */

// Route: Create a new booking
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

// Route: Get all bookings for a user
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
// Route: Get all bookings for a babysitter
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

/* -----------------------------------
   Root Endpoint
----------------------------------- */
app.get('/', (req, res) => {
  res.send('TrustaSitter backend is running!');
});

/* -----------------------------------
   Server Initialization
----------------------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
