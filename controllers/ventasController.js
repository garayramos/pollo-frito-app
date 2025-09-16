const pool = require('../conexion');

exports.finalizarVenta = (req, res) => {
  const { productos, total, metodo_pago, usuario_id, sucursal_id } = req.body;

  pool.getConnection((err, conn) => {
    if (err) {
      console.error('Error al obtener conexión:', err);
      return res.status(500).json({ success: false, message: 'Error de conexión' });
    }

    conn.beginTransaction(err => {
      if (err) {
        console.error('Error al iniciar transacción:', err);
        conn.release();
        return res.status(500).json({ success: false, message: 'Error iniciando transacción' });
      }

      const sqlInsertVenta = 'INSERT INTO ventas (usuario_id, total, metodo_pago, sucursal_id) VALUES (?, ?, ?, ?)';
      conn.query(sqlInsertVenta, [usuario_id, total, metodo_pago, sucursal_id], (err, ventaResult) => {
        if (err) {
            console.error('Error insertando venta:', err);
          return conn.rollback(() => {
            conn.release();
            res.status(500).json({ success: false, message: 'Error insertando venta', error: err.message });
          });
        }

        const venta_id = ventaResult.insertId;

        // Función para insertar detalles de forma secuencial
        const insertarDetalle = (index) => {
          if (index >= productos.length) {
            // Todos los detalles insertados, commit
            return conn.commit(err => {
              if (err) {
                console.error('Error haciendo commit:', err);
                return conn.rollback(() => {
                  conn.release();
                  res.status(500).json({ success: false, message: 'Error en commit' });
                });
              }
              conn.release();
              res.json({ success: true, venta_id });
            });
          }

          const item = productos[index];
          const sqlInsertDetalle = 'INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, sucursal_id) VALUES (?, ?, ?, ?, ?)';
          const sqlActualizarStock = 'UPDATE productos SET stock = stock - ? WHERE id = ?';

          conn.query(sqlInsertDetalle, [venta_id, item.producto_id, item.cantidad, item.precio_unitario, sucursal_id], (err) => {
            if (err) {
                console.error('Error insertando detalle:', err);
              return conn.rollback(() => {
                conn.release();
                res.status(500).json({ success: false, message: 'Error insertando detalle', error: err.message });
              });
            }

            conn.query(sqlActualizarStock, [item.cantidad, item.producto_id], (err) => {
              if (err) {
                console.error('Error actualizando stock:', err);
                return conn.rollback(() => {
                  conn.release();
                  res.status(500).json({ success: false, message: 'Error actualizando stock', error: err.message });
                });
              }

              // Llamar recursivamente para el siguiente detalle
              insertarDetalle(index + 1);
            });
          });
        };

        insertarDetalle(0);
      });
    });
  });
};
