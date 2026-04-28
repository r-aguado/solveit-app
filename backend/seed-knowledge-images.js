const pool = require('./src/db');

async function run() {
  const client = await pool.connect();
  try {
    // Añadir columna cover_image si no existe
    await client.query(`ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS cover_image TEXT`);
    console.log('✓ Columna cover_image añadida');

    const articles = await client.query('SELECT id, title FROM knowledge_base ORDER BY id');

    const imageMap = {
      'contraseña':   'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&q=80',
      'pantalla azul':'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80',
      'vpn':          'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80',
      'outlook':      'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=600&q=80',
      'espacio':      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
      'impresora':    'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&q=80',
      'virus':        'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&q=80',
      'remoto':       'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=600&q=80',
      'copia':        'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80',
      'wifi':         'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80',
      'software':     'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
      'teams':        'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=600&q=80',
    };

    const defaultImages = [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80',
    ];

    for (let i = 0; i < articles.rows.length; i++) {
      const article = articles.rows[i];
      const titleLower = article.title.toLowerCase();

      let image = null;
      for (const [keyword, url] of Object.entries(imageMap)) {
        if (titleLower.includes(keyword)) { image = url; break; }
      }
      if (!image) image = defaultImages[i % defaultImages.length];

      await client.query('UPDATE knowledge_base SET cover_image = $1 WHERE id = $2', [image, article.id]);
      console.log(`✓ ${article.title}`);
    }

    console.log('\n✅ Imágenes asignadas');
  } finally {
    client.release();
    process.exit(0);
  }
}

run().catch(e => { console.error(e); process.exit(1); });
