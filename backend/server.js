// server.js (verbose debug version)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json()); // use built-in parser

// Postgres pool using env vars
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

// attempt connect and log
(async () => {
  try {
    const client = await pool.connect();
    console.log('Postgres connected:', process.env.PGDATABASE);
    client.release();
  } catch (err) {
    console.error('Postgres connection error:', err.message || err);
  }
})();

// simple health-check
app.get('/', (req, res) => res.send('Signup backend running'));

// debug route: list users (no passwords)
app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT name, dob, phone_no, email FROM signup ORDER BY name LIMIT 100;');
    res.json({ count: rows.length, rows });
  } catch (err) {
    console.error('GET /api/users error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Signup route with logging
app.post('/api/signup', async (req, res) => {
  console.log('POST /api/signup: received request');
  console.log('Request body:', req.body);

  try {
    const { name, dob, phone_no, email, password } = req.body;

    if (!name || !dob || !phone_no || !email || !password) {
      console.warn('Validation failed: missing fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    // sanitize phone -> digits only
    const phoneNumber = String(phone_no).replace(/\D/g, '');
    if (!/^\d{6,15}$/.test(phoneNumber)) {
      console.warn('Invalid phone number:', phone_no);
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO signup (name, dob, phone_no, email, password)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING name, dob, phone_no, email;
    `;
    const values = [name, dob, phoneNumber, email, hashedPassword];

    const result = await pool.query(insertQuery, values);
    console.log('DB insert result:', result.rowCount, result.rows[0]);

    return res.status(201).json({ message: 'User registered', user: result.rows[0] });
  } catch (err) {
    console.error('Signup error:', err.code || err.message || err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A user with that phone number already exists' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
