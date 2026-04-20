const pool = require('../db');
const { createNotification } = require('./notificationController');

// GET /api/incidents
const getAll = async (req, res) => {
  try {
    const { status, priority, category_id } = req.query;
    let query = `
      SELECT i.*,
        u1.name AS created_by_name,
        u2.name AS assigned_to_name,
        c.name AS category_name
      FROM incidents i
      LEFT JOIN users u1 ON i.created_by = u1.id
      LEFT JOIN users u2 ON i.assigned_to = u2.id
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status) { params.push(status); query += ` AND i.status = $${params.length}`; }
    if (priority) { params.push(priority); query += ` AND i.priority = $${params.length}`; }
    if (category_id) { params.push(category_id); query += ` AND i.category_id = $${params.length}`; }

    // Si es usuario normal, solo ve sus incidencias
    if (req.user.role === 'user') {
      params.push(req.user.id);
      query += ` AND i.created_by = $${params.length}`;
    }
    // Si es técnico, ve las asignadas a él y las abiertas
    if (req.user.role === 'technician') {
      params.push(req.user.id);
      query += ` AND (i.assigned_to = $${params.length} OR i.status = 'open')`;
    }

    query += ' ORDER BY i.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// GET /api/incidents/:id
const getOne = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*,
        u1.name AS created_by_name,
        u2.name AS assigned_to_name,
        c.name AS category_name
      FROM incidents i
      LEFT JOIN users u1 ON i.created_by = u1.id
      LEFT JOIN users u2 ON i.assigned_to = u2.id
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Incidencia no encontrada' });
    }

    const [comments, history] = await Promise.all([
      pool.query(`
        SELECT cm.*, u.name AS user_name FROM comments cm
        LEFT JOIN users u ON cm.user_id = u.id
        WHERE cm.incident_id = $1 ORDER BY cm.created_at ASC
      `, [req.params.id]),
      pool.query(`
        SELECT ih.*, u.name AS changed_by_name FROM incident_history ih
        LEFT JOIN users u ON ih.changed_by = u.id
        WHERE ih.incident_id = $1 ORDER BY ih.changed_at ASC
      `, [req.params.id])
    ]);

    res.json({ ...result.rows[0], comments: comments.rows, history: history.rows });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// PATCH /api/incidents/:id/assign
const assignTechnician = async (req, res) => {
  const { technician_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE incidents SET assigned_to = $1, updated_at = NOW() WHERE id = $2
       RETURNING *`,
      [technician_id || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Incidencia no encontrada' });

    // Notificar al técnico recién asignado
    if (technician_id && technician_id !== req.user.id) {
      const inc = result.rows[0];
      await createNotification(
        technician_id,
        'Nueva incidencia asignada',
        `Se te ha asignado: "${inc.title}"`,
        'incident_assigned',
        inc.id
      );
    }

    res.json({ message: 'Técnico asignado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// POST /api/incidents
const create = async (req, res) => {
  const { title, description, priority, category_id } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Título y descripción son obligatorios' });
  }

  try {
    // Asignación automática: técnico con menos incidencias activas
    const techResult = await pool.query(`
      SELECT u.id FROM users u
      LEFT JOIN incidents i ON i.assigned_to = u.id AND i.status IN ('open', 'in_progress')
      WHERE u.role = 'technician' AND u.active = true
      GROUP BY u.id
      ORDER BY COUNT(i.id) ASC
      LIMIT 1
    `);

    const assignedTo = techResult.rows.length > 0 ? techResult.rows[0].id : null;

    const result = await pool.query(`
      INSERT INTO incidents (title, description, priority, category_id, created_by, assigned_to)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, description, priority || 'medium', category_id, req.user.id, assignedTo]);

    const incident = result.rows[0];

    // Notificar al técnico asignado automáticamente
    if (assignedTo && assignedTo !== req.user.id) {
      await createNotification(
        assignedTo,
        'Nueva incidencia asignada',
        `Se te ha asignado: "${title}"`,
        'incident_assigned',
        incident.id
      );
    }

    res.status(201).json(incident);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// PATCH /api/incidents/:id/status
const updateStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Estado no válido' });
  }

  try {
    const current = await pool.query('SELECT * FROM incidents WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) return res.status(404).json({ message: 'Incidencia no encontrada' });

    const oldStatus = current.rows[0].status;
    const resolvedAt = status === 'resolved' ? new Date() : null;

    await pool.query(`
      UPDATE incidents SET status = $1, updated_at = NOW(), resolved_at = $2 WHERE id = $3
    `, [status, resolvedAt, req.params.id]);

    // Guardar en historial
    await pool.query(`
      INSERT INTO incident_history (incident_id, changed_by, old_status, new_status)
      VALUES ($1, $2, $3, $4)
    `, [req.params.id, req.user.id, oldStatus, status]);

    // Notificar al creador si no es quien hace el cambio
    const inc = current.rows[0];
    const STATUS_LABEL = { open: 'Abierta', in_progress: 'En progreso', resolved: 'Resuelta', closed: 'Cerrada' };
    if (inc.created_by && inc.created_by !== req.user.id) {
      await createNotification(
        inc.created_by,
        'Estado de incidencia actualizado',
        `"${inc.title}" → ${STATUS_LABEL[status]}`,
        'status_changed',
        inc.id
      );
    }
    // Notificar al técnico asignado si no es quien hace el cambio
    if (inc.assigned_to && inc.assigned_to !== req.user.id && inc.assigned_to !== inc.created_by) {
      await createNotification(
        inc.assigned_to,
        'Estado de incidencia actualizado',
        `"${inc.title}" → ${STATUS_LABEL[status]}`,
        'status_changed',
        inc.id
      );
    }

    res.json({ message: 'Estado actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// POST /api/incidents/:id/comments
const addComment = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'El mensaje no puede estar vacío' });

  try {
    const result = await pool.query(`
      INSERT INTO comments (incident_id, user_id, message) VALUES ($1, $2, $3) RETURNING *
    `, [req.params.id, req.user.id, message]);

    // Notificar al creador y al técnico asignado (si no son quien comenta)
    const incData = await pool.query('SELECT title, created_by, assigned_to FROM incidents WHERE id = $1', [req.params.id]);
    if (incData.rows.length > 0) {
      const { title, created_by, assigned_to } = incData.rows[0];
      const notified = new Set([req.user.id]);
      for (const uid of [created_by, assigned_to]) {
        if (uid && !notified.has(uid)) {
          notified.add(uid);
          await createNotification(uid, 'Nuevo comentario', `Comentario en "${title}"`, 'comment', parseInt(req.params.id));
        }
      }
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// GET /api/incidents/categories
const getCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

module.exports = { getAll, getOne, create, updateStatus, addComment, getCategories, assignTechnician };
