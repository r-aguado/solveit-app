const pool = require('../db');

const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Incidencias creadas por el usuario
    const createdIncidents = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress
      FROM incidents
      WHERE created_by = $1
    `, [userId]);

    // Incidencias asignadas al usuario (si es técnico)
    const assignedIncidents = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress
      FROM incidents
      WHERE assigned_to = $1
    `, [userId]);

    // Tiempo promedio de resolución
    const avgResolutionTime = await pool.query(`
      SELECT
        ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600)::numeric, 1) as avg_hours
      FROM incidents
      WHERE (assigned_to = $1 OR created_by = $1) AND resolved_at IS NOT NULL
    `, [userId]);

    // Incidencias comentadas
    const commentCount = await pool.query(`
      SELECT COUNT(*) as total FROM comments WHERE user_id = $1
    `, [userId]);

    // Artículos creados
    const articleCount = await pool.query(`
      SELECT COUNT(*) as total FROM knowledge_base WHERE created_by = $1
    `, [userId]);

    // Comentarios en foro
    const forumCommentCount = await pool.query(`
      SELECT COUNT(*) as total FROM forum_comments WHERE user_id = $1
    `, [userId]);

    res.json({
      created_incidents: createdIncidents.rows[0],
      assigned_incidents: assignedIncidents.rows[0],
      avg_resolution_hours: parseFloat(avgResolutionTime.rows[0]?.avg_hours) || 0,
      comments_count: parseInt(commentCount.rows[0]?.total) || 0,
      articles_count: parseInt(articleCount.rows[0]?.total) || 0,
      forum_comments_count: parseInt(forumCommentCount.rows[0]?.total) || 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

module.exports = { getUserStats };
