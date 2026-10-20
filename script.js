// El arreglo es la fuente de datos principal de la galería.
let fotos = [];

const CLAVE_LOCAL = 'fototeca-fotos-v1';
const FOTOS_INICIALES = [
  { id: 'demo-1', titulo: 'Mañana entre montañas', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85', categoria: 'Naturaleza', descripcion: 'La primera luz del día sobre un paisaje tranquilo.', valoracion: 5 },
  { id: 'demo-2', titulo: 'Ritmo de la ciudad', url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85', categoria: 'Ciudad', descripcion: 'Ventanas encendidas cuando cae la tarde.', valoracion: 4 },
  { id: 'demo-3', titulo: 'Un rincón con historia', url: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=900&q=85', categoria: 'Arquitectura', descripcion: 'Líneas, luz y detalles que invitan a mirar dos veces.', valoracion: 5 }
];

// Reunimos los elementos de la página una sola vez para reutilizarlos.
const formulario = document.querySelector('#photo-form');
const campoTitulo = document.querySelector('#photo-title');
const campoUrl = document.querySelector('#photo-url');
const campoArchivo = document.querySelector('#photo-file');
const campoCategoria = document.querySelector('#photo-category');
const campoDescripcion = document.querySelector('#photo-description');
const campoValoracion = document.querySelector('#photo-rating');
const mensajeFormulario = document.querySelector('#form-message');
const botonGuardar = document.querySelector('#submit-button');
const botonCancelar = document.querySelector('#cancel-edit');
const cuadricula = document.querySelector('#photo-grid');
const dialogoImagen = document.querySelector('#image-dialog');
const imagenAmpliada = document.querySelector('#image-dialog-photo');
const tituloImagenAmpliada = document.querySelector('#image-dialog-title');
const botonCerrarImagen = document.querySelector('#close-image-dialog');
const botonFotoAnterior = document.querySelector('#previous-image');
const botonFotoSiguiente = document.querySelector('#next-image');
const estadoVacio = document.querySelector('#empty-state');
const campoBusqueda = document.querySelector('#search-input');
const filtroCategoria = document.querySelector('#category-filter');
const totalFotos = document.querySelector('#total-photos');
const promedioValoracion = document.querySelector('#average-rating');
const fotosVisibles = document.querySelector('#visible-photos');
const fotoDestacada = document.querySelector('#top-rated');

let idEnEdicion = null;
let tarjetaActual = null;

// Carga los datos guardados. Si es la primera visita, muestra ejemplos editables.
function cargarFotos() {
  try {
    const datosGuardados = localStorage.getItem(CLAVE_LOCAL);
    if (datosGuardados === null) {
      fotos = [...FOTOS_INICIALES];
      guardarFotos();
      return;
    }
    const datosParseados = JSON.parse(datosGuardados);
    fotos = Array.isArray(datosParseados) ? datosParseados.filter(esFotoValida) : [];
  } catch (error) {
    // Un almacenamiento dañado no debe impedir que la aplicación se abra.
    fotos = [...FOTOS_INICIALES];
    guardarFotos();
  }
}

// Comprueba el formato básico al recuperar información del almacenamiento.
function esFotoValida(foto) {
  return foto
    && typeof foto.id === 'string'
    && typeof foto.titulo === 'string'
    && typeof foto.url === 'string'
    && typeof foto.categoria === 'string'
    && typeof foto.descripcion === 'string'
    && Number.isInteger(Number(foto.valoracion))
    && Number(foto.valoracion) >= 1
    && Number(foto.valoracion) <= 5;
}

// Guarda el arreglo completo para conservar los innitos entre visitas.
function guardarFotos() {
  try {
    localStorage.setItem(CLAVE_LOCAL, JSON.stringify(fotos));
  } catch (error) {
    mensajeFormulario.textContent = 'No se pudo guardar en este navegador. Revisa su almacenamiento disponible.';
  }
}

// Crea elementos seguros con textContent, evitando insertar datos del usuario como HTML.
function crearTarjeta(foto) {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'photo-card';
  tarjeta.dataset.photoId = foto.id;
  const visual = document.createElement('div');
  visual.className = 'photo-visual';

  const botonAmpliar = document.createElement('button');
  botonAmpliar.className = 'image-open';
  botonAmpliar.type = 'button';
  botonAmpliar.setAttribute('aria-label', `Ver imagen en pantalla completa: ${foto.titulo}`);

  const imagen = document.createElement('img');
  imagen.src = foto.url;
  imagen.alt = foto.titulo;
  imagen.loading = 'lazy';
  imagen.addEventListener('error', () => visual.classList.add('image-missing'));

  const textoAlternativo = document.createElement('span');
  textoAlternativo.className = 'image-fallback';
  textoAlternativo.textContent = 'Imagen no disponible';

  botonAmpliar.append(imagen, textoAlternativo);
  botonAmpliar.addEventListener('click', () => abrirImagen(foto, tarjeta));

  const etiqueta = document.createElement('button');
  etiqueta.className = 'category-tag';
  etiqueta.type = 'button';
  etiqueta.textContent = foto.categoria;
  etiqueta.setAttribute('aria-label', `Filtrar categoría ${foto.categoria}`);
  etiqueta.addEventListener('click', () => {
    filtroCategoria.value = foto.categoria;
    renderizarGaleria();
  });

  const informacion = document.createElement('div');
  informacion.className = 'photo-info';
  const filaTitulo = document.createElement('div');
  filaTitulo.className = 'photo-title-row';
  const titulo = document.createElement('h3');
  titulo.className = 'photo-title';
  titulo.textContent = foto.titulo;
  const valoracion = document.createElement('span');
  valoracion.className = 'photo-rating';
  valoracion.textContent = `★ ${foto.valoracion}/5`;
  valoracion.setAttribute('aria-label', `Valoración: ${foto.valoracion} de 5`);
  const descripcion = document.createElement('p');
  descripcion.className = 'photo-description';
  descripcion.textContent = foto.descripcion;

  const acciones = document.createElement('div');
  acciones.className = 'card-actions';
  const botonEditar = document.createElement('button');
  botonEditar.className = 'card-action';
  botonEditar.type = 'button';
  botonEditar.dataset.action = 'editar';
  botonEditar.dataset.id = foto.id;
  botonEditar.textContent = 'Editar';
  const botonEliminar = document.createElement('button');
  botonEliminar.className = 'card-action card-action-delete';
  botonEliminar.type = 'button';
  botonEliminar.dataset.action = 'eliminar';
  botonEliminar.dataset.id = foto.id;
  botonEliminar.textContent = 'Eliminar';

  // Anidamos los nodos para formar la tarjeta y, finalmente, la añadimos al grid.
  visual.append(botonAmpliar, etiqueta);
  filaTitulo.append(titulo, valoracion);
  acciones.append(botonEditar, botonEliminar);
  informacion.append(filaTitulo, descripcion, acciones);
  tarjeta.append(visual, informacion);
  return tarjeta;
}

// Abre el diálogo nativo y muestra la foto seleccionada con su título.
function mostrarFotoEnDialogo(foto) {
  imagenAmpliada.src = foto.url;
  imagenAmpliada.alt = foto.titulo;
  tituloImagenAmpliada.textContent = foto.titulo;
}

function abrirImagen(foto, tarjeta) {
  tarjetaActual = tarjeta;
  mostrarFotoEnDialogo(foto);
  dialogoImagen.showModal();
}

// Recorre las tarjetas visibles; si llega al extremo, continúa desde el otro lado.
function innitarFoto(direccion) {
  const primeraTarjeta = cuadricula.firstElementChild;
  const ultimaTarjeta = cuadricula.lastElementChild;

  // Si la galería está vacía o perdió su tarjeta activa, no accedemos a null.
  if (!primeraTarjeta || !ultimaTarjeta || !tarjetaActual) return;

  let tarjetaDestino;
  if (direccion < 0) {
    tarjetaDestino = tarjetaActual === primeraTarjeta
      ? ultimaTarjeta
      : tarjetaActual.previousElementSibling;
  } else {
    tarjetaDestino = tarjetaActual === ultimaTarjeta
      ? primeraTarjeta
      : tarjetaActual.nextElementSibling;
  }

  if (!tarjetaDestino) return;
  const fotoDestino = fotos.find((foto) => foto.id === tarjetaDestino.dataset.photoId);
  if (!fotoDestino) return;

  tarjetaActual = tarjetaDestino;
  mostrarFotoEnDialogo(fotoDestino);
}

// Aplica los filtros, actualiza estadísticas y dibuja las tarjetas actuales.
function renderizarGaleria() {
  const textoBusqueda = campoBusqueda.value.trim().toLocaleLowerCase('es');
  const categoriaSeleccionada = filtroCategoria.value;

  // filter recorre el arreglo y conserva solo las fotos que cumplen ambos criterios.
  const resultado = fotos.filter((foto) => {
    const coincideTitulo = foto.titulo.toLocaleLowerCase('es').includes(textoBusqueda);
    const coincideCategoria = categoriaSeleccionada === 'todas'
      || foto.categoria === categoriaSeleccionada;
    return coincideTitulo && coincideCategoria;
  });

  // map construye las tarjetas; replaceChildren sustituye el contenido anterior del DOM.
  const tarjetas = resultado.map(crearTarjeta);
  cuadricula.replaceChildren(...tarjetas);
  cuadricula.setAttribute('aria-busy', 'false');
  estadoVacio.hidden = resultado.length > 0;
  actualizarEstadisticas(resultado.length);
}

// Calcula valores agregados del arreglo y usa find para localizar la foto mejor valorada.
function actualizarEstadisticas(cantidadVisible) {
  totalFotos.textContent = String(fotos.length);
  fotosVisibles.textContent = String(cantidadVisible);

  // map obtiene las valoraciones y reduce las suma para calcular su promedio.
  const valoraciones = fotos.map((foto) => Number(foto.valoracion));
  const sumaValoraciones = valoraciones.reduce((total, valoracion) => total + valoracion, 0);
  const promedio = fotos.length === 0 ? 0 : sumaValoraciones / fotos.length;
  promedioValoracion.textContent = `${promedio.toFixed(1)} / 5`;

  if (fotos.length === 0) {
    fotoDestacada.textContent = 'Aún no hay fotos valoradas.';
    return;
  }

  const valoracionMaxima = Math.max(...valoraciones);
  const destacada = fotos.find((foto) => Number(foto.valoracion) === valoracionMaxima);
  fotoDestacada.textContent = `★ Mejor valorada: ${destacada.titulo} (${destacada.valoracion}/5)`;
}

// Reduce el tamaño del archivo para que pueda guardarse en el almacenamiento del navegador.
function comprimirImagen(archivo) {
  return new Promise((resolve, reject) => {
    const imagenTemporal = new Image();
    const urlTemporal = URL.createObjectURL(archivo);

    imagenTemporal.onload = () => {
      const limite = 1600;
      const escala = Math.min(1, limite / Math.max(imagenTemporal.width, imagenTemporal.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(imagenTemporal.width * escala);
      canvas.height = Math.round(imagenTemporal.height * escala);
      canvas.getContext('2d').drawImage(imagenTemporal, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(urlTemporal);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('No se pudo procesar la imagen.'));
          return;
        }
        const lector = new FileReader();
        lector.onload = () => resolve(lector.result);
        lector.onerror = () => reject(new Error('No se pudo leer la imagen.'));
        lector.readAsDataURL(blob);
      }, 'image/jpeg', 0.8);
    };

    imagenTemporal.onerror = () => {
      URL.revokeObjectURL(urlTemporal);
      reject(new Error('El archivo seleccionado no se pudo abrir como imagen.'));
    };
    imagenTemporal.src = urlTemporal;
  });
}

// CREATE y UPDATE comparten el formulario: el id en edición decide cuál ejecutar.
formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  mensajeFormulario.textContent = '';
  if (!formulario.reportValidity()) return;

  const datos = new FormData(formulario);
  const urlEscrita = String(datos.get('url')).trim();
  const archivo = campoArchivo.files[0];
  const fotoAnterior = idEnEdicion ? fotos.find((foto) => foto.id === idEnEdicion) : null;

  if (!archivo && !urlEscrita && !fotoAnterior) {
    mensajeFormulario.textContent = 'Elige una imagen de tu dispositivo o pega una URL.';
    campoArchivo.focus();
    return;
  }

  let url = fotoAnterior?.url ?? '';
  if (archivo) {
    if (!archivo.type.startsWith('image/')) {
      mensajeFormulario.textContent = 'Selecciona un archivo de imagen.';
      campoArchivo.focus();
      return;
    }
    if (archivo.size > 15 * 1024 * 1024) {
      mensajeFormulario.textContent = 'La imagen debe pesar menos de 15 MB.';
      campoArchivo.focus();
      return;
    }
    try {
      url = await comprimirImagen(archivo);
    } catch (error) {
      mensajeFormulario.textContent = error.message;
      return;
    }
  } else if (urlEscrita) {
    // type="url" valida el formato; aquí limitamos los protocolos permitidos.
    try {
      const direccion = new URL(urlEscrita);
      if (!['http:', 'https:'].includes(direccion.protocol)) throw new Error('Protocolo no permitido');
      url = urlEscrita;
    } catch (error) {
      mensajeFormulario.textContent = 'Escribe una URL válida que empiece por http:// o https://.';
      campoUrl.focus();
      return;
    }
  }

  const foto = {
    id: idEnEdicion ?? (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
    titulo: String(datos.get('titulo')).trim(),
    url,
    categoria: String(datos.get('categoria')),
    descripcion: String(datos.get('descripcion')).trim(),
    valoracion: Number(datos.get('valoracion'))
  };

  if (idEnEdicion) {
    // UPDATE: reemplazamos solo el objeto que tiene el mismo id.
    fotos = fotos.map((fotoActual) => fotoActual.id === idEnEdicion ? foto : fotoActual);
  } else {
    // CREATE: colocamos la foto nueva al principio para verla inmediatamente.
    fotos.unshift(foto);
  }

  guardarFotos();
  cancelarEdicion();
  renderizarGaleria();
});

// Un listener en el grid gestiona los botones de todas las tarjetas (delegación de eventos).
cuadricula.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button[data-action]');
  if (!boton) return;
  const foto = fotos.find((elemento) => elemento.id === boton.dataset.id);
  if (!foto) return;
  if (boton.dataset.action === 'editar') iniciarEdicion(foto);
  if (boton.dataset.action === 'eliminar') eliminarFoto(foto);
});

