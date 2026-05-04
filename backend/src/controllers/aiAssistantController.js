const pool = require('../db');
const axios = require('axios');

const askAI = async (req, res) => {
  const { question } = req.body;
  const companyId = req.companyId;

  if (!question?.trim()) {
    return res.status(400).json({ message: 'Pregunta requerida' });
  }

  try {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'API key no configurada' });
    }

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: question
        }]
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        timeout: 30000
      }
    );

    const text = response.data.content[0].text;

    await pool.query(
      'INSERT INTO ai_conversations (user_id, company_id, question, response, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [req.user.id, companyId, question, text]
    ).catch(() => {});

    res.json({ question, response: text });
  } catch (err) {
    console.error('AI Error:', err.response?.status, err.response?.data?.error?.message || err.message);
    res.status(500).json({ message: err.response?.data?.error?.message || 'Error al procesar pregunta' });
  }
};

module.exports = { askAI };
