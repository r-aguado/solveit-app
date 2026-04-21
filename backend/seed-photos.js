const pool = require('./src/db');

const photos = [
  { email: 'r.aguado@solveit.com',    url: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { email: 'e.navarro@solveit.com',   url: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { email: 'c.garcia@solveit.com',    url: 'https://randomuser.me/api/portraits/men/15.jpg' },
  { email: 'l.martinez@solveit.com',  url: 'https://randomuser.me/api/portraits/women/21.jpg' },
  { email: 'j.fernandez@solveit.com', url: 'https://randomuser.me/api/portraits/men/47.jpg' },
  { email: 's.jimenez@solveit.com',   url: 'https://randomuser.me/api/portraits/women/63.jpg' },
  { email: 'a.molina@solveit.com',    url: 'https://randomuser.me/api/portraits/men/28.jpg' },
  { email: 'p.lopez@solveit.com',     url: 'https://randomuser.me/api/portraits/men/52.jpg' },
  { email: 'a.sanchez@solveit.com',   url: 'https://randomuser.me/api/portraits/women/35.jpg' },
  { email: 'm.torres@solveit.com',    url: 'https://randomuser.me/api/portraits/men/61.jpg' },
  { email: 'i.ramirez@solveit.com',   url: 'https://randomuser.me/api/portraits/women/17.jpg' },
  { email: 'f.moreno@solveit.com',    url: 'https://randomuser.me/api/portraits/men/73.jpg' },
  { email: 'c.diaz@solveit.com',      url: 'https://randomuser.me/api/portraits/women/58.jpg' },
  { email: 'a.ruiz@solveit.com',      url: 'https://randomuser.me/api/portraits/men/39.jpg' },
  { email: 'l.gomez@solveit.com',     url: 'https://randomuser.me/api/portraits/women/82.jpg' },
  { email: 's.alvarez@solveit.com',   url: 'https://randomuser.me/api/portraits/men/84.jpg' },
  { email: 'm.ibanez@solveit.com',    url: 'https://randomuser.me/api/portraits/women/29.jpg' },
  { email: 'd.ortega@solveit.com',    url: 'https://randomuser.me/api/portraits/men/11.jpg' },
  { email: 'p.vargas@solveit.com',    url: 'https://randomuser.me/api/portraits/women/71.jpg' },
  { email: 'r.cano@solveit.com',      url: 'https://randomuser.me/api/portraits/men/66.jpg' },
];

async function run() {
  const client = await pool.connect();
  try {
    for (const p of photos) {
      await client.query(
        'UPDATE users SET profile_photo = $1 WHERE email = $2',
        [p.url, p.email]
      );
      console.log(`✓ ${p.email}`);
    }
    console.log('\n✅ Fotos de perfil asignadas');
  } finally {
    client.release();
    process.exit(0);
  }
}

run().catch(e => { console.error(e); process.exit(1); });
