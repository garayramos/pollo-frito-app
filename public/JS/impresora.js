const impresorasSelect = document.getElementById('impresorasSelect');
const guardarBtn = document.getElementById('guardarImpresoraBtn');
const mensajeDiv = document.getElementById('mensaje');

// Cargar impresoras desde backend
async function cargarImpresoras() {
    try {
        const res = await fetch('/api/impresoras'); // endpoint que listará impresoras disponibles
        const impresoras = await res.json();

        impresorasSelect.innerHTML = '';
        impresoras.forEach(p => {
            const option = document.createElement('option');
            option.value = p.name;
            option.textContent = p.name;
            impresorasSelect.appendChild(option);
        });

        // Seleccionar la impresora previamente guardada si existe
        const impresoraGuardada = localStorage.getItem('impresora');
        if (impresoraGuardada) {
            impresorasSelect.value = impresoraGuardada;
        }

    } catch (err) {
        console.error(err);
        impresorasSelect.innerHTML = '<option value="">No se pudieron cargar impresoras</option>';
    }
}

// Guardar selección en localStorage
guardarBtn.addEventListener('click', () => {
    const seleccion = impresorasSelect.value;
    if (!seleccion) {
        mostrarNotificacion('Selecciona una impresora antes de guardar','error');
        return;
    }
    localStorage.setItem('impresora', seleccion);
   mostrarNotificacion(`Impresora "${seleccion}" guardada correctamente`,'exito');
});

// Inicializar
cargarImpresoras();
