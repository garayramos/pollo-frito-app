document.addEventListener('DOMContentLoaded', () => {
    fetch('../navbar.html') // <- subimos un nivel desde la carpeta JS
        .then(res => res.text())
        .then(data => {
            document.getElementById('navbar').innerHTML = data;
            const currentPage = location.pathname.split("/").pop();
            document.querySelectorAll("#navbar a").forEach(link => {
                if (link.getAttribute("href") === currentPage) {
                    link.classList.add("active");
                }
            });

            const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
            const userNameSpan = document.getElementById('userName');
            const btnLogout = document.getElementById('btnLogout');

            if (userNameSpan) {
                userNameSpan.textContent = usuarioActual?.nombre || 'Invitado';
            }

            if (btnLogout) {
                btnLogout.addEventListener('click', () => {
                    const overlay = document.getElementById('logoutOverlay');
                    overlay.classList.remove('hidden');
                });
            }
            const confirmLogout = document.getElementById('confirmLogout');
            const cancelLogout = document.getElementById('cancelLogout');

            if (confirmLogout && cancelLogout) {
                confirmLogout.addEventListener('click', () => {
                    localStorage.removeItem('usuarioActual');
                    window.location.href = '/logout';
                });

                cancelLogout.addEventListener('click', () => {
                    const overlay = document.getElementById('logoutOverlay');
                    overlay.classList.add('hidden');
                });
            }
            if (usuarioActual.rol === 'vendedor') {
                const adminOnlyLinks = ['linkProductos', 'linkUsuarios', 'linkConfiguracion'];
                adminOnlyLinks.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.classList.add('oculto');  // o el.classList.add('oculto');
                });
            }
            // Crear el banner si no existe
            if (!document.getElementById('bannerFijo')) {
                const banner = document.createElement('div');
                banner.id = 'bannerFijo';
                document.body.appendChild(banner);
            }

            //Texto al Banner
            const banner = document.getElementById('bannerFijo');
            const textoGuardado = "Sucursal: " + localStorage.getItem('sucursalNombre'); // usa la clave que tengas

            banner.textContent = textoGuardado || "------------";

            // Evento de clic para mostrar confirmación
            banner.addEventListener('click', () => {

                const overlay = document.getElementById('bannerOverlay');
                overlay.classList.remove('hidden');

                const confirmSucursal = document.getElementById('confirmSucursal');
                const cancelSucursal = document.getElementById('cancelSucursal');

                if (confirmSucursal && cancelSucursal) {
                    confirmSucursal.addEventListener('click', () => {
                        window.location.href = '/selectSucursal.html';
                    });

                    cancelSucursal.addEventListener('click', () => {
                        const overlay = document.getElementById('bannerOverlay');
                        overlay.classList.add('hidden');
                    });
                }
            });

        })
        .catch(err => {
            console.error('Error al cargar navbar:', err);
        });

});
