const pool = require('../db');
const axios = require('axios');

const askAI = async (req, res) => {
  try {
    const { question } = req.body;
    const companyId = req.companyId;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!question?.trim()) {
      return res.status(400).json({ message: 'Pregunta requerida' });
    }

    if (!apiKey) {
      return res.status(500).json({ message: 'API key no configurada' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await axios.post(url, {
      contents: [{
        parts: [{ text: question }]
      }]
    }, { timeout: 30000 });

    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Respuesta inválida de API');
    }

    const aiResponse = response.data.candidates[0].content.parts[0].text;

    await pool.query(
      'INSERT INTO ai_conversations (user_id, company_id, question, response, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [req.user.id, companyId, question, aiResponse]
    ).catch(() => {});

    res.json({ question, response: aiResponse });
  } catch (err) {
    console.error('AI Error:', err.response?.status, err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ message: err.response?.data?.error?.message || err.message });
  }
};

module.exports = { askAI };
