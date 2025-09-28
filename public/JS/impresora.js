
const impresorasSelect = document.getElementById('impresorasSelect');
const guardarBtn = document.getElementById('guardarImpresoraBtn');

async function cargarImpresoras() {
  try {
    const res = await fetch('/api/impresoras');
    const impresoras = await res.json();

    impresorasSelect.innerHTML = '';
    impresoras.forEach(p => {
      const option = document.createElement('option');
      option.value = p;
      option.textContent = p;
      impresorasSelect.appendChild(option);
    });

    const impresoraGuardada = localStorage.getItem('impresora');
    if (impresoraGuardada) impresorasSelect.value = impresoraGuardada;
  } catch (err) {
    console.error(err);
    mostrarNotificacion('No se pudieron cargar las impresoras', 'error');
  }
}

guardarBtn.addEventListener('click', () => {
  const seleccion = impresorasSelect.value;
  if (!seleccion) {
    mostrarNotificacion('Selecciona una impresora antes de guardar', 'error');
    return;
  }
  localStorage.setItem('impresora', seleccion);
  mostrarNotificacion(`Impresora "${seleccion}" guardada correctamente`, 'exito');
});

// Inicializar
cargarImpresoras();
