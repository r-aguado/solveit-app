const pool = require('./src/db');

async function run() {
  const client = await pool.connect();
  try {
    const incidents = await client.query('SELECT id, status, priority FROM incidents ORDER BY id');
    const rows = incidents.rows;

    // Distribuye incidencias en los últimos 60 días de forma realista
    const now = new Date();

    const schedule = [
      // id offset, createdDaysAgo, resolvedHoursAfterCreate (null si no resuelta)
      { daysAgo: 58, resolvedHours: 3  },   // crítica resuelta rápido
      { daysAgo: 52, resolvedHours: 6  },   // alta resuelta en SLA
      { daysAgo: 45, resolvedHours: 18 },   // media resuelta en SLA
      { daysAgo: 40, resolvedHours: 2  },   // alta resuelta muy rápido
      { daysAgo: 35, resolvedHours: 22 },   // media resuelta en SLA
      { daysAgo: 28, resolvedHours: null },  // en progreso
      { daysAgo: 21, resolvedHours: null },  // abierta
      { daysAgo: 18, resolvedHours: null },  // abierta
      { daysAgo: 14, resolvedHours: 5  },   // alta resuelta en SLA
      { daysAgo: 7,  resolvedHours: 30 },   // media resuelta fuera de SLA (realismo)
    ];

    for (let i = 0; i < rows.length; i++) {
      const inc = rows[i];
      const s = schedule[i % schedule.length];

      const createdAt = new Date(now);
      createdAt.setDate(createdAt.getDate() - s.daysAgo);
      // Hora de trabajo aleatoria entre 8:00 y 17:00
      createdAt.setHours(8 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60), 0, 0);

      let resolvedAt = null;
      if (inc.status === 'resolved' && s.resolvedHours !== null) {
        resolvedAt = new Date(createdAt.getTime() + s.resolvedHours * 3600 * 1000);
      }

      await client.query(
        `UPDATE incidents SET created_at = $1, updated_at = $1, resolved_at = $2 WHERE id = $3`,
        [createdAt, resolvedAt, inc.id]
      );
    }

    console.log(`✓ Fechas actualizadas para ${rows.length} incidencias`);
    console.log('✅ Listo');
  } finally {
    client.release();
    process.exit(0);
  }
}

run().catch(e => { console.error(e); process.exit(1); });
