const pool = require('../conexion');
const bcrypt = require('bcryptjs');

// Función para login
const login = (req, res) => {
  const { usuario, contraseña } = req.body;

  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ mensaje: 'Error de conexión' });

    connection.query(
      'SELECT * FROM usuarios WHERE usuario = ? AND estado = TRUE',
      [usuario],
      (err, results) => {
        connection.release();

        if (err) return res.status(500).json({ mensaje: 'Error en la consulta' });

        if (results.length === 0) {
          return res.status(401).json({ mensaje: 'Usuario no encontrado o inactivo' });
        }

        const user = results[0];

        bcrypt.compare(contraseña, user.contraseña, (err, esValido) => {
          if (err) return res.status(500).json({ mensaje: 'Error verificando contraseña' });

          if (!esValido) {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
          }

          req.session.usuario = {
            id: user.id,
            usuario: user.usuario,
            nombre: user.nombre,
            rol: user.rol
          };

          // Login exitoso
          res.json({
            mensaje: 'Login exitoso',
            id: user.id,
            usuario: user.usuario,
            nombre: user.nombre,
            rol: user.rol
          });
        });
      }
    );
  });
};

// Función para registrar usuarios
const register = (req, res) => {
  const { nombre, usuario, correo, contraseña, rol } = req.body;

  if (!nombre || !usuario || !contraseña) {
    return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
  }

  // Validar rol (solo 'admin' o 'vendedor')
  const rolValido = ['admin', 'vendedor'].includes(rol) ? rol : 'vendedor';

  bcrypt.hash(contraseña, 10, (err, hash) => {
    if (err) return res.status(500).json({ mensaje: 'Error al encriptar contraseña' });

    pool.getConnection((err, connection) => {
      if (err) return res.status(500).json({ mensaje: 'Error de conexión' });

      const sql = 'INSERT INTO usuarios (nombre, usuario, correo, contraseña, rol) VALUES (?, ?, ?, ?, ?)';

      connection.query(sql, [nombre, usuario, correo || null, hash, rolValido], (err, results) => {
        connection.release();

        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ mensaje: 'El usuario ya existe' });
          }
          return res.status(500).json({ mensaje: 'Error al crear usuario' });
        }

        res.status(201).json({ mensaje: 'Usuario creado exitosamente' });
      });
    });
  });
};

module.exports = { login, register };
