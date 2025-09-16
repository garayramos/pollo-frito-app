const express = require('express');
const router = express.Router();

const historialController = require('../controllers/historialController');

// Debe ser una función, no un objeto o algo más
router.get('/', historialController.obtenerHistorial);
router.get('/detalle_venta', historialController.obtenerDetalleVenta);  // <--- Esta debe existir
router.get('/por-fechas', historialController.obtenerVentasPorFechas);



module.exports = router;
