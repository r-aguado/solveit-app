const pool = require('../db');

// GET /api/knowledge
const getAll = async (req, res) => {
  try {
    const { category_id, q } = req.query;
    let query = `
      SELECT kb.*, c.name AS category_name, u.name AS author_name
      FROM knowledge_base kb
      LEFT JOIN categories c ON kb.category_id = c.id
      LEFT JOIN users u ON kb.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    if (category_id) { params.push(category_id); query += ` AND kb.category_id = $${params.length}`; }
    if (q) { params.push(`%${q}%`); query += ` AND (kb.title ILIKE $${params.length} OR kb.content ILIKE $${params.length})`; }
    query += ' ORDER BY kb.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// GET /api/knowledge/:id
const getOne = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT kb.*, c.name AS category_name, u.name AS author_name
      FROM knowledge_base kb
      LEFT JOIN categories c ON kb.category_id = c.id
      LEFT JOIN users u ON kb.created_by = u.id
      WHERE kb.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Artículo no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// POST /api/knowledge
const create = async (req, res) => {
  const { title, content, category_id, cover_image } = req.body;
  if (!title || !content) return res.status(400).json({ message: 'Título y contenido son obligatorios' });
  try {
    const result = await pool.query(
      `INSERT INTO knowledge_base (title, content, category_id, created_by, cover_image)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, content, category_id || null, req.user.id, cover_image || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// PUT /api/knowledge/:id
const update = async (req, res) => {
  const { title, content, category_id, cover_image } = req.body;
  try {
    const result = await pool.query(
      `UPDATE knowledge_base SET title = $1, content = $2, category_id = $3, cover_image = $4, updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [title, content, category_id || null, cover_image || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Artículo no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// DELETE /api/knowledge/:id
const remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM knowledge_base WHERE id = $1', [req.params.id]);
    res.json({ message: 'Artículo eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove };
