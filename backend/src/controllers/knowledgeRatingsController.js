const pool = require('../db');

// GET /api/knowledge/:id/ratings
const getArticleRatings = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT kr.id, kr.rating, kr.review, kr.created_at, u.name AS user_name
      FROM knowledge_ratings kr
      JOIN users u ON kr.user_id = u.id
      WHERE kr.article_id = $1
      ORDER BY kr.created_at DESC
    `, [id]);

    const statsResult = await pool.query(`
      SELECT
        COUNT(*) as total_ratings,
        ROUND(AVG(rating)::numeric, 1) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_stars,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_stars,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_stars,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_stars,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM knowledge_ratings
      WHERE article_id = $1
    `, [id]);

    res.json({
      ratings: result.rows,
      stats: statsResult.rows[0],
    });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// POST /api/knowledge/:id/ratings
const createRating = async (req, res) => {
  const { id } = req.params;
  const { rating, review } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'La calificación debe estar entre 1 y 5' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO knowledge_ratings (article_id, user_id, rating, review)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (article_id, user_id) DO UPDATE
      SET rating = $3, review = $4, created_at = NOW()
      RETURNING *
    `, [id, req.user.id, rating, review || null]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// DELETE /api/knowledge/:id/ratings/:ratingId
const deleteRating = async (req, res) => {
  const { id, ratingId } = req.params;
  try {
    // Verificar que el usuario es el dueño del rating
    const rating = await pool.query(`
      SELECT user_id FROM knowledge_ratings WHERE id = $1 AND article_id = $2
    `, [ratingId, id]);

    if (rating.rows.length === 0) {
      return res.status(404).json({ message: 'Rating no encontrado' });
    }

    if (rating.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    await pool.query('DELETE FROM knowledge_ratings WHERE id = $1', [ratingId]);
    res.json({ message: 'Rating eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

module.exports = { getArticleRatings, createRating, deleteRating };
