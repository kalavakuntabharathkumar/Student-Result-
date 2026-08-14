const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { authenticate, requireRole, SECRET } = require('./auth');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/register', async (req, res) => {
  const { name, email, password, role, roll_no } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hash, role || 'student']
  );
  if (role === 'student' && roll_no) {
    await pool.query('INSERT INTO students (user_id, roll_no) VALUES (?, ?)', [result.insertId, roll_no]);
  }
  res.json({ id: result.insertId });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, SECRET, { expiresIn: '8h' });
  res.json({ token, role: user.role, name: user.name });
});

app.get('/api/analytics/trends', authenticate, requireRole('admin'), async (req, res) => {
  const [rows] = await pool.query(`
    SELECT sem.name AS semester, sub.name AS subject, AVG(r.marks) AS avg_marks
    FROM results r
    JOIN semesters sem ON r.semester_id = sem.id
    JOIN subjects sub ON r.subject_id = sub.id
    GROUP BY sem.name, sub.name
    ORDER BY sem.name
  `);
  res.json(rows);
});

app.get('/api/results/me', authenticate, requireRole('student'), async (req, res) => {
  const [[student]] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
  const [rows] = await pool.query(`
    SELECT sem.name AS semester, sub.name AS subject, r.marks
    FROM results r
    JOIN semesters sem ON r.semester_id = sem.id
    JOIN subjects sub ON r.subject_id = sub.id
    WHERE r.student_id = ?
    ORDER BY sem.name
  `, [student.id]);
  res.json(rows);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
