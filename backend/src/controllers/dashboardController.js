const pool = require('../db');

// GET /api/dashboard
const getStats = async (req, res) => {
  try {
    const [total, byStatus, byPriority, byCategory, avgResolution, byTechnician] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM incidents'),
      pool.query(`SELECT status, COUNT(*) AS count FROM incidents GROUP BY status`),
      pool.query(`SELECT priority, COUNT(*) AS count FROM incidents GROUP BY priority`),
      pool.query(`
        SELECT c.name, COUNT(i.id) AS count
        FROM categories c LEFT JOIN incidents i ON i.category_id = c.id
        GROUP BY c.name ORDER BY count DESC
      `),
      pool.query(`
        SELECT ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600), 2) AS avg_hours
        FROM incidents WHERE status = 'resolved' AND resolved_at IS NOT NULL
      `),
      pool.query(`
        SELECT u.name,
          COUNT(i.id) AS total,
          COUNT(i.id) FILTER (WHERE i.status IN ('open','in_progress')) AS active,
          COUNT(i.id) FILTER (WHERE i.status = 'resolved') AS resolved
        FROM users u
        LEFT JOIN incidents i ON i.assigned_to = u.id
        WHERE u.role = 'technician' AND u.active = true
        GROUP BY u.id, u.name ORDER BY total DESC
      `)
    ]);

    res.json({
      total: parseInt(total.rows[0].total),
      byStatus: byStatus.rows,
      byPriority: byPriority.rows,
      byCategory: byCategory.rows,
      avgResolutionHours: avgResolution.rows[0].avg_hours,
      byTechnician: byTechnician.rows
    });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

module.exports = { getStats };
