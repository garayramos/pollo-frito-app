const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Ejemplo: obtener todos los productos del inventario
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM inventario');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
});

module.exports = router;