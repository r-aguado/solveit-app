const pool = require('../db');

// SLA límites en horas por prioridad
const SLA = { critical: 4, high: 8, medium: 24, low: 72 };

// GET /api/dashboard?dateFrom=&dateTo=&technicianId=
const getStats = async (req, res) => {
  try {
    const { dateFrom, dateTo, technicianId } = req.query;

    const dateFilter = dateFrom && dateTo
      ? `AND i.created_at BETWEEN '${dateFrom}' AND '${dateTo}'`
      : dateFrom
      ? `AND i.created_at >= '${dateFrom}'`
      : dateTo
      ? `AND i.created_at <= '${dateTo}'`
      : '';

    const techFilter = technicianId ? `AND i.assigned_to = ${parseInt(technicianId)}` : '';

    const [
      total, byStatus, byPriority, byCategory,
      avgResolution, byTechnician, unassigned,
      overdue, recentActivity, slaCompliance
    ] = await Promise.all([

      pool.query(`SELECT COUNT(*) AS total FROM incidents i WHERE 1=1 ${dateFilter} ${techFilter}`),

      pool.query(`
        SELECT status, COUNT(*) AS count
        FROM incidents i WHERE 1=1 ${dateFilter} ${techFilter}
        GROUP BY status
      `),

      pool.query(`
        SELECT priority, COUNT(*) AS count
        FROM incidents i WHERE 1=1 ${dateFilter} ${techFilter}
        GROUP BY priority
      `),

      pool.query(`
        SELECT c.name, COUNT(i.id) AS count
        FROM categories c LEFT JOIN incidents i ON i.category_id = c.id
        WHERE 1=1 ${dateFilter.replace(/i\./g, 'i.')} ${techFilter.replace(/i\./g, 'i.')}
        GROUP BY c.name ORDER BY count DESC
      `),

      pool.query(`
        SELECT ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600), 1) AS avg_hours
        FROM incidents i
        WHERE status = 'resolved' AND resolved_at IS NOT NULL ${dateFilter} ${techFilter}
      `),

      pool.query(`
        SELECT
          u.id,
          u.name,
          u.profile_photo,
          COUNT(i.id) AS total,
          COUNT(i.id) FILTER (WHERE i.status IN ('open','in_progress')) AS active,
          COUNT(i.id) FILTER (WHERE i.status = 'resolved') AS resolved,
          COUNT(i.id) FILTER (WHERE i.status = 'closed') AS closed,
          ROUND(AVG(EXTRACT(EPOCH FROM (i.resolved_at - i.created_at))/3600) FILTER (WHERE i.status = 'resolved' AND i.resolved_at IS NOT NULL), 1) AS avg_resolution_hours,
          COUNT(i.id) FILTER (WHERE i.priority = 'critical') AS critical_count,
          COUNT(i.id) FILTER (WHERE i.priority = 'high') AS high_count
        FROM users u
        LEFT JOIN incidents i ON i.assigned_to = u.id ${dateFilter ? 'AND ' + dateFilter.replace('AND ', '') : ''}
        WHERE u.role = 'technician' AND u.active = true
        GROUP BY u.id, u.name, u.profile_photo
        ORDER BY total DESC
      `),

      pool.query(`
        SELECT COUNT(*) AS count FROM incidents i
        WHERE assigned_to IS NULL AND status = 'open' ${dateFilter}
      `),

      // Incidencias vencidas (abiertas/en progreso que superan el SLA)
      pool.query(`
        SELECT COUNT(*) FILTER (WHERE priority = 'critical' AND EXTRACT(EPOCH FROM (NOW() - created_at))/3600 > 4) AS critical_overdue,
               COUNT(*) FILTER (WHERE priority = 'high'     AND EXTRACT(EPOCH FROM (NOW() - created_at))/3600 > 8) AS high_overdue,
               COUNT(*) FILTER (WHERE priority = 'medium'   AND EXTRACT(EPOCH FROM (NOW() - created_at))/3600 > 24) AS medium_overdue,
               COUNT(*) FILTER (WHERE priority = 'low'      AND EXTRACT(EPOCH FROM (NOW() - created_at))/3600 > 72) AS low_overdue
        FROM incidents i
        WHERE status IN ('open', 'in_progress') ${dateFilter} ${techFilter}
      `),

      // Actividad reciente: incidencias por día (últimos 7 días)
      pool.query(`
        SELECT DATE(created_at) AS day, COUNT(*) AS count
        FROM incidents i
        WHERE created_at >= NOW() - INTERVAL '7 days' ${techFilter}
        GROUP BY DATE(created_at)
        ORDER BY day ASC
      `),

      // SLA compliance: % de incidencias resueltas dentro del SLA
      pool.query(`
        SELECT
          priority,
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE
            (priority = 'critical' AND EXTRACT(EPOCH FROM (resolved_at - created_at))/3600 <= 4) OR
            (priority = 'high'     AND EXTRACT(EPOCH FROM (resolved_at - created_at))/3600 <= 8) OR
            (priority = 'medium'   AND EXTRACT(EPOCH FROM (resolved_at - created_at))/3600 <= 24) OR
            (priority = 'low'      AND EXTRACT(EPOCH FROM (resolved_at - created_at))/3600 <= 72)
          ) AS within_sla
        FROM incidents i
        WHERE status = 'resolved' AND resolved_at IS NOT NULL ${dateFilter} ${techFilter}
        GROUP BY priority
      `)
    ]);

    // Calcular SLA compliance por técnico
    const techWithSla = await Promise.all(byTechnician.rows.map(async (t) => {
      const sla = await pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'resolved' AND resolved_at IS NOT NULL) AS resolved_total,
          COUNT(*) FILTER (WHERE status = 'resolved' AND resolved_at IS NOT NULL AND (
            (priority = 'critical' AND EXTRACT(EPOCH FROM (resolved_at - created_at))/3600 <= 4) OR
            (priority = 'high'     AND EXTRACT(EPOCH FROM (resolved_at - created_at))/3600 <= 8) OR
            (priority = 'medium'   AND EXTRACT(EPOCH FROM (resolved_at - created_at))/3600 <= 24) OR
            (priority = 'low'      AND EXTRACT(EPOCH FROM (resolved_at - created_at))/3600 <= 72)
          )) AS within_sla,
          COUNT(*) FILTER (WHERE status IN ('open','in_progress') AND (
            (priority = 'critical' AND EXTRACT(EPOCH FROM (NOW() - created_at))/3600 > 4) OR
            (priority = 'high'     AND EXTRACT(EPOCH FROM (NOW() - created_at))/3600 > 8) OR
            (priority = 'medium'   AND EXTRACT(EPOCH FROM (NOW() - created_at))/3600 > 24) OR
            (priority = 'low'      AND EXTRACT(EPOCH FROM (NOW() - created_at))/3600 > 72)
          )) AS overdue
        FROM incidents
        WHERE assigned_to = $1 ${dateFilter}
      `, [t.id]);

      const r = sla.rows[0];
      const slaRate = parseInt(r.resolved_total) > 0
        ? Math.round((parseInt(r.within_sla) / parseInt(r.resolved_total)) * 100)
        : null;

      return { ...t, sla_rate: slaRate, overdue: parseInt(r.overdue) };
    }));

    const overdueRow = overdue.rows[0];
    const totalOverdue = parseInt(overdueRow.critical_overdue) + parseInt(overdueRow.high_overdue) +
                         parseInt(overdueRow.medium_overdue) + parseInt(overdueRow.low_overdue);

    res.json({
      total: parseInt(total.rows[0].total),
      byStatus: byStatus.rows,
      byPriority: byPriority.rows,
      byCategory: byCategory.rows,
      avgResolutionHours: avgResolution.rows[0].avg_hours,
      byTechnician: techWithSla,
      unassigned: parseInt(unassigned.rows[0].count),
      overdue: { ...overdueRow, total: totalOverdue },
      recentActivity: recentActivity.rows,
      slaCompliance: slaCompliance.rows,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

module.exports = { getStats };
