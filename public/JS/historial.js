let graficaVentas = null;

const sucursalId = localStorage.getItem('sucursalId') || '1'; // valor por defecto si no está


const esMismaFecha = (fecha1, fecha2) => {
    return fecha1.getFullYear() === fecha2.getFullYear() &&
        fecha1.getMonth() === fecha2.getMonth() &&
        fecha1.getDate() === fecha2.getDate();
};

const formatoFecha = (fecha) => {
    const fechaStr = fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
    });
    return `${fechaStr}`;
};
const formatoHora = (fecha) => {
    const horaStr = fecha.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    return `${horaStr}`;
};

document.addEventListener('DOMContentLoaded', () => {
    const hoySpan = document.getElementById('hoy');
    const ayerSpan = document.getElementById('ayer');
    const ventasHoy = document.getElementById('ventasHoyBody');
    const ventasAyer = document.getElementById('ventasAyerBody');
    const tabHoy = document.getElementById('tabHoy');
    const tabAyer = document.getElementById('tabAyer');

    const hoy = new Date();
    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);



    hoySpan.textContent = formatoFecha(hoy);
    ayerSpan.textContent = formatoFecha(ayer);
    tabHoy.textContent = 'Hoy ' + formatoFecha(hoy);
    tabAyer.textContent = 'Ayer ' + formatoFecha(ayer);
    mostrarCargando();
    fetch('/api/historial?sucursal=${encodeURIComponent(sucursalId)}')
        .then(res => res.json())
        .then(data => {
            data.forEach((venta, index) => {
                const fechaVenta = new Date(venta.creado_en_iso);
                const fila = document.createElement('tr');
                fila.innerHTML = `
          <td>${venta.id}</td>
          <td>${formatoHora(fechaVenta)}</td>
          <td>${venta.nombre_usuario}</td>
          <td>Q ${parseFloat(venta.total).toFixed(2)}</td>
          <td>${venta.metodo_pago}</td>
          <td><button class="btn-detalle" data-venta-id="${venta.id}"><i class="fa-solid fa-list"></i> Detalle</button></td>
        `;
                console.log(fechaVenta, hoy);
                if (esMismaFecha(fechaVenta, hoy)) {
                    ventasHoy.appendChild(fila);

                } else if (esMismaFecha(fechaVenta, ayer)) {
                    ventasAyer.appendChild(fila);
                }
            });
        })
        .catch(err => {
            ocultarCargando();
            console.error('Error al cargar ventas:', err);
        });
    ocultarCargando();

    const modal = document.getElementById('modalDetalle');
    const tablaDetalleBody = modal.querySelector('tbody');
    const btnCerrar = document.getElementById('cerrarModal');

    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-detalle')) {
            const ventaId = e.target.getAttribute('data-venta-id');
            abrirModalDetalle(ventaId);
        }
    });

    btnCerrar.addEventListener('click', () => {
        modal.style.display = 'none';
        tablaDetalleBody.innerHTML = ''; // limpiar detalles previos
    });

    function abrirModalDetalle(ventaId) {
        mostrarCargando();
        document.getElementById('detalle-id-pedido').textContent = `#${ventaId}`;
        const sucursalId = localStorage.getItem('sucursalId');

        // Aquí haces fetch para obtener detalles de la venta
        fetch(`/api/historial/detalle_venta?venta_id=${ventaId}&sucursalId=${sucursalId}`)

            .then(res => res.json())
            .then(data => {
                tablaDetalleBody.innerHTML = ''; // limpiar tabla antes de llenarla

                if (data.length === 0) {
                    tablaDetalleBody.innerHTML = `<tr><td colspan="4">No hay detalles para esta venta</td></tr>`;
                } else {
                    data.forEach(item => {
                        const subtotal = parseFloat(item.cantidad) * parseFloat(item.precio_unitario);
                        const fila = document.createElement('tr');
                        fila.innerHTML = `
            <td>${item.nombre_producto || item.producto_id}</td>
            <td>${item.cantidad}</td>
            <td>Q ${parseFloat(item.precio_unitario).toFixed(2)}</td>
            <td>Q ${subtotal.toFixed(2)}</td>
          `;
                        tablaDetalleBody.appendChild(fila);
                    });
                }

                modal.style.display = 'flex';

            })
            .catch(err => {
                console.error('Error al cargar detalles:', err);
                tablaDetalleBody.innerHTML = `<tr><td colspan="4">Error cargando detalles</td></tr>`;
                modal.style.display = 'flex';
                ocultarCargando();
            });
        ocultarCargando();
    }


});
function mostrarTab(tab) {
    // Mostrar contenido correspondiente
    document.querySelectorAll('.contenido-tab').forEach(div => {
        div.classList.toggle('activo', div.id === 'tab-' + tab);
    });

    // Activar la pestaña correspondiente comparando con el ID
    document.querySelectorAll('.tab').forEach(btn => {
        btn.classList.toggle('active', btn.id === 'tab' + capitalize(tab));
    });
    filtrarUltimos7Dias();
}

