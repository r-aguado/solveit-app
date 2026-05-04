const pool = require('../db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const askAI = async (req, res) => {
  const { question } = req.body;
  const companyId = req.companyId;

  if (!question || !question.trim()) {
    return res.status(400).json({ message: 'La pregunta es requerida' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ message: 'GEMINI_API_KEY no está configurada' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
    let systemPrompt = 'Eres un asistente de soporte IT profesional. Responde preguntas basándote en la siguiente información de la base de conocimiento cuando sea relevante:\n\n';

    if (kbArticles.rows.length > 0) {
      systemPrompt += 'INFORMACIÓN DE LA BASE DE CONOCIMIENTO:\n';
      kbArticles.rows.forEach((article, index) => {
        systemPrompt += `\n${index + 1}. ${article.title}\n${article.content}\n`;
      });
    } else {
      systemPrompt += 'No hay artículos específicos en la base de datos, responde según tu conocimiento general de IT de manera profesional y útil.';
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const fullPrompt = systemPrompt + '\n\nPREGUNTA: ' + question;

    const result = await model.generateContent(fullPrompt);
    const aiResponse = result.response.text();

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
    const statusCode = err.status === 400 ? 400 : err.status === 403 ? 403 : 500;
    const message = err.message.includes('API key')
      ? 'API key de Gemini inválida'
      : err.message.includes('quota')
      ? 'Límite de requests alcanzado. Intenta de nuevo más tarde.'
      : 'Error al procesar la pregunta';

    res.status(statusCode).json({ message, error: err.message });
  }
};

module.exports = { askAI };
