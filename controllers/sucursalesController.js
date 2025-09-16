// controllers/sucursalesController.js
const pool = require('../conexion'); // conexión a la base de datos

exports.obtenerSucursales = (req, res) => {
    const query = 'SELECT id, nombre, direccion FROM sucursales ORDER BY nombre ASC';

    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener sucursales:', error);
            return res.status(500).json({ error: 'Error al obtener sucursales' });
        }
        // ✅ results es un array de objetos
        res.json(results);
    });
};
