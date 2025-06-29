// Import dependencies
const express = require('express'); // Express framework for building the API
const app = express(); // Express application for building the API
const bcrypt = require('bcrypt'); // for hashing passwords
require('dotenv').config(); //  to load environment variables
const jwt = require('jsonwebtoken'); // JSON Web Token for authentication
const { Client } = require('pg'); // PostgreSQL client for database operations
const authMiddleware = require('./middleware/authMiddleware'); // custom authentication middleware

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
      available_days,
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
      'your_jwt_secret_key',
      { expiresIn: '3h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      babysitter: {
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

// Route: Get all babysitters
app.get('/api/babysitters', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM babysitters ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching babysitters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Search babysitters by region
app.get('/api/babysitters/search', async (req, res) => {
  const { region } = req.query;

  try {
    const query = `
      SELECT * FROM babysitters
      WHERE region ILIKE $1
      ORDER BY id ASC
    `;
    const values = [`%${region}%`];
    const result = await db.query(query, values);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error searching babysitters:', error);
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

    res.status(201).json({
      message: 'User registered successfully.',
      user: result.rows[0]
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
      'your_jwt_secret_key',
      { expiresIn: '3h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
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

/* -----------------------------------
   Bookings Routes
----------------------------------- */

// Route: Create a new booking (could be protected if desired)
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

// Route: Get all bookings for a user (you can protect if you want)
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
