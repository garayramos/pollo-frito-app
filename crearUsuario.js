const pool = require('./conexion');
const bcrypt = require('bcryptjs');

const nombre = 'Administrador Principal';
const usuario = 'admin';
const correo = 'admin@pollofrito.com';
const password = 'admin123';
const rol = 'admin'; // Usar 'admin' o 'vendedor'

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;

  pool.getConnection((err, connection) => {
    if (err) throw err;

    connection.query(
      'INSERT INTO usuarios (nombre, usuario, correo, contraseña, rol) VALUES (?, ?, ?, ?, ?)',
      [nombre, usuario, correo, hash, rol],
      (err, results) => {
        connection.release();

        if (err) throw err;

        console.log('✅ Usuario creado exitosamente');
        process.exit();
      }
    );
  });
});