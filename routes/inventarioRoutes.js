const express = require('express');
const router = express.Router();
const { agregarStock } = require('./controllers/inventarioController');

// Solo pones la parte relativa a la ruta
router.post('/agregar', agregarStock);

module.exports = router;
