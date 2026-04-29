const pool = require('../db');

const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ incidents: [], knowledge: [], forum: [], users: [] });
    }

    const searchTerm = `%${q}%`;

    const [incidents, knowledge, forum, users] = await Promise.all([
      pool.query(`
        SELECT id, title, status, priority, category_id, category_name
        FROM incidents_view
        WHERE company_id = $1 AND (title ILIKE $2 OR description ILIKE $2)
        LIMIT 10
      `, [req.companyId, searchTerm]),
      pool.query(`
        SELECT kb.id, kb.title, kb.cover_image, c.name AS category_name
        FROM knowledge_base kb
        LEFT JOIN categories c ON kb.category_id = c.id
        WHERE kb.company_id = $1 AND (kb.title ILIKE $2 OR kb.content ILIKE $2)
        LIMIT 10
      `, [req.companyId, searchTerm]),
      pool.query(`
        SELECT fp.id, fp.title, COUNT(fc.id) AS comment_count
        FROM forum_posts fp
        LEFT JOIN forum_comments fc ON fp.id = fc.post_id
        WHERE fp.company_id = $1 AND (fp.title ILIKE $2 OR fp.description ILIKE $2)
        GROUP BY fp.id
        LIMIT 10
      `, [req.companyId, searchTerm]),
      pool.query(`
        SELECT id, name, email, role
        FROM users
        WHERE company_id = $1 AND (name ILIKE $2 OR email ILIKE $2)
        LIMIT 5
      `, [req.companyId, searchTerm]),
    ]);

    res.json({
      incidents: incidents.rows,
      knowledge: knowledge.rows,
      forum: forum.rows,
      users: users.rows,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

module.exports = { globalSearch };
