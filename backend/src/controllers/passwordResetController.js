const pool = require('../db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/auth/forgot-password
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'El email es requerido' });
  }

  try {
    const user = await pool.query('SELECT id, name FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const userId = user.rows[0].id;
    const userName = user.rows[0].name;

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Guardar en BD
    await pool.query(
      'INSERT INTO password_resets (user_id, token, code, expires_at) VALUES ($1, $2, $3, $4)',
      [userId, token, code, expiresAt]
    );

    // Enviar email con Resend
    const { data, error } = await resend.emails.send({
      from: 'SolveIT <onboarding@resend.dev>',
      to: email,
      subject: 'Recuperar contraseña - SolveIT',
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Hola ${userName},</p>
        <p>Has solicitado recuperar tu contraseña. Usa el siguiente código para cambiarla:</p>
        <h1 style="color: #1f3a93; font-size: 32px; letter-spacing: 5px;">${code}</h1>
        <p>Este código expira en <strong>15 minutos</strong>.</p>
        <p>Si no solicitaste este cambio, ignora este email.</p>
        <hr>
        <p style="color: #999; font-size: 12px;">SolveIT - Sistema de Gestión de Incidencias IT</p>
      `,
    });

    if (error) {
      console.error('Error de Resend:', error);
      return res.status(500).json({ message: 'Error al enviar email', error: error.message });
    }

    res.json({ message: 'Código enviado a tu email', token });
  } catch (err) {
    console.error('Password reset error:', err.message);
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  const { token, code, newPassword, confirmPassword } = req.body;

  if (!token || !code || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Las contraseñas no coinciden' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    // Buscar el reset token
    const reset = await pool.query(
      'SELECT * FROM password_resets WHERE token = $1 AND used = false AND expires_at > NOW()',
      [token]
    );

    if (reset.rows.length === 0) {
      return res.status(400).json({ message: 'Código inválido o expirado' });
    }

    const resetRecord = reset.rows[0];
    const userId = resetRecord.user_id;

    // Verificar que el código sea correcto
    if (resetRecord.code !== code.toString()) {
      return res.status(400).json({ message: 'Código incorrecto' });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña del usuario
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    // Marcar el token como usado
    await pool.query(
      'UPDATE password_resets SET used = true WHERE id = $1',
      [resetRecord.id]
    );

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

module.exports = { requestPasswordReset, resetPassword };
