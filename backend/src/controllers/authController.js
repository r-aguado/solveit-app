const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// POST /api/auth/register
const register = async (req, res) => {
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
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, department`,
      [name, email, hashedPassword, role, department]
    );

    res.status(201).json({ message: 'Usuario creado', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
  }

  try {
    const result = await pool.query(
      `SELECT u.*, c.name as company_name FROM users u
       LEFT JOIN companies c ON u.company_id = c.id
       WHERE u.email = $1 AND u.active = true`,
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, company_id: user.company_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        profile_photo: user.profile_photo,
        company_id: user.company_id,
        company_name: user.company_name
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// GET /api/auth/me
const me = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.department, u.profile_photo, u.created_at, u.company_id, c.name as company_name
       FROM users u
       LEFT JOIN companies c ON u.company_id = c.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// PATCH /api/auth/profile
const updateProfile = async (req, res) => {
  const { name, department, currentPassword, newPassword, profile_photo } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

    const user = result.rows[0];
    let hashedPassword = user.password;

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Debes introducir tu contraseña actual' });
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return res.status(401).json({ message: 'La contraseña actual es incorrecta' });
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    const updated = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           department = COALESCE($2, department),
           password = $3,
           profile_photo = COALESCE($4, profile_photo)
       WHERE id = $5
       RETURNING id, name, email, role, department, profile_photo, company_id`,
      [name || user.name, department !== undefined ? department : user.department, hashedPassword, profile_photo || null, req.user.id]
    );

    res.json({ message: 'Perfil actualizado', user: updated.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

module.exports = { register, login, me, updateProfile };
