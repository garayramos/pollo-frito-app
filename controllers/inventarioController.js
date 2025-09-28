const pool = require('../conexion');

// Agregar stock a un producto
const agregarStock = (req, res) => {
    const { productoId, cantidad, motivo, sucursalId, usuarioId } = req.body;

    if (!productoId || !cantidad || !sucursalId || !usuarioId) {
        return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
    }

    // Primero, actualizar el stock en productos
    const sqlUpdateStock = 'UPDATE productos SET stock = stock + ? WHERE id = ? AND sucursal_id = ?';
    pool.query(sqlUpdateStock, [cantidad, productoId, sucursalId], (err, results) => {
        if (err) return res.status(500).json({ mensaje: 'Error al actualizar stock', error: err });
        if (results.affectedRows === 0) return res.status(404).json({ mensaje: 'Producto no encontrado en esa sucursal' });

        // Luego, registrar movimiento en inventario
        const sqlInsertInventario = `INSERT INTO inventario 
      (producto_id, sucursal_id, tipo_movimiento, cantidad, motivo, creado_por)
      VALUES (?, ?, 'entrada', ?, ?, ?)`;
        pool.query(sqlInsertInventario, [productoId, sucursalId, cantidad, motivo || null, usuarioId], (err2) => {
            if (err2) return res.status(500).json({ mensaje: 'Error al registrar movimiento', error: err2 });
            res.json({ mensaje: 'Stock agregado correctamente' });
        });
    });
};

module.exports = { agregarStock };
