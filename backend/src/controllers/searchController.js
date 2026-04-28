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
        WHERE title ILIKE $1 OR description ILIKE $1
        LIMIT 10
      `, [searchTerm]),
      pool.query(`
        SELECT kb.id, kb.title, kb.cover_image, c.name AS category_name
        FROM knowledge_base kb
        LEFT JOIN categories c ON kb.category_id = c.id
        WHERE kb.title ILIKE $1 OR kb.content ILIKE $1
        LIMIT 10
      `, [searchTerm]),
      pool.query(`
        SELECT fp.id, fp.title, COUNT(fc.id) AS comment_count
        FROM forum_posts fp
        LEFT JOIN forum_comments fc ON fp.id = fc.post_id
        WHERE fp.title ILIKE $1 OR fp.description ILIKE $1
        GROUP BY fp.id
        LIMIT 10
      `, [searchTerm]),
      pool.query(`
        SELECT id, name, email, role
        FROM users
        WHERE name ILIKE $1 OR email ILIKE $1
        LIMIT 5
      `, [searchTerm]),
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
