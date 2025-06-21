const express = require('express');
const app = express();

const { Client } = require('pg');

const db = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'trustasitter',
  password: 'Senha00!',
  port: 5432,
});

db.connect()
  .then(() => console.log('Connected to PostgreSQL ✅'))
  .catch(err => console.error('Connection error ❌', err.stack));

app.use(express.json());

app.post('/api/babysitters', async (req, res) => {
  const { name, email, region, availability } = req.body;

  try {
    const query = `
      INSERT INTO babysitters (name, email, region, availability)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const values = [name, email, region, availability];
    const result = await db.query(query, values);

    res.status(201).json({
      message: 'Babysitter registered successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error inserting babysitter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/babysitters', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM babysitters ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching babysitters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/', (req, res) => {
  res.send('TrustaSitter backend is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
