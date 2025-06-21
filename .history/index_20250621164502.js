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

app.get('/', (req, res) => {
  res.send('TrustaSitter backend is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
