const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware de sesión
app.use(session({
  secret: 'tu_clave_secreta',
  resave: false,
  saveUninitialized: false,
}));

// Middleware para parsear JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/public', express.static(path.join(__dirname, 'public')));




// 👉 Rutas que deben ser públicas (antes del middleware)
app.use('/api', require('./routes/authRoutes'));
app.get('/error.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'error.html'));
});

// 👉 Middleware de autenticación (se aplica a todo lo que está después)
const verificarSesion = require('./middlewares/authMiddleware');
app.use(verificarSesion);

// ✅ Rutas protegidas
app.use('/api/productos', require('./routes/productoRoutes'));
app.use('/api/ventas', require('./routes/ventasRoutes'));
app.use('/api/historial', require('./routes/historialRoutes'));
app.use('/api/usuarios', require('./routes/usuariosRoutes'));
app.use('/api/sucursales', require('./routes/sucursalesRoutes'));


app.get('/productos.html', verificarSesion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'productos.html'));
});

app.get('/venta.html', verificarSesion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'venta.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/navbar.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'navbar.html'));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/historial.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'historial.html'));
});

app.get('/usuarios.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'usuarios.html'));
});

app.get('/selectSucursal.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'selectSucursal.html'));
});



// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log('Error al cerrar sesión:', err);
      return res.redirect('/login.html'); // Si falla, vuelve a productos
    }

    res.clearCookie('connect.sid'); // Esto sí va en el servidor
    res.redirect('/login.html'); // Redirige al login
  });
});

