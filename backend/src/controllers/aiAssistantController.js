const pool = require('../db');
const axios = require('axios');

const askAI = async (req, res) => {
  try {
    const { question } = req.body;
    const companyId = req.companyId;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'La pregunta es requerida' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'API key no configurada' });
    }

    const kbArticles = await pool.query(
      'SELECT title, content FROM knowledge_base WHERE company_id = $1 LIMIT 5',
      [companyId]
    );

    const prompt = `Pregunta: ${question}\n\nInformación de base de datos:\n${kbArticles.rows.map(a => a.title).join(', ')}`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { timeout: 30000 }
    );

    const aiResponse = response.data.candidates[0].content.parts[0].text;

    await pool.query(
      'INSERT INTO ai_conversations (user_id, company_id, question, response, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [req.user.id, companyId, question, aiResponse]
    ).catch(() => {});

    res.json({ question, response: aiResponse, relevantArticles: kbArticles.rows.length });
  } catch (err) {
    console.error('AI Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { askAI };
