const pool = require('../db');
const axios = require('axios');

const askAI = async (req, res) => {
  const { question } = req.body;
  const companyId = req.companyId;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!question?.trim()) {
    return res.status(400).json({ message: 'Pregunta requerida' });
  }

  if (!apiKey) {
    return res.status(500).json({ message: 'GEMINI_API_KEY no configurada' });
  }

  try {
    // Buscar artículos relevantes de la Knowledge Base
    const kbArticles = await pool.query(
      `SELECT title, content FROM knowledge_base
       WHERE company_id = $1 AND (title ILIKE $2 OR content ILIKE $2)
       LIMIT 5`,
      [companyId, `%${question}%`]
    );

    let prompt = 'Eres un asistente de soporte IT profesional y amable. Responde de forma clara y concisa en español. ';

    if (kbArticles.rows.length > 0) {
      prompt += 'Usa la siguiente información de la base de conocimiento:\n\n';
      kbArticles.rows.forEach((article, index) => {
        prompt += `${index + 1}. ${article.title}: ${article.content}\n\n`;
      });
    }

    prompt += `\nPregunta del usuario: ${question}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;

    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    }, { timeout: 30000 });

    // Filtrar parts internos de "thought" y quedarnos con la respuesta visible.
    // Si tras filtrar no queda nada, caer al texto bruto de todos los parts.
    const parts = response.data?.candidates?.[0]?.content?.parts || [];
    let text = parts.filter(p => !p.thought).map(p => p.text || '').join('').trim();
    if (!text) {
      text = parts.map(p => p.text || '').join('').trim();
    }

    if (!text) {
      console.error('Respuesta sin texto:', JSON.stringify(response.data));
      return res.status(500).json({ message: 'Respuesta inválida de la IA' });
    }

    await pool.query(
      'INSERT INTO ai_conversations (user_id, company_id, question, response, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [req.user.id, companyId, question, text]
    ).catch(() => {});

    res.json({ question, response: text, relevantArticles: kbArticles.rows.length });
  } catch (err) {
    console.error('AI Error:', err.response?.status, err.response?.data?.error?.message || err.message);
    res.status(500).json({
      message: err.response?.data?.error?.message || 'Error al procesar pregunta'
    });
  }
};

module.exports = { askAI };
