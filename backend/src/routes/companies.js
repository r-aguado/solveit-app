const express = require('express');
const router = express.Router();
const { verifyToken, verifySuperAdmin } = require('../middleware/auth');
const {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  toggleCompanyActive
} = require('../controllers/companiesController');

// Todas las rutas de empresas requieren autenticación y rol superadmin
router.use(verifyToken);
router.use(verifySuperAdmin);

// GET - Listar todas las empresas
router.get('/', getCompanies);

// POST - Crear nueva empresa
router.post('/', createCompany);

// GET - Obtener empresa específica
router.get('/:id', getCompanyById);

// PATCH - Actualizar empresa
router.patch('/:id', updateCompany);

// PATCH - Activar/desactivar empresa
router.patch('/:id/active', toggleCompanyActive);

module.exports = router;
