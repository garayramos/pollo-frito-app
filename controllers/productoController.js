const pool = require('../conexion');

// Obtener producto por ID
const obtenerProductoPorId = (req, res) => {
  const { id } = req.params;
  pool.query('SELECT * FROM productos WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ mensaje: 'Error al obtener producto' });
    if (results.length === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(results[0]);
  });
};

// Obtener todos los productos activos
const obtenerProductos = (req, res) => {
  const sucursalId = req.query.sucursal;

  pool.query('SELECT * FROM productos WHERE sucursal_id = ?', [sucursalId], (err, results) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      return res.status(500).json({ mensaje: 'Error al obtener productos' });
    }
    res.json(results);
  });
};

// Crear nuevo producto
const crearProducto = (req, res) => {
  const { nombre, descripcion, precio, stock, categoria, imagen, stock_minimo, sucursal } = req.body;
  if (!nombre || !precio || stock || sucursal === undefined) {
    return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
  }

  const sql = 'INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagen, stock_minimo, sucursal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  pool.query(sql, [nombre, descripcion || null, precio, stock, categoria || null, imagen || null, stock_minimo, sucursal], (err, results) => {
    if (err) return res.status(500).json({ mensaje: 'Error al crear producto' });
    res.status(201).json({ mensaje: 'Producto creado', id: results.insertId });
  });
};

// Actualizar producto
const actualizarProducto = (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock, categoria, activo, imagen, stock_minimo, sucursal } = req.body;
  console.log('ID:', id);
  const sql = `UPDATE productos 
               SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ?, activo = ?, imagen = ?,
               stock_minimo = ?, sucursal = ? WHERE id = ?`;
  pool.query(sql, [nombre, descripcion, precio, stock, categoria, activo, imagen, stock_minimo, sucursal, id], (err, results) => {
    if (err) return res.status(500).json({ mensaje: 'Error al actualizar producto' });
    if (results.affectedRows === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto actualizado' });
  });
};

// Eliminar producto (en vez de borrado físico, mejor marcar como inactivo)
const eliminarProducto = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM productos WHERE id = ?';
  pool.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ mensaje: 'Error al eliminar producto' });
    if (results.affectedRows === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado' });
  });
};


// Cambiar estado activo/inactivo
const cambiarEstadoProducto = (req, res) => {
  const { id } = req.params;
  const { activo } = req.body; // true o false
  console.log(`Cambiar estado producto id=${id}, nuevo estado: ${activo}`);

  const sql = 'UPDATE productos SET activo = ? WHERE id = ?';
  pool.query(sql, [activo, id], (err, results) => {
    if (err) return res.status(500).json({ mensaje: 'Error al cambiar estado del producto' });
    if (results.affectedRows === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    const estado = activo ? 'activado' : 'desactivado';
    res.json({ mensaje: `Producto ${estado} correctamente` });
  });
};


module.exports = {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerProductoPorId,
  cambiarEstadoProducto,
};
