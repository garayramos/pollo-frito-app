document.addEventListener('DOMContentLoaded', () => {

    const apiUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api/usuarios'
        : 'https://pollo-frito-app.onrender.com/api/usuarios';


    const tabla = document.querySelector('#usuariosTable tbody');
    const form = document.getElementById('usuarioForm');

    async function cargarUsuarios() {
        try {
            mostrarCargando();
            const res = await fetch(apiUrl);
            const usuarios = await res.json();
            tabla.innerHTML = '';

            usuarios.forEach(u => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${u.nombre}</td>
                    <td>${u.usuario}</td>
                    <td>${u.correo || ''}</td>
                    <td>${u.rol}</td>
                    <td>
                        <input type="checkbox" class="toggle-estado" data-id="${u.id}" ${u.estado ? 'checked' : ''}>
                    </td>
                    <td>${new Date(u.creado_en).toLocaleString()}</td>
                    <td>
                        <button onclick="editarUsuario(${u.id})">Editar</button>
                        <button onclick="eliminarUsuario(${u.id})">Eliminar</button>
                    </td>
                `;
                tabla.appendChild(tr);
            });

            asignarListenersToggle();
            ocultarCargando();
        } catch (err) {
            mostrarNotificacion('Error al cargar usuarios', 'error');
        }
    }

    async function editarUsuario(id) {
        try {
            const res = await fetch(`${apiUrl}/${id}`);
            const u = await res.json();
            document.getElementById('usuarioId').value = u.id;
            document.getElementById('nombre').value = u.nombre;
            document.getElementById('usuario').value = u.usuario;
            document.getElementById('correo').value = u.correo || '';
            document.getElementById('contrasena').value = '';
            document.getElementById('rol').value = u.rol;
            document.getElementById('estado').value = u.estado ? 'true' : 'false';
        } catch {
            mostrarNotificacion('Error al cargar el usuario', 'error');
        }
    }

    async function eliminarUsuario(id) {
        if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;
        try {
            const res = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
            const data = await res.json();
            mostrarNotificacion(data.mensaje || 'Usuario eliminado');
            cargarUsuarios();
        } catch {
            mostrarNotificacion('Error al eliminar usuario', 'error');
        }
    }

    function asignarListenersToggle() {
        document.querySelectorAll('.toggle-estado').forEach(checkbox => {
            checkbox.addEventListener('change', async () => {
                const id = checkbox.dataset.id;
                const estado = checkbox.checked;
                try {
                    await fetch(`${apiUrl}/${id}/estado`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ estado })
                    });
                    mostrarNotificacion('Estado actualizado');
                } catch {
                    mostrarNotificacion('Error al actualizar estado', 'error');
                    checkbox.checked = !estado;
                }
            });
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('usuarioId').value;
        const nombre = document.getElementById('nombre').value.trim();
        const usuario = document.getElementById('usuario').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const contrasena = document.getElementById('contrasena').value;
        const rol = document.getElementById('rol').value;
        const estado = document.getElementById('estado').value === 'true';

        if (!nombre || !usuario || !contrasena) {
            mostrarNotificacion('Faltan campos requeridos', 'error');
            return;
        }

        const url = id ? `${apiUrl}/${id}` : apiUrl;
        const metodo = id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, usuario, correo, contrasena, rol, estado })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.mensaje);
            mostrarNotificacion(data.mensaje || 'Guardado exitoso');
            form.reset();
            document.getElementById('usuarioId').value = '';
            cargarUsuarios();
        } catch (error) {
            mostrarNotificacion(error.message || 'Error guardando usuario', 'error');
        }
    });

    document.getElementById('buscadorUsuarios').addEventListener('input', (e) => {
        const filtro = e.target.value.toLowerCase();
        document.querySelectorAll('#usuariosTable tbody tr').forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(filtro) ? '' : 'none';
        });
    });

    function mostrarCargando() {
        document.getElementById('pantalla-cargando')?.classList.remove('oculto');
    }

    function ocultarCargando() {
        document.getElementById('pantalla-cargando')?.classList.add('oculto');
    }

    function mostrarNotificacion(mensaje, tipo = 'exito', duracion = 3000) {
        const noti = document.getElementById('notificacion');
        if (!noti) return;
        noti.textContent = mensaje;
        noti.className = `notificacion ${tipo}`;
        noti.classList.remove('oculto');
        setTimeout(() => noti.classList.add('oculto'), duracion);
    }

    cargarUsuarios();

    // También expone editarUsuario y eliminarUsuario si usas botones inline con onclick
    window.editarUsuario = editarUsuario;
    window.eliminarUsuario = eliminarUsuario;
});
