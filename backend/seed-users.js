const pool = require('./src/db');
const bcrypt = require('bcryptjs');

async function seedUsers() {
  const client = await pool.connect();
  try {
    const passwordHash = await bcrypt.hash('password', 10);
    const adminHash = await bcrypt.hash('admin1234', 10);

    const users = [
      { name: 'Admin SolveIT', email: 'admin@solveit.com', password: adminHash, role: 'admin', department: '' },
      { name: 'Carlos García', email: 'tecnico1@solveit.com', password: passwordHash, role: 'technician', department: 'IT' },
      { name: 'Laura Martínez', email: 'tecnico2@solveit.com', password: passwordHash, role: 'technician', department: 'Sistemas' },
      { name: 'Pedro López', email: 'usuario1@solveit.com', password: passwordHash, role: 'user', department: 'RRHH' },
      { name: 'Ana Sánchez', email: 'usuario2@solveit.com', password: passwordHash, role: 'user', department: 'Contabilidad' },
      { name: 'Miguel Torres', email: 'usuario3@solveit.com', password: passwordHash, role: 'user', department: 'Ventas' },
      { name: 'Rubén Aguado Perulero', email: 'r.aguado@solveit.com', password: passwordHash, role: 'user', department: 'IT' },
    ];

    for (const u of users) {
      await client.query(`
        INSERT INTO users (name, email, password, role, department)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO NOTHING
      `, [u.name, u.email, u.password, u.role, u.department]);
      console.log(`✓ ${u.name} (${u.email})`);
    }

    console.log('\nUsuarios migrados correctamente');
  } finally {
    client.release();
    process.exit(0);
  }
}

seedUsers().catch(e => { console.error(e); process.exit(1); });
