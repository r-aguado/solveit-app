const app = require('./src/app');
const init = require('./src/db/init');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

init().then(() => {
  app.listen(PORT, () => {
    console.log(`SolveIT API corriendo en http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Error al inicializar la base de datos:', err);
  process.exit(1);
});
