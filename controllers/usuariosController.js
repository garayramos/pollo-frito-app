const pool = require('../conexion'); // conexión a MySQL
const bcrypt = require('bcryptjs');


// Obtener todos los usuarios
exports.obtenerUsuarios = (req, res) => {
    const query = 'SELECT id, nombre, usuario, correo, rol, estado, creado_en FROM usuarios ORDER BY nombre ASC';

    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener usuarios:', error);
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        res.json(results);
    });
};

// Obtener un usuario por ID
exports.obtenerUsuarioPorId = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT id, nombre, correo, rol FROM usuarios WHERE id = ?';

    pool.query(query, [id], (error, results) => {
        if (error) {
            console.error('Error al obtener usuario:', error);
            return res.status(500).json({ error: 'Error al obtener usuario' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(results[0]);
    });
};

//CREAR NUEVO USUARIO

exports.crearUsuario = (req, res) => {
    const { nombre, usuario, correo, contrasena, rol, estado } = req.body;

    if (!nombre || !usuario || !contrasena || !rol) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Hashear la contraseña antes de guardarla
    bcrypt.hash(contrasena, 10, (err, hash) => {
        if (err) {
            console.error('Error al hashear la contraseña:', err);
            return res.status(500).json({ error: 'Error al procesar la contraseña' });
        }

        const query = 'INSERT INTO usuarios (nombre, usuario, correo, contraseña, rol, estado) VALUES (?, ?, ?, ?, ?, ?)';
        pool.query(query, [nombre, usuario, correo, hash, rol, estado], (error, result) => {
            if (error) {
                console.error('Error al crear usuario:', error);
                return res.status(500).json({ error: 'Error al crear usuario' });
            }
            res.status(201).json({ mensaje: 'Usuario creado', id: result.insertId });
        });
    });
};


// Actualizar un usuario
exports.actualizarUsuario = (req, res) => {
    const { id } = req.params;
    const { nombre, correo, rol } = req.body;

    const query = 'UPDATE usuarios SET nombre = ?, correo = ?, rol = ? WHERE id = ?';
    pool.query(query, [nombre, correo, rol, id], (error) => {
        if (error) {
            console.error('Error al actualizar usuario:', error);
            return res.status(500).json({ error: 'Error al actualizar usuario' });
        }
        res.json({ mensaje: 'Usuario actualizado' });
    });
};

// Eliminar un usuario
exports.eliminarUsuario = (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM usuarios WHERE id = ?';
    pool.query(query, [id], (error) => {
        if (error) {
            console.error('Error al eliminar usuario:', error);
            return res.status(500).json({ error: 'Error al eliminar usuario' });
        }
        res.json({ mensaje: 'Usuario eliminado' });
    });
};
