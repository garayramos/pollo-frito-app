const pool = require('../conexion');

exports.obtenerHistorial = (req, res) => {
    const sucursalId = req.query.sucursalId; // 👈 lo traemos del frontend
    

    const query = `
        SELECT 
            v.*, 
            u.nombre AS nombre_usuario,
            DATE_FORMAT(v.creado_en, '%Y-%m-%dT%H:%i:%sZ') AS creado_en_iso
        FROM ventas v
        JOIN usuarios u ON v.usuario_id = u.id
        WHERE v.sucursal_id = ?
        AND v.creado_en >= DATE_SUB(CURDATE(), INTERVAL 2 DAY)
        AND v.creado_en < DATE_ADD(CURDATE(), INTERVAL 2 DAY)
        ORDER BY v.creado_en DESC;

    `;

    pool.query(query, [sucursalId], (error, results) => {
        if (error) {
            console.error('Error al obtener historial:', error);
            res.status(500).json({ error: 'Error al obtener historial de ventas' });
        } else {
            res.json(results);
        }
    });
};

exports.obtenerDetalleVenta = (req, res) => {
    const sucursalId = req.query.sucursalId;
    const ventaId = parseInt(req.query.venta_id, 10);

    if (!ventaId) {
        return res.status(400).json({ error: 'Parámetro venta_id es requerido y debe ser numérico' });
    }

    const query = `
    SELECT dv.*, p.nombre AS nombre_producto
    FROM detalle_ventas dv
    JOIN productos p ON dv.producto_id = p.id
    WHERE dv.venta_id = ?
    AND dv.sucursal_id = ?
  `;

    pool.query(query, [ventaId, sucursalId], (error, results) => {
        if (error) {
            console.error('Error al obtener detalle de venta:', error);
            return res.status(500).json({ error: 'Error al obtener detalle de venta' });
        }

        res.json(results);
    });
};

exports.obtenerVentasPorFechas = (req, res) => {
    const sucursalId = req.query.sucursalId; // 👈 lo traemos del frontend

    const { inicio, fin } = req.query;

    if (!inicio || !fin) {
        return res.status(400).json({ error: 'Parámetros inicio y fin son requeridos' });
    }

    const query = `
        SELECT 
            v.*, 
            u.nombre AS nombre_usuario,
            DATE_FORMAT(v.creado_en, '%Y-%m-%dT%H:%i:%sZ') AS creado_en_iso
        FROM ventas v
        JOIN usuarios u ON v.usuario_id = u.id
        WHERE DATE(v.creado_en) BETWEEN ? AND ?
        AND v.sucursal_id = ?
        ORDER BY v.creado_en DESC;
    `;

    pool.query(query, [inicio, fin, sucursalId], (error, results) => {
        if (error) {
            console.error('Error al obtener ventas por fechas:', error);
            res.status(500).json({ error: 'Error al obtener ventas por fechas' });
        } else {
            res.json(results);
        }
    });
};
