const pool = require('../db');

// GET /api/forum — lista de posts
const getPosts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        fp.id, fp.title, fp.content, fp.created_at,
        u.name AS author_name, u.profile_photo AS author_photo,
        COUNT(DISTINCT fc.id)::int AS comment_count
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      LEFT JOIN forum_comments fc ON fc.post_id = fp.id
      WHERE fp.company_id = $1
      GROUP BY fp.id, u.name, u.profile_photo
      ORDER BY fp.created_at DESC
    `, [req.companyId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// GET /api/forum/:id — post con comentarios
const getPost = async (req, res) => {
  const { id } = req.params;
  try {
    const postResult = await pool.query(`
      SELECT
        fp.id, fp.title, fp.content, fp.created_at, fp.user_id,
        u.name AS author_name, u.profile_photo AS author_photo
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      WHERE fp.company_id = $1 AND fp.id = $2
    `, [req.companyId, id]);

    if (postResult.rows.length === 0) return res.status(404).json({ message: 'Post no encontrado' });

    const commentsResult = await pool.query(`
      SELECT
        fc.id, fc.message, fc.image, fc.created_at,
        u.id AS user_id, u.name AS user_name, u.profile_photo AS user_photo
      FROM forum_comments fc
      JOIN users u ON fc.user_id = u.id
      WHERE fc.post_id = $1
      ORDER BY fc.created_at ASC
    `, [id]);

    res.json({ ...postResult.rows[0], comments: commentsResult.rows });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// POST /api/forum — crear post
const createPost = async (req, res) => {
  const { title, content } = req.body;
  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ message: 'El título y el contenido son obligatorios' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO forum_posts (title, content, user_id, company_id) VALUES ($1, $2, $3, $4)
       RETURNING id, title, content, created_at`,
      [title.trim(), content.trim(), req.user.id, req.companyId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// DELETE /api/forum/:id — eliminar post (propio o admin)
const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT user_id FROM forum_posts WHERE company_id = $1 AND id = $2', [req.companyId, id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Post no encontrado' });

    if (result.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Sin permisos para eliminar este post' });
    }

    await pool.query('DELETE FROM forum_posts WHERE company_id = $1 AND id = $2', [req.companyId, id]);
    res.json({ message: 'Post eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// POST /api/forum/:id/comments — añadir comentario
const addComment = async (req, res) => {
  const { id } = req.params;
  const { message, image } = req.body;
  if (!message?.trim()) return res.status(400).json({ message: 'El comentario no puede estar vacío' });

  try {
    const post = await pool.query('SELECT id FROM forum_posts WHERE company_id = $1 AND id = $2', [req.companyId, id]);
    if (post.rows.length === 0) return res.status(404).json({ message: 'Post no encontrado' });

    await pool.query(
      'INSERT INTO forum_comments (post_id, user_id, message, image) VALUES ($1, $2, $3, $4)',
      [id, req.user.id, message.trim(), image || null]
    );

    // Devolvemos el post actualizado con comentarios
    const commentsResult = await pool.query(`
      SELECT fc.id, fc.message, fc.image, fc.created_at,
             u.id AS user_id, u.name AS user_name, u.profile_photo AS user_photo
      FROM forum_comments fc
      JOIN users u ON fc.user_id = u.id
      WHERE fc.post_id = $1
      ORDER BY fc.created_at ASC
    `, [id]);

    res.status(201).json(commentsResult.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// DELETE /api/forum/:postId/comments/:commentId
const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  try {
    const result = await pool.query(`
      SELECT fc.user_id FROM forum_comments fc
      JOIN forum_posts fp ON fc.post_id = fp.id
      WHERE fc.id = $1 AND fp.company_id = $2
    `, [commentId, req.companyId]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Comentario no encontrado' });

    if (result.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Sin permisos para eliminar este comentario' });
    }

    await pool.query('DELETE FROM forum_comments WHERE id = $1', [commentId]);
    res.json({ message: 'Comentario eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

module.exports = { getPosts, getPost, createPost, deletePost, addComment, deleteComment };
