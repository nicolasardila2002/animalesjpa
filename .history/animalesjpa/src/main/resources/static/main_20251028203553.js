const apiBase = "/gatos"

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("form-crear").addEventListener('submit', crearGato);
    document.getElementById("btn-cargar-gatos").addEventListener('click', cargarTodosLosGatos);
    document.getElementById("btn-buscar-nombre").addEventListener('click', buscarPorNombre);
    document.getElementById("btn-buscar-id").addEventListener('click', buscarPorId);
});

async function crearGato(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const npatas = document.getElementById('patas').value;
    const gato = {
        nombre,
        nPatas: parseInt(npatas)
    };

    try {
        const url = apiBase + '/guardar'
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-type': 'application/json'},
            body: JSON.stringify(gato)
        });
        if (response.ok) {
            alert('Gato creado exitosamente');
            document.getElementById('form-crear').reset();
            cargarTodosLosGatos();
        } else {
            alert('Error creando gato');
        }
    } catch (error) {
        console.error('Error al crear un gato: ', error);
    }
}

async function cargarTodosLosGatos() {
    try {
        const response = await fetch(apiBase);
        if (response.status === 204) {
            mostrarGatos([]);
            return;
        }
        const gatos = await response.json();
        mostrarGatos(gatos);
    } catch (error) {
        console.error("Error cargando gatos: ", error);
    }
}

async function buscarPorNombre() {
    const nombre = document.getElementById('buscar-nombre').value.trim();
    if (!nombre) {
        alert('Por favor ingresa un nombre');
        return;
    }

    try {
        const response = await fetch(`${apiBase}/buscar?nombre=${encodeURIComponent(nombre)}`);
        if (response.status === 204) {
            alert('No se encontraron gatos con ese nombre');
            mostrarGatos([]);
            return;
        }
        const gatos = await response.json();
        mostrarGatos(gatos);
    } catch (error) {
        console.error("Error buscando por nombre: ", error);
    }
}

async function buscarPorId() {
    const id = document.getElementById('buscar-id').value.trim();
    if (!id) {
        alert('Por favor ingresa un ID');
        return;
    }

    try {
        const response = await fetch(`${apiBase}/${id}`);
        if (response.status === 404) {
            alert('No se encontró un gato con ese ID');
            mostrarGatos([]);
            return;
        }
        const gato = await response.json();
        mostrarGatos([gato]);
    } catch (error) {
        console.error("Error buscando por ID: ", error);
    }
}

function mostrarGatos(gatos) {
    const listGatos = document.getElementById('gatos-list');

    listGatos.innerHTML = '';
    
    if (gatos.length === 0) {
        listGatos.innerHTML = '<li>No hay gatos para mostrar</li>';
        return;
    }

    gatos.forEach(gato => {
        const li = document.createElement('li');
        const nombre = gato.nombre;
        const npatas = gato.nPatas;
        li.innerHTML = `
            <span>${nombre} tiene ${npatas} patas (ID: ${gato.id})</span>
            <div>
                <button onclick="editarGato(${gato.id}, '${nombre}', ${npatas})">Editar</button>
                <button onclick="eliminarGato(${gato.id})">Eliminar</button>
            </div>
        `;
        listGatos.appendChild(li);
    });
}

async function eliminarGato(id) {
    if (!confirm('¿Estás seguro de eliminar este gato?')) {
        return;
    }

    try {
        const response = await fetch(`${apiBase}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok || response.status === 204) {
            alert('Gato eliminado exitosamente');
            cargarTodosLosGatos();
        } else if (response.status === 404) {
            alert('Gato no encontrado');
        } else {
            alert('Error eliminando gato');
        }
    } catch (error) {
        console.error('Error al eliminar gato: ', error);
        alert('Error al eliminar gato');
    }
}

async function editarGato(id, nombreActual, patasActual) {
    const nuevoNombre = prompt('Nuevo nombre (dejar vacío para no cambiar):', nombreActual);
    const nuevasPatas = prompt('Nuevo número de patas (dejar vacío para no cambiar):', patasActual);

    if (nuevoNombre === null && nuevasPatas === null) {
        return;
    }

    const gatoActualizado = {};
    
    if (nuevoNombre !== null && nuevoNombre.trim() !== '') {
        gatoActualizado.nombre = nuevoNombre.trim();
    }
    
    if (nuevasPatas !== null && nuevasPatas.trim() !== '') {
        gatoActualizado.nPatas = parseInt(nuevasPatas);
    }

    try {
        const response = await fetch(`${apiBase}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-type': 'application/json'},
            body: JSON.stringify(gatoActualizado)
        });

        if (response.ok) {
            alert('Gato actualizado exitosamente');
            cargarTodosLosGatos();
        } else if (response.status === 404) {
            alert('Gato no encontrado');
        } else {
            alert('Error actualizando gato');
        }
    } catch (error) {
        console.error('Error al actualizar gato: ', error);
        alert('Error al actualizar gato');
    }
}