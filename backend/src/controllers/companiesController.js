const pool = require('../db');
const bcrypt = require('bcryptjs');

// GET /api/companies - Lista todas las empresas con estadísticas
const getCompanies = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.name,
        c.email,
        c.phone,
        c.plan,
        c.active,
        c.created_at,
        COUNT(DISTINCT u.id) as user_count,
        COUNT(DISTINCT i.id) as incident_count
      FROM companies c
      LEFT JOIN users u ON u.company_id = c.id AND u.role != 'superadmin'
      LEFT JOIN incidents i ON i.company_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// GET /api/companies/:id - Obtiene una empresa específica
const getCompanyById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.name,
        c.email,
        c.phone,
        c.plan,
        c.active,
        c.created_at,
        COUNT(DISTINCT u.id) as user_count,
        COUNT(DISTINCT i.id) as incident_count
      FROM companies c
      LEFT JOIN users u ON u.company_id = c.id
      LEFT JOIN incidents i ON i.company_id = c.id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }

    // Obtener admins de la empresa
    const admins = await pool.query(
      `SELECT id, name, email, created_at FROM users WHERE company_id = $1 AND role = 'admin'`,
      [id]
    );

    res.json({ ...result.rows[0], admins: admins.rows });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// POST /api/companies - Crea una nueva empresa
const createCompany = async (req, res) => {
  const { name, email, phone, plan, admin_name, admin_email, admin_password } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Nombre y email de empresa son obligatorios' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Crear empresa
    const companyResult = await client.query(
      `INSERT INTO companies (name, email, phone, plan, active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, name, email, phone, plan, created_at`,
      [name, email, phone || null, plan || 'basic']
    );

    const company = companyResult.rows[0];
    let adminUser = null;

    // Si se proporciona admin, crear usuario admin para la empresa
    if (admin_name && admin_email) {
      const hashedPassword = await bcrypt.hash(admin_password || 'changeme123', 10);
      const adminResult = await client.query(
        `INSERT INTO users (name, email, password, role, company_id, department)
         VALUES ($1, $2, $3, 'admin', $4, 'IT')
         RETURNING id, name, email, role`,
        [admin_name, admin_email, hashedPassword, company.id]
      );
      adminUser = adminResult.rows[0];
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Empresa creada',
      company,
      admin: adminUser
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  } finally {
    client.release();
  }
};

// PATCH /api/companies/:id - Actualiza una empresa
const updateCompany = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, plan } = req.body;

  try {
    const result = await pool.query(
      `UPDATE companies
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           plan = COALESCE($4, plan)
       WHERE id = $5
       RETURNING id, name, email, phone, plan, active, created_at`,
      [name || null, email || null, phone || null, plan || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }

    res.json({ message: 'Empresa actualizada', company: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// PATCH /api/companies/:id/active - Activa/desactiva una empresa
const toggleCompanyActive = async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener estado actual
    const current = await pool.query('SELECT active FROM companies WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }

    const newActive = !current.rows[0].active;

    // Actualizar estado
    const result = await pool.query(
      `UPDATE companies SET active = $1 WHERE id = $2
       RETURNING id, name, active, created_at`,
      [newActive, id]
    );

    res.json({
      message: `Empresa ${newActive ? 'activada' : 'desactivada'}`,
      company: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  toggleCompanyActive
};
