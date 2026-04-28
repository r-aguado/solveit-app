const pool = require('./index');

async function init() {
  const client = await pool.connect();
  try {
    // Usuarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL,
        department VARCHAR(100),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT now(),
        profile_photo TEXT
      )
    `);

    // Categorías
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT
      )
    `);

    // Incidencias
    await client.query(`
      CREATE TABLE IF NOT EXISTS incidents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'open',
        priority VARCHAR(10) DEFAULT 'medium',
        category_id INTEGER REFERENCES categories(id),
        created_by INTEGER REFERENCES users(id),
        assigned_to INTEGER REFERENCES users(id),
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )
    `);

    // Comentarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT now()
      )
    `);

    // Historial de incidencias
    await client.query(`
      CREATE TABLE IF NOT EXISTS incident_history (
        id SERIAL PRIMARY KEY,
        incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
        changed_by INTEGER REFERENCES users(id),
        old_status VARCHAR(20),
        new_status VARCHAR(20),
        changed_at TIMESTAMP DEFAULT now()
      )
    `);

    // Notificaciones
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT now()
      )
    `);

    // Base de conocimiento
    await client.query(`
      CREATE TABLE IF NOT EXISTS knowledge_base (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )
    `);

    // Tags de la base de conocimiento
    await client.query(`
      CREATE TABLE IF NOT EXISTS kb_tags (
        id SERIAL PRIMARY KEY,
        article_id INTEGER REFERENCES knowledge_base(id) ON DELETE CASCADE,
        tag VARCHAR(50) NOT NULL
      )
    `);

    // Posts del foro
    await client.query(`
      CREATE TABLE IF NOT EXISTS forum_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Comentarios del foro
    await client.query(`
      CREATE TABLE IF NOT EXISTS forum_comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed: categorías por defecto
    const catCount = await client.query('SELECT COUNT(*) FROM categories');
    if (parseInt(catCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO categories (name, description) VALUES
        ('Hardware', 'Problemas con equipos físicos'),
        ('Software', 'Problemas con aplicaciones o sistemas operativos'),
        ('Red', 'Problemas de conectividad y red'),
        ('Acceso', 'Problemas de acceso y contraseñas'),
        ('Otros', 'Otros tipos de incidencias')
      `);
      console.log('✓ categorías por defecto creadas');
    }

    // Seed: usuario admin por defecto
    const adminCount = await client.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    if (parseInt(adminCount.rows[0].count) === 0) {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('admin1234', 10);
      await client.query(`
        INSERT INTO users (name, email, password, role, department)
        VALUES ('Administrador', 'admin@solveit.com', $1, 'admin', 'IT')
      `, [hash]);
      console.log('✓ usuario admin creado (admin@solveit.com / admin1234)');
    }

    // Columna imagen en comentarios del foro
    await client.query(`ALTER TABLE forum_comments ADD COLUMN IF NOT EXISTS image TEXT`);

    // Columna cover_image en artículos
    await client.query(`ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS cover_image TEXT`);

    // Ratings/Reviews de artículos
    await client.query(`
      CREATE TABLE IF NOT EXISTS knowledge_ratings (
        id SERIAL PRIMARY KEY,
        article_id INTEGER REFERENCES knowledge_base(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        created_at TIMESTAMP DEFAULT now(),
        UNIQUE(article_id, user_id)
      )
    `);

    // Reacciones a comentarios del foro
    await client.query(`
      CREATE TABLE IF NOT EXISTS forum_reactions (
        id SERIAL PRIMARY KEY,
        comment_id INTEGER REFERENCES forum_comments(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        emoji VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        UNIQUE(comment_id, user_id, emoji)
      )
    `);

    // Menciones en comentarios del foro
    await client.query(`
      CREATE TABLE IF NOT EXISTS forum_mentions (
        id SERIAL PRIMARY KEY,
        comment_id INTEGER REFERENCES forum_comments(id) ON DELETE CASCADE,
        mentioned_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT now()
      )
    `);

    console.log('✓ Base de datos inicializada correctamente');
  } finally {
    client.release();
  }
}

module.exports = init;
