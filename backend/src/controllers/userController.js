const pool = require('../db');
const bcrypt = require('bcryptjs');

// GET /api/users — solo admin
const getAll = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, department, active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// PATCH /api/users/:id/active — activar/desactivar usuario
const toggleActive = async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE users SET active = NOT active WHERE id = $1 RETURNING id, name, active',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// GET /api/users/technicians — lista de técnicos disponibles
const getTechnicians = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, department,
        (SELECT COUNT(*) FROM incidents WHERE assigned_to = users.id AND status IN ('open','in_progress')) AS active_incidents
       FROM users WHERE role = 'technician' AND active = true ORDER BY name`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// POST /api/users — crear usuario (solo admin)
const createUser = async (req, res) => {
  const { name, email, password, role, department } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'El email ya está registrado' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, department)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, department, active`,
      [name, email, hashedPassword, role, department || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

module.exports = { getAll, toggleActive, getTechnicians, createUser };
