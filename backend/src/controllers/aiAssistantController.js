const pool = require('../db');
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const askAI = async (req, res) => {
  const { question } = req.body;
  const companyId = req.companyId;

  if (!question || !question.trim()) {
    return res.status(400).json({ message: 'La pregunta es requerida' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ message: 'GEMINI_API_KEY no está configurada' });
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
    let systemPrompt = 'Eres un asistente de soporte IT profesional y amable. ';

    if (kbArticles.rows.length > 0) {
      systemPrompt += 'Usa la siguiente información de la base de conocimiento para responder:\n\n';
      kbArticles.rows.forEach((article, index) => {
        systemPrompt += `${index + 1}. ${article.title}: ${article.content}\n\n`;
      });
    } else {
      systemPrompt += 'Responde preguntas sobre IT de manera profesional basándote en tu conocimiento general.';
    }

    const fullPrompt = systemPrompt + '\n\nPregunta del usuario: ' + question;

    // Llamar a Google Gemini API
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: fullPrompt
              }
            ]
          }
        ]
      },
      { timeout: 30000 }
    );

    const aiResponse = response.data.candidates[0].content.parts[0].text;

    // Guardar pregunta/respuesta
    await pool.query(
      `INSERT INTO ai_conversations (user_id, company_id, question, response, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [req.user.id, companyId, question, aiResponse]
    ).catch(() => {});

    res.json({
      question,
      response: aiResponse,
      relevantArticles: kbArticles.rows.length
    });
  } catch (err) {
    console.error('Error en AI Assistant:', err.message);
    const statusCode = err.response?.status || 500;
    const message = err.response?.status === 403
      ? 'API key de Gemini inválida o sin permisos'
      : err.response?.status === 429
      ? 'Límite de requests alcanzado. Intenta de nuevo más tarde.'
      : 'Error al procesar la pregunta';

    res.status(statusCode).json({ message, error: err.message });
  }
};

module.exports = { askAI };
