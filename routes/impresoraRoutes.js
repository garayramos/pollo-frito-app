const express = require('express');
const router = express.Router();
const { listarImpresoras, imprimirTicket } = require('../controllers/impresoraController');

router.get('/impresoras', listarImpresoras);
router.post('/impresoras/imprimir', imprimirTicket);

module.exports = router;
