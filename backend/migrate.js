const pool = require('./src/db');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo TEXT`);
    console.log('✓ profile_photo añadido a users');

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
    console.log('✓ tabla forum_posts creada');

    await client.query(`
      CREATE TABLE IF NOT EXISTS forum_comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ tabla forum_comments creada');

    // Artículos de conocimiento adicionales
    const existingCount = await client.query('SELECT COUNT(*) FROM knowledge_base');
    if (parseInt(existingCount.rows[0].count) < 5) {
      const catResult = await client.query('SELECT id FROM categories LIMIT 5');
      const cats = catResult.rows;
      const adminResult = await client.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
      const adminId = adminResult.rows[0]?.id;

      const articles = [
        {
          title: 'Cómo restablecer tu contraseña',
          content: 'Para restablecer tu contraseña sigue estos pasos:\n\n1. Ve a la pantalla de inicio de sesión\n2. Contacta con el administrador indicando tu email\n3. El administrador te enviará una nueva contraseña temporal\n4. Al iniciar sesión, dirígete a Perfil > Cambiar contraseña\n5. Establece tu nueva contraseña (mínimo 6 caracteres)\n\nSi tienes problemas, abre una incidencia con categoría "Acceso y Contraseñas".',
          cat: cats[0]?.id
        },
        {
          title: 'El ordenador no enciende — Guía de diagnóstico',
          content: 'Pasos de diagnóstico cuando el equipo no enciende:\n\n1. Comprueba que el cable de alimentación está bien conectado\n2. Verifica que la regleta/enchufe tiene corriente\n3. Pulsa el botón de encendido durante 5 segundos\n4. Si tiene batería (portátil), conecta el cargador y espera 10 min\n5. Comprueba si hay luces LED encendidas en la caja\n6. Si nada funciona, abre una incidencia con prioridad Alta.',
          cat: cats[1]?.id
        },
        {
          title: 'Problemas de conexión a la red WiFi',
          content: 'Solución paso a paso para problemas de WiFi:\n\n1. Comprueba que el WiFi está activado en tu dispositivo\n2. Olvida la red y vuelve a conectarte introduciendo la contraseña\n3. Reinicia el adaptador de red: Panel de control > Redes > Deshabilitar y habilitar\n4. Ejecuta el solucionador de problemas de Windows\n5. Reinicia el router si tienes acceso a él\n6. Si el problema persiste, contacta con el técnico de red.',
          cat: cats[2]?.id
        },
        {
          title: 'Cómo instalar software corporativo',
          content: 'El software corporativo debe instalarse siguiendo el proceso oficial:\n\n1. Abre una incidencia indicando el software que necesitas y el motivo\n2. El técnico revisará si tienes permisos para instalarlo\n3. Si está aprobado, recibirás instrucciones o el técnico lo instalará remotamente\n4. IMPORTANTE: No instales software no autorizado\n5. Para software de uso personal, consulta la política IT.',
          cat: cats[0]?.id
        },
        {
          title: 'Outlook no sincroniza el correo',
          content: 'Pasos para solucionar problemas de sincronización en Outlook:\n\n1. Comprueba tu conexión a Internet\n2. Cierra y vuelve a abrir Outlook\n3. Ve a Archivo > Configuración de la cuenta > tu cuenta > Reparar\n4. Borra la caché: cierra Outlook, ve a %localappdata%\\Microsoft\\Outlook\\ y borra los .ost\n5. Si el problema continúa, abre una incidencia con captura del error.',
          cat: cats[1]?.id
        },
        {
          title: 'Impresora no reconocida por Windows',
          content: 'Solución para cuando Windows no detecta la impresora:\n\n1. Comprueba que está encendida y conectada (USB o red)\n2. Desconecta y reconecta el cable USB\n3. Reinstala el driver desde el Administrador de dispositivos\n4. Para impresoras de red, verifica que ambos equipos están en la misma subred\n5. Reinicia el servicio: Servicios > Cola de impresión > Reiniciar',
          cat: cats[2]?.id
        },
        {
          title: 'VPN corporativa — Configuración y uso',
          content: 'Para conectarte a la VPN corporativa:\n\n1. Instala el cliente VPN indicado por IT\n2. Introduce el servidor VPN proporcionado\n3. Usa tus credenciales corporativas\n4. Activa la VPN SIEMPRE que trabajes desde fuera de la oficina\n5. Al terminar, desconéctate para liberar recursos del servidor.',
          cat: cats[0]?.id
        },
        {
          title: 'Pantalla azul (BSOD) — Qué hacer',
          content: 'Cuando Windows muestra una pantalla azul:\n\n1. Anota el código de error (ej: IRQL_NOT_LESS_OR_EQUAL)\n2. El equipo reiniciará automáticamente\n3. Actualiza todos los drivers, especialmente tarjeta gráfica\n4. Ejecuta: sfc /scannow desde CMD como administrador\n5. Comprueba el estado del disco: chkdsk C: /f\n6. Abre incidencia con el código de error y frecuencia.',
          cat: cats[1]?.id
        },
      ];

      for (const a of articles) {
        await client.query(
          'INSERT INTO knowledge_base (title, content, category_id, created_by) VALUES ($1, $2, $3, $4)',
          [a.title, a.content, a.cat || null, adminId]
        );
      }
      console.log('✓ artículos de conocimiento añadidos');
    } else {
      console.log('✓ ya hay artículos, se omite seed de conocimiento');
    }

    // Posts de ejemplo en el foro
    const postCount = await client.query('SELECT COUNT(*) FROM forum_posts');
    if (parseInt(postCount.rows[0].count) === 0) {
      const usersResult = await client.query('SELECT id FROM users LIMIT 3');
      const users = usersResult.rows;
      if (users.length > 0) {
        const posts = [
          {
            title: '¿Cómo libero espacio en disco rápidamente?',
            content: 'Mi ordenador tiene el disco casi lleno y va muy lento. He probado a borrar archivos pero sigue igual. ¿Algún truco que os haya funcionado?',
            uid: users[0].id
          },
          {
            title: 'Problema con doble pantalla en reuniones Teams',
            content: 'Cuando comparto pantalla en Teams con dos monitores, el otro participante ve parpadeos. ¿A alguien le ha pasado y cómo lo ha solucionado?',
            uid: users[Math.min(1, users.length - 1)].id
          },
          {
            title: 'Truco para acelerar el inicio de Windows',
            content: 'Descubrí que desactivando programas del inicio se reduce el tiempo de arranque de 2 minutos a 20 segundos. Aquí os cuento cómo hacerlo paso a paso.',
            uid: users[Math.min(2, users.length - 1)].id
          },
        ];
        for (const p of posts) {
          await client.query(
            'INSERT INTO forum_posts (title, content, user_id) VALUES ($1, $2, $3)',
            [p.title, p.content, p.uid]
          );
        }
        console.log('✓ posts de ejemplo añadidos al foro');
      }
    }

    // Tabla de notificaciones
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        body TEXT,
        type VARCHAR(50) DEFAULT 'info',
        incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ tabla notifications creada');

    console.log('\nMigración completada correctamente');
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate().catch(e => { console.error('Error en migración:', e.message); process.exit(1); });
