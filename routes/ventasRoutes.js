const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');

router.post('/finalizar', ventasController.finalizarVenta); // Esta función debe existir y ser una función

module.exports = router;
