const pool = require('../db');

// POST /api/forum/:postId/comments/:commentId/reactions
const addReaction = async (req, res) => {
  const { postId, commentId } = req.params;
  const { emoji } = req.body;

  if (!emoji || emoji.length > 10) {
    return res.status(400).json({ message: 'Emoji inválido' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO forum_reactions (comment_id, user_id, emoji)
      VALUES ($1, $2, $3)
      ON CONFLICT (comment_id, user_id, emoji) DO NOTHING
      RETURNING *
    `, [commentId, req.user.id, emoji]);

    res.status(201).json(result.rows[0] || { message: 'Ya has reaccionado con este emoji' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// DELETE /api/forum/:postId/comments/:commentId/reactions/:reactionId
const removeReaction = async (req, res) => {
  const { reactionId, commentId } = req.params;

  try {
    const reaction = await pool.query(
      'SELECT user_id FROM forum_reactions WHERE id = $1',
      [reactionId]
    );

    if (reaction.rows.length === 0) {
      return res.status(404).json({ message: 'Reacción no encontrada' });
    }

    if (reaction.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    await pool.query('DELETE FROM forum_reactions WHERE id = $1', [reactionId]);
    res.json({ message: 'Reacción eliminada' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// GET /api/forum/:postId/comments/:commentId/reactions
const getReactions = async (req, res) => {
  const { commentId } = req.params;

  try {
    const result = await pool.query(`
      SELECT id, emoji, user_id, u.name as user_name, COUNT(*) OVER (PARTITION BY emoji) as count
      FROM forum_reactions fr
      JOIN users u ON fr.user_id = u.id
      WHERE fr.comment_id = $1
      ORDER BY emoji, fr.created_at
    `, [commentId]);

    const grouped = {};
    result.rows.forEach(row => {
      if (!grouped[row.emoji]) {
        grouped[row.emoji] = { emoji: row.emoji, count: row.count, users: [], ids: [] };
      }
      grouped[row.emoji].users.push(row.user_name);
      grouped[row.emoji].ids.push(row.id);
    });

    res.json(Object.values(grouped));
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

module.exports = { addReaction, removeReaction, getReactions };
