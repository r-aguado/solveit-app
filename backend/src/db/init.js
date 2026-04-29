const pool = require('./index');

async function init() {
  const client = await pool.connect();
  try {
    // Empresas (antes de users porque users lo referencia)
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150),
        phone VARCHAR(50),
        plan VARCHAR(20) DEFAULT 'basic',
        active BOOLEAN DEFAULT true,
        logo TEXT,
        created_at TIMESTAMP DEFAULT now()
      )
    `);

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
        profile_photo TEXT,
        company_id INTEGER REFERENCES companies(id)
      )
    `);

    // Agregar columna company_id a usuarios si no existe (para migraciones)
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id)
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
        updated_at TIMESTAMP DEFAULT now(),
        company_id INTEGER REFERENCES companies(id)
      )
    `);

    // Agregar columna company_id a incidents si no existe
    await client.query(`
      ALTER TABLE incidents ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id)
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
        created_at TIMESTAMP DEFAULT now(),
        company_id INTEGER REFERENCES companies(id)
      )
    `);

    // Agregar columna company_id a notifications si no existe
    await client.query(`
      ALTER TABLE notifications ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id)
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
        updated_at TIMESTAMP DEFAULT now(),
        company_id INTEGER REFERENCES companies(id)
      )
    `);

    // Agregar columna company_id a knowledge_base si no existe
    await client.query(`
      ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id)
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        company_id INTEGER REFERENCES companies(id)
      )
    `);

    // Agregar columna company_id a forum_posts si no existe
    await client.query(`
      ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id)
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

    // Remover constraintantiguo de role y crear uno nuevo que incluya 'superadmin'
    try {
      await client.query(`
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check
      `);
    } catch (err) {
      // El constraint puede no existir, es ok
    }

    // Agregar nuevo constraint con todos los roles
    try {
      await client.query(`
        ALTER TABLE users ADD CONSTRAINT users_role_check
        CHECK (role IN ('admin', 'technician', 'user', 'superadmin'))
      `);
    } catch (err) {
      // El constraint ya existe, es ok
    }

    // Migración multi-tenant: crear empresa por defecto si no existe
    const companyResult = await client.query(
      "SELECT id FROM companies WHERE name = 'SolveIT Demo' LIMIT 1"
    );
    let defaultCompanyId;
    if (companyResult.rows.length === 0) {
      const insertCompany = await client.query(`
        INSERT INTO companies (name, email, plan, active)
        VALUES ('SolveIT Demo', 'demo@solveit.com', 'basic', true)
        RETURNING id
      `);
      defaultCompanyId = insertCompany.rows[0].id;
      console.log('✓ empresa por defecto creada (SolveIT Demo)');

      // Migrar usuarios existentes a la empresa default
      await client.query(`
        UPDATE users SET company_id = $1
        WHERE company_id IS NULL AND role != 'superadmin'
      `, [defaultCompanyId]);

      // Migrar incidencias existentes
      await client.query(`
        UPDATE incidents SET company_id = $1 WHERE company_id IS NULL
      `, [defaultCompanyId]);

      // Migrar artículos de conocimiento existentes
      await client.query(`
        UPDATE knowledge_base SET company_id = $1 WHERE company_id IS NULL
      `, [defaultCompanyId]);

      // Migrar posts del foro existentes
      await client.query(`
        UPDATE forum_posts SET company_id = $1 WHERE company_id IS NULL
      `, [defaultCompanyId]);

      // Migrar notificaciones existentes
      await client.query(`
        UPDATE notifications SET company_id = $1 WHERE company_id IS NULL
      `, [defaultCompanyId]);

      console.log('✓ datos migrados a empresa por defecto');
    } else {
      defaultCompanyId = companyResult.rows[0].id;
    }

    // Seed: usuario admin por defecto (si no existe)
    const adminCount = await client.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    if (parseInt(adminCount.rows[0].count) === 0) {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('admin1234', 10);
      await client.query(`
        INSERT INTO users (name, email, password, role, department, company_id)
        VALUES ('Administrador', 'admin@solveit.com', $1, 'admin', 'IT', $2)
      `, [hash, defaultCompanyId]);
      console.log('✓ usuario admin creado (admin@solveit.com / admin1234)');
    }

    // Seed: usuario superadmin (solo desarrollador)
    const superAdminCount = await client.query(
      "SELECT COUNT(*) FROM users WHERE role = 'superadmin'"
    );
    if (parseInt(superAdminCount.rows[0].count) === 0) {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('superadmin1234', 10);
      await client.query(`
        INSERT INTO users (name, email, password, role, company_id)
        VALUES ('Super Admin', 'superadmin@solveit.com', $1, 'superadmin', NULL)
      `, [hash]);
      console.log('✓ superadmin creado (superadmin@solveit.com / superadmin1234)');
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
