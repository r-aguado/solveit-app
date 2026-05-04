const pool = require('../db');
const axios = require('axios');

const askAI = async (req, res) => {
  const { question } = req.body;
  const companyId = req.companyId;
  const apiKey = process.env.GEMINI_API_KEY;

  console.log('AI Request:', { question, companyId, hasKey: !!apiKey });

  if (!question?.trim()) {
    return res.status(400).json({ message: 'Pregunta requerida' });
  }

  if (!apiKey) {
    console.error('GEMINI_API_KEY not found');
    return res.status(500).json({ message: 'API key no configurada' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    console.log('Calling Gemini API...');
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: question }] }]
    }, { timeout: 30000 });

    console.log('Gemini response:', response.status);
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('No text in response:', JSON.stringify(response.data));
      return res.status(500).json({ message: 'Respuesta inválida de API', debug: response.data });
    }

    await pool.query(
      'INSERT INTO ai_conversations (user_id, company_id, question, response, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [req.user.id, companyId, question, text]
    ).catch(e => console.error('DB error:', e));

    res.json({ question, response: text });
  } catch (err) {
    console.error('AI Error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    res.status(500).json({
      message: 'Error al procesar pregunta',
      error: err.response?.data?.error?.message || err.message
    });
  }
};

module.exports = { askAI };
