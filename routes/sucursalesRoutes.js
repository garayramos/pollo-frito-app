// routes/sucursalesRoutes.js
const express = require('express');
const router = express.Router();
const { obtenerSucursales } = require('../controllers/sucursalesController');

// Ruta para obtener sucursales
router.get('/', obtenerSucursales);

module.exports = router;