// El diálogo también se puede cerrar con Escape gracias al comportamiento nativo.
botonCerrarImagen.addEventListener('click', () => dialogoImagen.close());
botonFotoAnterior.addEventListener('click', () => innitarFoto(-1));
botonFotoSiguiente.addEventListener('click', () => innitarFoto(1));
dialogoImagen.addEventListener('keydown', (evento) => {
  if (evento.key === 'ArrowLeft') innitarFoto(-1);
  if (evento.key === 'ArrowRight') innitarFoto(1);
});
dialogoImagen.addEventListener('click', (evento) => {
  if (evento.target === dialogoImagen) dialogoImagen.close();
});

// UPDATE: cargamos los datos elegidos en el formulario para permitir modificarlos.
function iniciarEdicion(foto) {
  idEnEdicion = foto.id;
  campoTitulo.value = foto.titulo;
  campoUrl.value = foto.url.startsWith('http://') || foto.url.startsWith('https://') ? foto.url : '';
  campoCategoria.value = foto.categoria;
  campoDescripcion.value = foto.descripcion;
  campoValoracion.value = String(foto.valoracion);
  botonGuardar.textContent = 'Guardar innitos ✓';
  botonCancelar.hidden = false;
  mensajeFormulario.textContent = `Editando: ${foto.titulo}`;
  formulario.scrollIntoView({ behavior: 'smooth', block: 'center' });
  campoTitulo.focus({ preventScroll: true });
}

// DELETE: solicitamos confirmación antes de quitar la foto del arreglo.
function eliminarFoto(foto) {
  if (!window.confirm(`¿Quieres eliminar "${foto.titulo}" de tu colección?`)) return;
  fotos = fotos.filter((elemento) => elemento.id !== foto.id);
  if (idEnEdicion === foto.id) cancelarEdicion();
  guardarFotos();
  renderizarGaleria();
}

// Restablece el formulario y devuelve el modo de edición al modo de creación.
function cancelarEdicion() {
  idEnEdicion = null;
  formulario.reset();
  campoValoracion.value = '5';
  botonGuardar.textContent = 'Guardar foto +';
  botonCancelar.hidden = true;
  mensajeFormulario.textContent = '';
}

// Los recorridos se vuelven a calcular cada vez que innita la búsqueda o el filtro.
campoBusqueda.addEventListener('input', renderizarGaleria);
filtroCategoria.addEventListener('change', renderizarGaleria);
botonCancelar.addEventListener('click', cancelarEdicion);

// Arranque: recuperar los datos, pintar el DOM y mostrar las estadísticas iniciales.
cargarFotos();
renderizarGaleria();