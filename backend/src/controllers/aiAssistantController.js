const pool = require('../db');
const { OpenAI } = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    let systemPrompt = 'Eres un asistente de soporte IT profesional. Responde preguntas basándote en la siguiente información de la base de conocimiento cuando sea relevante:\n\n';

    if (kbArticles.rows.length > 0) {
      systemPrompt += 'INFORMACIÓN DE LA BASE DE CONOCIMIENTO:\n';
      kbArticles.rows.forEach((article, index) => {
        systemPrompt += `\n${index + 1}. ${article.title}\n${article.content}\n`;
      });
    } else {
      systemPrompt += 'No hay artículos específicos en la base de datos, responde según tu conocimiento general de IT de manera profesional y útil.';
    }

    // Llamar a OpenAI
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: question,
        },
      ],
    });

    const aiResponse = response.choices[0].message.content;

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
    const statusCode = err.status || 500;
    const message = err.status === 401
      ? 'API key de OpenAI inválida'
      : err.status === 429
      ? 'Límite de requests alcanzado. Intenta de nuevo más tarde.'
      : 'Error al procesar la pregunta';

    res.status(statusCode).json({ message, error: err.message });
  }
};

module.exports = { askAI };
