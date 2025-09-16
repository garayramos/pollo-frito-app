// middlewares/authMiddleware.js
const rutasPublicas = ['/login', '/register', '/error.html', '/css/', '/js/', '/img/'];

function verificarSesion(req, res, next) {
    const url = req.originalUrl;

    const esRutaPublica = rutasPublicas.some(ruta => url.startsWith(ruta));

    if (esRutaPublica || (req.session && req.session.usuario)) {
        return next();
    } else {
        return res.redirect('/error.html');
    }
}

module.exports = verificarSesion;
