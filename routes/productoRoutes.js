const express = require('express');
const router = express.Router();
const {
    obtenerProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    obtenerProductoPorId,
    cambiarEstadoProducto,
} = require('../controllers/productoController');

const verificarSesion = require('../middlewares/authMiddleware');
router.use(verificarSesion);


router.get('/', obtenerProductos);
router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);
router.get('/:id', obtenerProductoPorId);
router.put('/:id/estado', cambiarEstadoProducto);

module.exports = router;
