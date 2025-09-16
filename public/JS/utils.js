function mostrarNotificacion(mensaje, tipo = 'exito', duracion = 3000) {
    const noti = document.getElementById('notificacion');
    noti.textContent = mensaje;
    noti.className = `notificacion ${tipo}`;
    noti.classList.remove('oculto');

    setTimeout(() => {
        noti.classList.add('oculto');
    }, duracion);
}

function mostrarCargando() {
    document.getElementById('pantalla-cargando').classList.remove('oculto');
}
function ocultarCargando() {
    document.getElementById('pantalla-cargando').classList.add('oculto');
}
