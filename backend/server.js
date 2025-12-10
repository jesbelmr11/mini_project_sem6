// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// ----- Postgres pool using env vars -----
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || 'miniproject',
});

// ----- Nodemailer transporter (SMTP) -----
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || '',
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
  secure: process.env.SMTP_SECURE === 'true', // true for 465
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

// verify transporter (non-blocking)
transporter.verify().then(() => {
  console.log('SMTP transporter ready');
}).catch((err) => {
  console.warn('SMTP transporter verification failed (check .env):', err.message || err);
});

// ----- Test DB connection on startup -----
(async () => {
  try {
    const client = await pool.connect();
    console.log('Postgres connected:', process.env.PGDATABASE || 'miniproject');
    client.release();
  } catch (err) {
    console.error('Postgres connection error:', err.message || err);
  }
})();

// ---------- Helpers ----------
function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
}

// ---------- Routes ----------

// Health-check
app.get('/', (req, res) => res.send('Signup backend running'));

// Debug: db info
app.get('/api/debug/dbinfo', (req, res) => {
  res.json({
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    user: process.env.PGUSER || 'postgres',
    database: process.env.PGDATABASE || 'miniproject',
    serverPort: process.env.PORT || 4000
  });
});

// Debug: list users (no password)
app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT name, dob, phone_no, email FROM signup ORDER BY name LIMIT 100;');
    res.json({ count: rows.length, rows });
  } catch (err) {
    console.error('GET /api/users error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Signup
app.post('/api/signup', async (req, res) => {
  console.log('POST /api/signup: received request');
  console.log('Request body:', req.body);

  try {
    const { name, dob, phone_no, email, password } = req.body;

    if (!name || !dob || !phone_no || !email || !password) {
      console.warn('Validation failed: missing fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    const phoneNumber = String(phone_no).replace(/\D/g, '');
    if (!/^\d{6,15}$/.test(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
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

// Login
app.post('/api/login', async (req, res) => {
  console.log('POST /api/login: received request');
  console.log('Request body:', req.body);

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const q = 'SELECT name, phone_no, email, password FROM signup WHERE email = $1 LIMIT 1';
    const { rows } = await pool.query(q, [email]);

    if (!rows.length) {
      console.warn('Login failed: user not found for', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.warn('Login failed: wrong password for', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.json({
      message: 'Login successful',
      user: { name: user.name, phone_no: user.phone_no, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ----------------- OTP + Forgot Password Routes -----------------

/**
 * Table expected:
 * CREATE TABLE IF NOT EXISTS otp_requests (
 *   email VARCHAR(255) PRIMARY KEY,
 *   code VARCHAR(10) NOT NULL,
 *   expires_at TIMESTAMP NOT NULL,
 *   attempts INT DEFAULT 0,
 *   created_at TIMESTAMP DEFAULT now()
 * );
 *
 * Run the above SQL once in your miniproject DB.
 */

// Send OTP
app.post('/send-otp', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    // ensure user exists (optional privacy choice)
    const userQ = await pool.query('SELECT email FROM signup WHERE email = $1 LIMIT 1', [email]);
    if (userQ.rows.length === 0) {
      return res.status(404).json({ error: 'No account with that email' });
    }

    // Basic rate limit: count in last hour
    const rateQ = await pool.query(
      "SELECT COUNT(*)::int AS cnt FROM otp_requests WHERE created_at > (now() - interval '1 hour') AND email = $1",
      [email]
    );
    const cnt = rateQ.rows[0] ? Number(rateQ.rows[0].cnt) : 0;
    if (cnt >= 5) {
      return res.status(429).json({ error: 'Too many OTP requests. Try again later.' });
    }

    const code = genOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // upsert OTP row
    await pool.query(`
      INSERT INTO otp_requests (email, code, expires_at, attempts, created_at)
      VALUES ($1, $2, $3, 0, now())
      ON CONFLICT (email) DO UPDATE
        SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at, attempts = 0, created_at = now()
    `, [email, code, expiresAt]);

    // send email
    const mail = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Your password reset OTP',
      text: `Your OTP code is: ${code}. It expires in 10 minutes.`,
      html: `<p>Your OTP code is: <strong>${code}</strong></p><p>It expires in 10 minutes.</p>`,
    };

    await transporter.sendMail(mail);

    console.log(`OTP ${code} sent to ${email}`);
    return res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error('send-otp error', err);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
app.post('/verify-otp', async (req, res) => {
  const { email, code } = req.body || {};
  if (!email || !code) return res.status(400).json({ error: 'Email and code required' });

  try {
    const q = await pool.query('SELECT code, expires_at, attempts FROM otp_requests WHERE email = $1 LIMIT 1', [email]);
    if (!q.rows.length) return res.status(404).json({ error: 'OTP not found' });

    const row = q.rows[0];
    if (new Date(row.expires_at) < new Date()) {
      return res.status(410).json({ error: 'OTP expired' });
    }

    if (row.attempts >= 5) {
      return res.status(403).json({ error: 'Too many attempts' });
    }

    if (row.code !== String(code)) {
      await pool.query('UPDATE otp_requests SET attempts = attempts + 1 WHERE email = $1', [email]);
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    await pool.query('UPDATE otp_requests SET attempts = 0 WHERE email = $1', [email]);
    return res.json({ message: 'OTP valid' });
  } catch (err) {
    console.error('verify-otp error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Reset password
app.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body || {};
  if (!email || !code || !newPassword) return res.status(400).json({ error: 'Email, code and newPassword required' });

  try {
    const q = await pool.query('SELECT code, expires_at, attempts FROM otp_requests WHERE email = $1 LIMIT 1', [email]);
    if (!q.rows.length) return res.status(404).json({ error: 'OTP not found' });

    const row = q.rows[0];
    if (new Date(row.expires_at) < new Date()) {
      return res.status(410).json({ error: 'OTP expired' });
    }

    if (row.attempts >= 5) {
      return res.status(403).json({ error: 'Too many attempts' });
    }

    if (row.code !== String(code)) {
      await pool.query('UPDATE otp_requests SET attempts = attempts + 1 WHERE email = $1', [email]);
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // hash new password and update user
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE signup SET password = $1 WHERE email = $2', [hashed, email]);

    // remove OTP row
    await pool.query('DELETE FROM otp_requests WHERE email = $1', [email]);

    return res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('reset-password error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ---------- Start server ----------
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
