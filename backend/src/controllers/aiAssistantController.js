const pool = require('../db');
const axios = require('axios');

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'mistral';

// POST /api/knowledge/ask-ai
const askAI = async (req, res) => {
  const { question } = req.body;
  const companyId = req.companyId;

  if (!question || !question.trim()) {
    return res.status(400).json({ message: 'La pregunta es requerida' });
  }

  try {
    // Buscar artículos relevantes de la Knowledge Base
    const kbArticles = await pool.query(
      `SELECT title, content FROM knowledge_base
       WHERE company_id = $1 AND (
         title ILIKE $2 OR content ILIKE $2
       )
       LIMIT 5`,
      [companyId, `%${question}%`]
    );

    // Preparar contexto con artículos relevantes
    let context = 'Eres un asistente de soporte IT. Responde preguntas basándote en la siguiente información de la base de conocimiento:\n\n';

    if (kbArticles.rows.length > 0) {
      context += 'INFORMACIÓN RELEVANTE:\n';
      kbArticles.rows.forEach((article, index) => {
        context += `\n${index + 1}. ${article.title}\n${article.content}\n`;
      });
    } else {
      context += 'No hay artículos específicos en la base de datos, pero responde según tu conocimiento general de IT.\n';
    }

    context += `\nPREGUNTA DEL USUARIO: ${question}\n`;
    context += 'RESPUESTA:';

    // Llamar a Ollama
    const response = await axios.post(OLLAMA_URL, {
      model: OLLAMA_MODEL,
      prompt: context,
      stream: false
    }, { timeout: 60000 });

    const aiResponse = response.data.response.trim();

    // Guardar pregunta/respuesta (opcional)
    await pool.query(
      `INSERT INTO ai_conversations (user_id, company_id, question, response, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [req.user.id, companyId, question, aiResponse]
    ).catch(() => {}); // Ignorar si la tabla no existe

    res.json({
      question,
      response: aiResponse,
      relevantArticles: kbArticles.rows.length
    });
  } catch (err) {
    console.error('Error en AI Assistant:', err.message);

    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        message: 'El servicio de IA no está disponible. Asegúrate de que Ollama esté corriendo.'
      });
    }

    res.status(500).json({ message: 'Error al procesar la pregunta', error: err.message });
  }
};

module.exports = { askAI };