function capitalize(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

let fechaInicio = null;
let fechaFin = null;
let totalGeneral = 0;

const picker = new Litepicker({
    element: document.getElementById('rangoFechas'),
    singleMode: false,
    numberOfMonths: 1,
    numberOfColumns: 1,
    format: 'YYYY-MM-DD',
    autoApply: true,
    setup: (picker) => {
        picker.on('selected', (start, end) => {
            fechaInicio = start.format('YYYY-MM-DD');
            fechaFin = end.format('YYYY-MM-DD');

        });
    }
});
function filtrarVentasPorFecha() {
    quitarClasesActivas('btnBuscar');
    const tbody = document.getElementById('filtradaBody');
    const canvas = document.getElementById('graficaVentas');
    tbody.innerHTML = '';
    if (!fechaInicio || !fechaFin) {
        mostrarNotificacion('Debe seleccionar ambas fechas', 'error');
        return;
    }

    mostrarCargando();
    fetch(`/api/historial/por-fechas?inicio=${fechaInicio}&fin=${fechaFin}&sucursalId=${encodeURIComponent(sucursalId)}`)
        .then(res => res.json())
        .then(data => {
            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3">No se encontraron ventas en este rango</td></tr>';
                document.getElementById('totalVentas').textContent = `Total: Q.0.00`;
                // Borra la gráfica anterior si existe
                if (graficaVentas) {
                    graficaVentas.destroy();
                    graficaVentas = null;
                }
                return;
            }

            // Agrupar ventas por fecha
            const ventasPorDia = {};

            data.forEach(venta => {
                const fila = document.createElement('tr');
                const total = parseFloat(venta.total) || 0;
                const fechaVenta = new Date(venta.creado_en_iso);
                const fechaStr = fechaVenta.toISOString().split('T')[0]; // yyyy-mm-dd

                ventasPorDia[fechaStr] = (ventasPorDia[fechaStr] || 0) + total;

                fila.innerHTML = `
          <td>${venta.id}</td>
          <td>${formatoFecha(fechaVenta) + " " + formatoHora(fechaVenta)}</td>
          <td>${venta.nombre_usuario}</td>
          <td>Q ${parseFloat(venta.total).toFixed(2)}</td>
          <td>${venta.metodo_pago}</td>
          <td><button class="btn-detalle" data-venta-id="${venta.id}"><i class="fa-solid fa-list"></i> Detalle</button></td>
        `;
                totalGeneral += parseFloat(venta.total);
                tbody.appendChild(fila);
            });
            document.getElementById('totalVentas').textContent = `Total: Q${totalGeneral.toFixed(2)}`;

            // Datos para la gráfica
            const etiquetas = Object.keys(ventasPorDia).sort();
            const valores = etiquetas.map(fecha => ventasPorDia[fecha]);

            // Si ya existe una gráfica, destrúyela antes de crear otra
            if (graficaVentas) {
                graficaVentas.destroy();
            }

            // Crear nueva gráfica
            graficaVentas = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: etiquetas,
                    datasets: [{
                        label: 'Ventas por día (Q)',
                        data: valores,
                        backgroundColor: '#ff6600',
                        //borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return `Q${context.parsed.y.toFixed(2)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Monto en Quetzales'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Fecha'
                            }
                        }
                    }
                }
            });
            ocultarCargando();
        })
        .catch(error => {
            console.error('Error al buscar ventas por fecha:', error);
            tbody.innerHTML = '<tr><td colspan="3">Error al cargar los datos</td></tr>';
            if (graficaVentas) {
                graficaVentas.destroy();
                graficaVentas = null;
            }
            ocultarCargando();
        });
    ocultarCargando();

}

function formatearFecha(fecha) {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function quitarClasesActivas(boton) {
    document.getElementById('btn7dias').classList.remove('activo');
    document.getElementById('btn30dias').classList.remove('activo');
    document.getElementById('btnBuscar').classList.remove('activo');

    document.getElementById(boton).classList.add('activo');

}

function filtrarUltimos7Dias() {
    const hoy = new Date();
    const hace7dias = new Date();
    hace7dias.setDate(hoy.getDate() - 6);

    fechaInicio = formatearFecha(hace7dias);
    fechaFin = formatearFecha(hoy);
    document.getElementById('rangoFechas').value = `${fechaInicio} - ${fechaFin}`;


    filtrarVentasPorFecha();
    quitarClasesActivas('btn7dias');
}

function filtrarUltimos30Dias() {
    const hoy = new Date();
    const hace30dias = new Date();
    hace30dias.setDate(hoy.getDate() - 29);

    fechaInicio = formatearFecha(hace30dias);
    fechaFin = formatearFecha(hoy);
    document.getElementById('rangoFechas').value = `${fechaInicio} - ${fechaFin}`;

    filtrarVentasPorFecha();
    quitarClasesActivas('btn30dias');
}
