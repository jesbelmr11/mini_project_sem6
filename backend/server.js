// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const nodemailer = require("nodemailer");
const si = require("systeminformation");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());


// ==================== DATABASE ====================
const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "",
  database: process.env.PGDATABASE || "miniproject",
});

// Test DB connection
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Postgres connected:", pool.options.database);
    client.release();
  } catch (err) {
    console.error("❌ Postgres connection failed:", err.message);
  }
})();


// ==================== SMTP ====================
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error("❌ SMTP env variables missing. Check .env file.");
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP
transporter.verify()
  .then(() => console.log("✅ SMTP transporter ready"))
  .catch(err => console.error("❌ SMTP error:", err.message));


// ==================== HELPERS ====================
function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}


// ==================== ROUTES ====================

// Health check
app.get("/", (_, res) => res.send("Server running"));


// ==================== AUTH ====================

// Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { name, dob, phone_no, email, password } = req.body;

    if (!name || !dob || !phone_no || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const q = `
      INSERT INTO signup (name, dob, phone_no, email, password)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING name, email, phone_no
    `;

    const { rows } = await pool.query(q, [
      name,
      dob,
      phone_no,
      email,
      hashed,
    ]);

    res.status(201).json({ message: "User registered", user: rows[0] });

  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ error: "Signup failed" });
  }
});


// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const q = await pool.query(
      "SELECT name, phone_no, email, password FROM signup WHERE email=$1",
      [email]
    );

    if (!q.rows.length) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = q.rows[0];
    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        phone_no: user.phone_no
      },
    });

  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});


// ==================== OTP / FORGOT PASSWORD ====================

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const user = await pool.query(
      "SELECT email FROM signup WHERE email=$1",
      [email]
    );

    if (!user.rows.length) {
      return res.status(404).json({ error: "Email not registered" });
    }

    const code = genOtp();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(`
      INSERT INTO otp_requests (email, code, expires_at, attempts)
      VALUES ($1,$2,$3,0)
      ON CONFLICT (email)
      DO UPDATE SET code=$2, expires_at=$3, attempts=0
    `, [email, code, expires]);

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${code}. Valid for 10 minutes.`,
    });

    res.json({ message: "OTP sent" });

  } catch (err) {
    console.error("send-otp error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});


// Verify OTP
app.post("/verify-otp", async (req, res) => {
  const { email, code } = req.body;

  try {
    const q = await pool.query(
      "SELECT code, expires_at FROM otp_requests WHERE email=$1",
      [email]
    );

    if (!q.rows.length) {
      return res.status(404).json({ error: "OTP not found" });
    }

    if (new Date(q.rows[0].expires_at) < new Date()) {
      return res.status(410).json({ error: "OTP expired" });
    }

    if (q.rows[0].code !== code) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    res.json({ message: "OTP verified" });

  } catch (err) {
    res.status(500).json({ error: "OTP verification failed" });
  }
});


// Reset Password
app.post("/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const q = await pool.query(
      "SELECT code FROM otp_requests WHERE email=$1",
      [email]
    );

    if (!q.rows.length || q.rows[0].code !== code) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE signup SET password=$1 WHERE email=$2",
      [hashed, email]
    );

    await pool.query("DELETE FROM otp_requests WHERE email=$1", [email]);

    res.json({ message: "Password reset successful" });

  } catch (err) {
    res.status(500).json({ error: "Password reset failed" });
  }
});


// ==================== SYSTEM METRICS ====================

app.get("/api/system-metrics", async (req, res) => {
  try {
    const cpu = await si.currentLoad();
    const temp = await si.cpuTemperature();
    const mem = await si.mem();
    const disk = await si.fsSize();
    const processes = await si.processes();
    const uptime = await si.time();
    const network = await si.networkStats();
    const connections = await si.networkConnections();

    let totalRx = 0;
    let totalTx = 0;

    network.forEach((n) => {
      totalRx += n.rx_bytes;
      totalTx += n.tx_bytes;
    });

    res.json({
      cpuUsage: cpu.currentLoad.toFixed(2),
      cpuTemp: temp.main !== null ? temp.main.toFixed(1) : null,
      totalMem: (mem.total / 1024 / 1024 / 1024).toFixed(2),
      usedMem: (mem.used / 1024 / 1024 / 1024).toFixed(2),
      diskUsed: (disk[0].used / 1024 / 1024 / 1024).toFixed(2),
      diskTotal: (disk[0].size / 1024 / 1024 / 1024).toFixed(2),
      activeProcesses: processes.all,
      uptime: uptime.uptime,
      activeConnections: connections.length,
      loadAverage: cpu.avgLoad,
      networkReceived: (totalRx / 1024 / 1024).toFixed(2),
      networkSent: (totalTx / 1024 / 1024).toFixed(2)
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});


// ==================== LOG FILE UPLOAD ====================
const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/upload-log", upload.single("logfile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileContent = req.file.buffer.toString("utf-8");
    const fileName = req.file.originalname;

    const lines = fileContent.split("\n");

    for (let line of lines) {
      if (!line.trim()) continue;

      const parts = line.split(" ");
      const timestamp = parts[0] + " " + parts[1];
      const logLevel = parts[2];
      const message = parts.slice(3).join(" ");

      await pool.query(
        `INSERT INTO structured_logs (file_name, timestamp, log_level, message)
         VALUES ($1, $2, $3, $4)`,
        [fileName, timestamp, logLevel, message]
      );
    }

    res.json({ message: "Logs uploaded and stored in database" });

  } catch (err) {
    res.status(500).json({ error: "Failed to process log file" });
  }
});


// ==================== START SERVER ====================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
