/* =========================================================
   Orquídeas – Jardín Botánico del Quindío · lógica de la página
   ---------------------------------------------------------
   1. Configuración y datos     5. Acciones (clics y teclado)
   2. Estado                    6. Envío del pedido
   3. Utilidades                7. Efectos (carga, fondo, banner, revelado)
   4. Plantillas y pintado      8. Inicio
   ========================================================= */
'use strict';

/* ---------- 1. Configuración y datos ---------- */
const CONFIG = {
  whatsapp: '573116400507',                     // WhatsApp que recibe los pedidos (57 + número, sin espacios)
  // Access Key de Web3Forms (https://web3forms.com). El correo que recibe los pedidos NO está en este
  // archivo: queda amarrado a esta llave en los servidores de Web3Forms, así que nadie puede cambiarlo
  // editando la página. Esta llave es pública por diseño (solo sirve para ENVIAR a tu correo).
  web3formsKey: '0653f847-6305-40d6-964b-a48f06558be9',
  web3formsPro: false,                          // true solo con plan Pro: adjunta el comprobante al correo
  llave: '3116400507',                          // llave de pago
  precios: { 1: 96000, 2: 105000, 3: 120000 },  // precio por orquídea según el número de varas
  maxAdjunto: 5 * 1024 * 1024,                  // tamaño máximo del comprobante que se adjunta al correo
};

/* Selectores +/−: límite y textos de cada tipo */
const TIPOS = {
  cant: { max: 50, uno: 'orquídea', varios: 'orquídeas', etiqueta: 'Cantidad de orquídeas' },
  varas: { max: 3, uno: 'vara', varios: 'varas', etiqueta: 'Número de varas' },
};

const PRODUCTOS = [
  { id: 1, color: 'rosada', foto: 'assets/producto1-rosada.jpg', alt: 'Phalaenopsis rosada de dos varas en maceta negra brillante' },
  { id: 2, color: 'blanca', foto: 'assets/producto2-blanca.jpg', alt: 'Phalaenopsis blanca de una vara en maceta negra brillante' },
  { id: 3, color: 'amarilla', foto: 'assets/producto3-amarilla.jpg', alt: 'Phalaenopsis amarilla con centro fucsia en maceta negra brillante' },
  { id: 4, color: 'rosa claro', foto: 'assets/producto4-rosa-claro.jpg', alt: 'Phalaenopsis rosa claro de una vara en maceta negra brillante' },
];

/* Orquídeas de la pantalla de carga:
   [imagen (b=blanca, l=lima, r=rosa), x (vw), y (vh), alto (vh), giro (°), espejo (1/0), retraso (s)] */
const ORQ_CARGA = [
  ['b', 10.4, 2.8, 24.4, 165, 0, .50], ['l', 34.7, 2.0, 23.3, 185, 1, .55], ['r', 51.4, 2.2, 24.4, 178, 0, .60],
  ['b', 68.1, 2.4, 24.4, 190, 1, .65], ['l', 87.5, 2.8, 25.6, 170, 0, .70], ['r', 10.4, 97.8, 24.4, 5, 1, .50],
  ['b', 33.3, 98.3, 23.3, -6, 0, .55], ['l', 50.0, 98.3, 24.4, 8, 0, .60], ['r', 66.7, 98.4, 23.3, -4, 1, .65],
  ['l', 86.8, 97.8, 25.6, 6, 0, .70], ['b', 1.5, 22.2, 24.4, 85, 0, .55], ['l', 1.4, 51.1, 24.4, 95, 1, .60],
  ['r', 1.7, 80.0, 24.4, 88, 0, .65], ['r', 98.5, 22.2, 24.4, -85, 1, .55], ['b', 98.6, 51.1, 24.4, -92, 0, .60],
  ['l', 98.3, 80.0, 24.4, -88, 1, .65], ['l', 20.8, 13.3, 18.9, 180, 1, .80], ['r', 48.6, 11.7, 17.8, 186, 0, .85],
  ['b', 79.2, 13.1, 18.9, 174, 1, .90], ['r', 20.8, 87.8, 18.9, 0, 0, .80], ['b', 50.0, 88.9, 17.8, -6, 1, .85],
  ['l', 79.2, 87.8, 18.9, 6, 0, .90], ['b', 8.3, 52.2, 18.9, 90, 0, .85], ['r', 91.7, 52.2, 18.9, -90, 1, .85],
  ['r', 26.4, 5.3, 27.8, 180, 0, .10], ['b', 43.1, 3.3, 25.6, 170, 1, .20], ['l', 59.7, 4.2, 26.7, 190, 0, .30],
  ['r', 76.4, 5.3, 27.8, 175, 1, .40], ['b', 25.0, 95.9, 27.8, 0, 0, .15], ['l', 41.7, 97.0, 25.6, 10, 1, .25],
  ['r', 58.3, 96.2, 27.8, -8, 0, .35], ['b', 75.7, 95.9, 26.7, 5, 1, .45], ['r', 2.6, 36.7, 27.8, 90, 0, .20],
  ['b', 2.2, 62.8, 26.7, 100, 1, .30], ['l', 97.6, 36.7, 27.8, -90, 0, .25], ['r', 97.9, 63.3, 26.7, -95, 1, .35],
  ['l', 6.6, 8.9, 38.9, 135, 0, 0], ['b', 93.4, 8.9, 38.9, -135, 0, .05], ['r', 93.4, 89.8, 38.9, -45, 0, .10],
  ['l', 6.6, 89.8, 36.7, 45, 1, .15],
];
const IMG_CARGA = { b: 'blanca', l: 'lima', r: 'rosa' };

/* Orquídeas desenfocadas de "Lleva el jardín contigo":
   [imagen, x (%), distancia abajo (vw), alto (vw), opacidad, giro (°), espejo (1/0)] */
const ORQ_CAMPO = [
  ['blanca-2', 22, 6.5, 22.7, .55, -6, 1], ['rosa', 32, 6.7, 21.7, .6, 4, 0], ['lima-2', 42, 5.9, 23.2, .55, -4, 1],
  ['blanca-2', 50, 6.9, 22.2, .5, 3, 0], ['rosa', 58, 6.6, 23.2, .55, -5, 1], ['lima-2', 68, 6.7, 21.7, .6, 6, 0],
  ['blanca-2', 78, 6.1, 22.7, .55, -3, 1], ['rosa', 27, 2.8, 25.7, .5, 8, 0], ['lima-2', 54, 2.1, 25.7, .45, -6, 0],
  ['rosa', 74, 2.4, 25.7, .5, 5, 1], ['blanca', 5, 5.7, 29.7, .95, -8, 0], ['lima', 15, 3.1, 31.6, .95, 5, 1],
  ['rosa-2', 26, 7.8, 29.7, .9, -4, 0], ['lima', 75, 7.1, 29.7, .9, 6, 1], ['rosa-2', 86, 3.8, 31.6, .95, -5, 0],
  ['blanca', 96, 5.7, 29.7, .95, 8, 1],
];

/* ---------- 2. Estado ---------- */
const estado = {
  cant: {},              // orquídeas por producto (id → n)
  varas: {},             // varas por producto (id → n)
  carrito: new Set(),    // ids de productos en el pedido
  carritoAbierto: false,
  datos: null,           // datos del formulario ya validados (paso 1 → paso 2)
  paraMi: false,
  entrega: 'domicilio',  // 'domicilio' | 'jardin'
  comp: null,            // archivo del comprobante de pago
  compUrl: '',           // vista previa del comprobante (si es imagen)
};

/* ---------- 3. Utilidades ---------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const raiz = document.documentElement;
const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* La pantalla de carga se muestra solo una vez por visita (se vuelve a ver al abrir la página otro día
   o en otra pestaña). Se decide aquí, antes de que el navegador dibuje la página, para que no parpadee. */
const CLAVE_CARGA = 'jbq-carga-vista';
const cargaYaVista = (() => {
  try { return sessionStorage.getItem(CLAVE_CARGA) === '1'; } catch { return false; }
})();
if (cargaYaVista) raiz.classList.add('sin-carga');

const formatoNumero = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });
const pesos = (n) => `$${formatoNumero.format(n)} COP`;
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
const texto = (tipo, n) => plural(n, TIPOS[tipo].uno, TIPOS[tipo].varios);
const mayuscula = (s) => s[0].toUpperCase() + s.slice(1);
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapar = (s) => String(s).replace(/[&<>"']/g, (c) => ESCAPES[c]);

const valorDe = (tipo, id) => estado[tipo][id] || 1;
const precioDe = (id) => valorDe('cant', id) * (CONFIG.precios[valorDe('varas', id)] || CONFIG.precios[1]);
const detalleDe = (id) => `${texto('cant', valorDe('cant', id))} · ${texto('varas', valorDe('varas', id))}`;
const enCarrito = () => PRODUCTOS.filter((p) => estado.carrito.has(p.id));

/** Número de pedido único, p. ej. JBQ-1123-K7QM (mes y día + 4 caracteres al azar sin 0/O ni 1/I). */
const LETRAS_CODIGO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function codigoPedido() {
  const hoy = new Date();
  const fecha = String(hoy.getMonth() + 1).padStart(2, '0') + String(hoy.getDate()).padStart(2, '0');
  const azar = Array.from(crypto.getRandomValues(new Uint8Array(4)), (n) => LETRAS_CODIGO[n % LETRAS_CODIGO.length]).join('');
  return `JBQ-${fecha}-${azar}`;
}

/** Desplaza suavemente hasta una sección. */
const irA = (id, espera = 50) => setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), espera);

/** Muestra u oculta un elemento.
    - Un <fieldset> oculto queda deshabilitado (no se valida ni se envía).
    - Mientras haya una ventana (.modal) abierta, la página de atrás no se desplaza. */
function mostrar(sel, visible) {
  const el = typeof sel === 'string' ? $(sel) : sel;
  if (el.hidden === !visible) return;
  el.hidden = !visible;
  if (el.tagName === 'FIELDSET') el.disabled = !visible;
  if (el.classList.contains('modal')) raiz.classList.toggle('bloqueado', !!$('.modal:not([hidden])'));
}

/** Abre una ventana desde arriba y pone el foco en su primer botón (accesibilidad con teclado). */
function abrirModal(sel) {
  const modal = $(sel);
  mostrar(modal, true);
  modal.scrollTop = 0;
  modal.querySelector('button:not([hidden])')?.focus({ preventScroll: true });
}

/* ---------- 4. Plantillas y pintado ---------- */
const stepperHTML = (id, tipo, clase = '') => {
  const { uno, etiqueta } = TIPOS[tipo];
  return `<div class="stepper ${clase}" role="group" aria-label="${etiqueta}" data-id="${id}" data-tipo="${tipo}">
    <button type="button" data-accion="ajustar" data-delta="-1" aria-label="Quitar una ${uno}">−</button>
    <span aria-live="polite"></span>
    <button type="button" data-accion="ajustar" data-delta="1" aria-label="Agregar una ${uno}">+</button>
  </div>`;
};

const productoHTML = (p) => `<article class="producto" data-id="${p.id}">
  <img class="producto-foto" src="${p.foto}" alt="${p.alt}" loading="lazy" decoding="async" width="800" height="1067">
  <div class="producto-cuerpo">
    <h3>Phalaenopsis</h3>
    <p class="producto-color">${mayuscula(p.color)}</p>
    <p class="producto-precio" data-precio="${p.id}"></p>
    ${stepperHTML(p.id, 'varas')}
    <div class="producto-acciones">
      ${stepperHTML(p.id, 'cant')}
      <button type="button" class="btn-comprar" data-accion="comprar">Comprar</button>
    </div>
  </div>
</article>`;

const itemCarritoHTML = (p) => `<div class="item-carrito" data-id="${p.id}">
  <img class="item-foto" src="${p.foto}" alt="Phalaenopsis ${p.color}">
  <div class="item-info">
    <h3 class="item-nombre"><em>Phalaenopsis</em> ${p.color}</h3>
    <div class="item-steppers">${stepperHTML(p.id, 'cant', 'stepper--mini')}${stepperHTML(p.id, 'varas', 'stepper--mini')}</div>
    <p class="item-subtotal" data-precio="${p.id}"></p>
  </div>
  <button type="button" class="btn-quitar" data-accion="quitar" aria-label="Quitar Phalaenopsis ${p.color} del pedido">Quitar</button>
</div>`;

const disponibleHTML = (p) => `<button type="button" class="btn-agregar" data-accion="agregar" data-id="${p.id}">
  <img src="${p.foto}" alt=""><span>+ <em>Phalaenopsis</em> ${p.color}</span>
</button>`;

const graciasProductoHTML = (p) => `<div class="gr-producto">
  <img src="${p.foto}" alt="${p.nombre}">
  <div><strong><em>Phalaenopsis</em> ${p.color}</strong><span>${p.detalle}</span><b>${p.subtotal}</b></div>
</div>`;

function pintarStepper(st) {
  const { id, tipo } = st.dataset;
  const n = valorDe(tipo, id);
  const [menos, mas] = st.querySelectorAll('button');
  st.querySelector('span').textContent = texto(tipo, n);
  menos.disabled = n <= 1;
  mas.disabled = n >= TIPOS[tipo].max;
}

/** Actualiza contadores y precios de un producto en la tienda y en el carrito. */
function pintarProducto(id) {
  $$(`.stepper[data-id="${id}"]`).forEach(pintarStepper);
  const precio = pesos(precioDe(id));
  $$(`[data-precio="${id}"]`).forEach((el) => { el.textContent = precio; });
}

/** Reconstruye la lista del carrito (cuando se agrega o quita un producto). */
function pintarCarrito() {
  const items = enCarrito();
  const libres = PRODUCTOS.filter((p) => !estado.carrito.has(p.id));
  $('#carrito-items').innerHTML = items.map(itemCarritoHTML).join('');
  $('#carrito-disponibles').innerHTML = libres.map(disponibleHTML).join('');
  mostrar('#carrito-extra', libres.length > 0);
  items.forEach((p) => pintarProducto(p.id));
  pintarTotales();
}

/** Totales del pedido + visibilidad del carrito y del botón flotante. */
function pintarTotales() {
  const items = enCarrito();
  const orquideas = items.reduce((t, p) => t + valorDe('cant', p.id), 0);
  const total = pesos(items.reduce((t, p) => t + precioDe(p.id), 0));
  $('#carrito-resumen').textContent = `${plural(items.length, 'producto', 'productos')}, ${texto('cant', orquideas)}`;
  $('#carrito-total').textContent = total;
  $('#pago-total').textContent = total;
  $('#flotante-total').textContent = texto('cant', orquideas);
  mostrar('#carrito', items.length > 0 && estado.carritoAbierto);
  mostrar('#btn-flotante', items.length > 0 && !estado.carritoAbierto);
}

function pintarFormulario() {
  const { paraMi, entrega } = estado;
  const jardin = entrega === 'jardin';
  $$('[data-accion="para-mi"]').forEach((b) => b.setAttribute('aria-pressed', (b.dataset.valor === 'si') === paraMi));
  $$('[data-accion="entrega"]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.valor === entrega));
  mostrar('#grupo-recibe', !paraMi);
  mostrar('#grupo-direccion', !jardin && !paraMi);
  mostrar('#nota-mi-direccion', !jardin && paraMi);
  mostrar('#nota-jardin', jardin);
}

function ponerComprobante(archivo) {
  if (estado.compUrl) URL.revokeObjectURL(estado.compUrl);
  estado.comp = archivo;
  estado.compUrl = archivo?.type.startsWith('image/') ? URL.createObjectURL(archivo) : '';
  const img = $('#comp-img');
  img.hidden = !estado.compUrl;
  if (estado.compUrl) img.src = estado.compUrl;
  else img.removeAttribute('src');
  $('#comp-nombre').textContent = archivo ? `✓ ${archivo.name}` : '';
  $('#comp-texto').textContent = archivo ? 'Cambiar comprobante' : 'Subir foto del comprobante';
  mostrar('#comp-preview', !!archivo);
  if (archivo) mostrar('#aviso-comp', false);
}

/** Muestra el paso de la compra: 'datos' (formulario) o 'pago' (valor, llave y comprobante). */
function mostrarPaso(paso) {
  mostrar('#paso-datos', paso === 'datos');
  mostrar('#paso-pago', paso === 'pago');
  $('#carrito').scrollTop = 0;
}

/** Deja todo listo para un pedido nuevo (no quedan datos ni comprobante del cliente anterior). */
function reiniciarPedido() {
  $('#form-pedido').reset();
  ponerComprobante(null);
  Object.assign(estado, { datos: null, paraMi: false, entrega: 'domicilio' });
  pintarFormulario();
  mostrarPaso('datos');
}

/* ---------- 5. Acciones (clics con data-accion) ---------- */
function abrirCarrito() {
  estado.carritoAbierto = true;
  pintarCarrito();
  mostrarPaso('datos');
  abrirModal('#carrito');
}

function cerrarCarrito(destino) {
  estado.carritoAbierto = false;
  pintarTotales();
  if (destino) irA(destino);
}

function cerrarGracias() {
  mostrar('#gracias', false);
  reiniciarPedido();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function compartirComprobante() {
  const archivo = estado.comp;
  if (!archivo) return;
  let sePuede = false;
  try { sePuede = !!navigator.canShare?.({ files: [archivo] }); } catch { /* sin soporte */ }
  if (sePuede) navigator.share({ files: [archivo], title: 'Comprobante de pago' }).catch(() => {});
  else mostrar('#comp-sin-share', true);
}

const acciones = {
  ajustar(el, id) {
    const tipo = el.closest('.stepper').dataset.tipo;
    estado[tipo][id] = Math.min(TIPOS[tipo].max, Math.max(1, valorDe(tipo, id) + Number(el.dataset.delta)));
    pintarProducto(id);
    pintarTotales();
  },
  comprar(_, id) {
    estado.carrito.add(id);
    $('#btn-copiar').textContent = 'Copiar llave';
    abrirCarrito();
  },
  agregar(_, id) { estado.carrito.add(id); pintarCarrito(); },
  quitar(_, id) {
    estado.carrito.delete(id);
    if (!estado.carrito.size) estado.carritoAbierto = false;
    pintarCarrito();
  },
  'abrir-carrito': abrirCarrito,
  'seguir-comprando': () => cerrarCarrito('tienda'),
  'volver-datos': () => mostrarPaso('datos'),
  'enviar-pedido': () => enviarPedido(),
  'copiar-llave'() {
    navigator.clipboard?.writeText(CONFIG.llave).catch(() => {});
    $('#btn-copiar').textContent = '¡Llave copiada!';
  },
  'quitar-comp': () => ponerComprobante(null),
  'para-mi'(el) { estado.paraMi = el.dataset.valor === 'si'; pintarFormulario(); },
  entrega(el) { estado.entrega = el.dataset.valor; pintarFormulario(); },
  'compartir-comp': compartirComprobante,
  'abrir-terminos'(_, __, e) { e.preventDefault(); abrirModal('#terminos'); },
  'cerrar-terminos': () => mostrar('#terminos', false),
  'cerrar-gracias': cerrarGracias,
};

/* Tecla Esc: cierra la ventana que esté encima (términos > gracias > carrito) */
const CERRAR_CON_ESC = [
  ['#terminos', () => mostrar('#terminos', false)],
  ['#gracias', cerrarGracias],
  ['#carrito', () => cerrarCarrito()],
];

/* ---------- 6. Envío del pedido ---------- */
const entregaTexto = (d) => (d.entrega === 'jardin' ? 'Recoge en el Jardín Botánico del Quindío' : `Domicilio: ${d.direccion || '-'}`);

/** Mensaje del pedido para WhatsApp. */
function mensajeWhatsapp(d) {
  return [
    '🌸 *NUEVO PEDIDO – Orquídeas Jardín Botánico del Quindío*',
    `🧾 Pedido N.º *${d.codigo}*`, '',
    '👤 *QUIEN COMPRA*',
    `Nombre: ${d.nombre || '-'}`,
    `Teléfono: ${d.telefono_comprador || '-'}`,
    `Correo: ${d.correo_comprador || '-'}`,
    `Dirección: ${d.direccion_comprador || '-'}`,
    '', `🎁 *QUIEN RECIBE*${d.paraMi ? ' (es para quien compra)' : ''}`,
    `Nombre: ${d.nombre_recibe || '-'}`,
    `Teléfono: ${d.telefono_recibe || '-'}`,
    '', '🚚 *ENTREGA*', entregaTexto(d),
    '', '🌺 *PRODUCTOS*',
    ...d.productos.map((p, n) => `${n + 1}. ${p.nombre}\n   ${p.detalle}\n   Subtotal: ${p.subtotal}`),
    '', `💰 *TOTAL A PAGAR: ${pesos(d.total)}*`,
    '', `📎 ${d.tieneComprobante ? 'Ya subí el comprobante de pago, te lo envío en este chat.' : 'Te envío el comprobante de pago en este chat.'}`,
  ].join('\n');
}

/** Envía un correo al Jardín a través de Web3Forms. Devuelve una promesa que falla si no se pudo enviar.
    `replyto` = correo del cliente (el botón "Responder" le escribe a él). */
function enviarWeb3Forms(asunto, campos, { replyto, adjunto } = {}) {
  if (!/^[0-9a-f-]{36}$/i.test(CONFIG.web3formsKey)) {
    return Promise.reject(new Error('Falta configurar CONFIG.web3formsKey'));
  }
  const form = new FormData();
  form.append('access_key', CONFIG.web3formsKey);
  form.append('subject', asunto);
  form.append('from_name', 'Tienda de Orquídeas – Jardín Botánico del Quindío');
  form.append('botcheck', '');
  if (replyto) form.append('replyto', replyto);
  Object.entries(campos).forEach(([campo, valor]) => form.append(campo, valor || '-'));
  if (adjunto) form.append('attachment', adjunto, adjunto.name);

  return fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body: form })
    .then((r) => r.json())
    .then((r) => { if (!r.success) throw new Error(r.message); return r; });
}

/** Envía el pedido al correo del Jardín (si falla, el pedido igual sale por WhatsApp). */
function enviarCorreo(d) {
  const adjunta = CONFIG.web3formsPro && estado.comp && estado.comp.size < CONFIG.maxAdjunto;
  const comprobante = adjunta ? 'Adjunto en este correo'
    : estado.comp ? 'Lo subió en la página; lo envía por WhatsApp'
    : 'No lo subió en la página';

  enviarWeb3Forms(`Pedido ${d.codigo} – ${d.nombre || 'Cliente'} – ${pesos(d.total)}`, {
    'Número de pedido': d.codigo,
    'Nombre de quien compra': d.nombre,
    'Teléfono de quien compra': d.telefono_comprador,
    'Correo de quien compra': d.correo_comprador,
    'Dirección de quien compra': d.direccion_comprador,
    'Es para quien compra': d.paraMi ? 'Sí' : 'No',
    'Nombre de quien recibe': d.nombre_recibe,
    'Teléfono de quien recibe': d.telefono_recibe,
    Entrega: entregaTexto(d),
    Productos: d.productos.map((p, n) => `${n + 1}. ${p.nombre} – ${p.detalle} – ${p.subtotal}`).join('\n'),
    'Total a pagar': pesos(d.total),
    Comprobante: comprobante,
    'Autoriza tratamiento de datos': d.acepta_terminos ? 'Sí' : 'No',
  }, { replyto: d.correo_comprador, adjunto: adjunta ? estado.comp : null })
    .catch((err) => console.warn('Web3Forms no envió el pedido:', err.message));
}

/** Formulario de contacto: envía el mensaje y le muestra al visitante si salió o no. */
async function enviarContacto(e) {
  e.preventDefault();
  const form = e.target;
  const d = Object.fromEntries([...new FormData(form)].map(([k, v]) => [k, String(v).trim()]));
  if (d.botcheck) return; // lo llenó un robot: se descarta sin avisar

  const boton = form.querySelector('[type="submit"]');
  boton.disabled = true;
  boton.textContent = 'Enviando…';
  mostrar('#contacto-ok', false);
  mostrar('#contacto-error', false);
  try {
    await enviarWeb3Forms(`Mensaje de contacto – ${d.nombre}`, {
      Nombre: d.nombre,
      Celular: d.celular,
      Correo: d.correo,
      Mensaje: d.mensaje,
      'Autoriza tratamiento de datos': 'Sí',
    }, { replyto: d.correo });
    form.reset();
    mostrar('#contacto-ok', true);
  } catch (err) {
    console.warn('Web3Forms no envió el mensaje de contacto:', err.message);
    mostrar('#contacto-error', true);
  } finally {
    boton.disabled = false;
    boton.textContent = 'Enviar mensaje';
  }
}

function mostrarGracias(d) {
  const filas = [
    ['Nombre', d.nombre],
    ['Número del comprador', d.telefono_comprador],
    ['Correo del comprador', d.correo_comprador],
    ['Dirección del comprador', d.direccion_comprador],
    ['Quien recibe', d.paraMi ? 'Es para ti' : d.nombre_recibe],
    ['Número de quien recibe', d.paraMi ? '' : d.telefono_recibe],
    ['Entrega', d.entrega === 'jardin' ? 'Recoger en el Jardín Botánico del Quindío' : d.direccion],
  ].filter(([, valor]) => valor);

  $('#gracias-nombre').textContent = (d.nombre || '').split(' ')[0];
  $('#gracias-codigo').textContent = d.codigo;
  $('#gracias-productos').innerHTML = d.productos.map(graciasProductoHTML).join('');
  $('#gracias-total').textContent = pesos(d.total);
  $('#gracias-filas').innerHTML = filas
    .map(([etiqueta, valor]) => `<div class="fila-dato"><span>${etiqueta}</span><span>${escapar(valor)}</span></div>`)
    .join('');
  $('#gracias-wa').href = d.waUrl;
  mostrar('#btn-compartir', !!estado.comp);
  mostrar('#comp-sin-share', false);
  abrirModal('#gracias');
}

/** Paso 1 → 2: el navegador ya validó que todos los campos estén llenos; se guardan y se muestra el pago. */
function irAlPago(e) {
  e.preventDefault();
  const d = Object.fromEntries([...new FormData(e.target)].map(([k, v]) => [k, String(v).trim()]));
  if (d.botcheck || !estado.carrito.size) return; // robot o pedido vacío: no sigue
  estado.datos = d;
  $('#pago-nombre').textContent = d.nombre.split(' ')[0];
  mostrar('#aviso-comp', false);
  mostrarPaso('pago');
  $('#btn-copiar').focus({ preventScroll: true });
}

/** Paso 2: con el comprobante subido, se envía el pedido (correo + WhatsApp) y se muestra la pantalla de gracias. */
function enviarPedido() {
  if (!estado.datos) { mostrarPaso('datos'); return; }
  if (!estado.comp) {
    mostrar('#aviso-comp', true);
    $('#aviso-comp').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const d = { ...estado.datos };
  d.productos = enCarrito().map((p) => {
    const valor = precioDe(p.id);
    return { color: p.color, nombre: `Phalaenopsis ${p.color}`, foto: p.foto, detalle: detalleDe(p.id), valor, subtotal: pesos(valor) };
  });

  Object.assign(d, {
    codigo: codigoPedido(),
    total: d.productos.reduce((t, p) => t + p.valor, 0),
    entrega: estado.entrega,
    paraMi: estado.paraMi,
    tieneComprobante: !!estado.comp,
  });
  if (d.paraMi) {
    d.nombre_recibe = d.nombre;
    d.telefono_recibe = d.telefono_comprador;
    if (d.entrega === 'domicilio') d.direccion = d.direccion_comprador;
  }

  estado.carrito.clear();
  estado.carritoAbierto = false;
  pintarCarrito();

  enviarCorreo(d);
  d.waUrl = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensajeWhatsapp(d))}`;
  window.open(d.waUrl, '_blank', 'noopener'); // si el navegador lo bloquea, queda el botón verde
  mostrarGracias(d);
}

/* ---------- 7. Efectos ---------- */
function iniciarCarga() {
  const carga = $('#carga');
  if (cargaYaVista) { carga.remove(); return; }
  try { sessionStorage.setItem(CLAVE_CARGA, '1'); } catch { /* modo privado: se mostrará siempre */ }

  carga.insertAdjacentHTML('afterbegin', ORQ_CARGA.map(([img, x, y, alto, giro, espejo, retraso]) =>
    `<div class="carga-orq" aria-hidden="true" style="left:${x}vw;top:${y}vh;--dl:${retraso}s">` +
    `<img src="assets/orquidea-${IMG_CARGA[img]}.png" alt="" style="height:${alto}vh;transform:translate(-50%,-50%) rotate(${giro}deg)${espejo ? ' scaleX(-1)' : ''}"></div>`
  ).join(''));

  raiz.classList.add('cargando');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  setTimeout(() => { raiz.classList.remove('cargando'); carga.classList.add('saliendo'); }, reducido ? 700 : 2500);
  setTimeout(() => carga.remove(), reducido ? 1500 : 3550);
}

function iniciarCampo() {
  const medida = (vw) => `clamp(${Math.round(vw * 7.88)}px, ${vw}vw, ${Math.round(vw * 14.4)}px)`;
  $('#campo').innerHTML = ORQ_CAMPO.map(([img, x, abajo, alto, opacidad, giro, espejo]) => {
    const [color, n] = img.split('-');
    return `<img src="assets/campo-${color}-desenfocada${n ? `-${n}` : ''}.png" alt="" loading="lazy" decoding="async" ` +
      `style="left:${x}%;bottom:${medida(abajo)};height:${medida(alto)};opacity:${opacidad};` +
      `transform:translateX(-50%) rotate(${giro}deg)${espejo ? ' scaleX(-1)' : ''}">`;
  }).join('');
}

/** El banner se vuelve transparente al salir de la sección de inicio
    (IntersectionObserver: no hace cálculos en cada movimiento del scroll). */
function iniciarBanner() {
  const banner = $('#banner');
  new IntersectionObserver(([entrada]) => banner.classList.toggle('oculto', !entrada.isIntersecting), {
    rootMargin: '-64px 0px 0px 0px',
  }).observe($('#inicio'));
}

/** La foto de "Tu regalo" aparece al entrar en pantalla. */
function iniciarRevelado() {
  const foto = $('#col-foto');
  if (reducido) { foto.classList.add('visible'); return; }
  const obs = new IntersectionObserver(([entrada]) => {
    if (entrada.isIntersecting) { foto.classList.add('visible'); obs.disconnect(); }
  }, { threshold: 0.2 });
  obs.observe(foto);
}

/* ---------- 8. Inicio ---------- */
function iniciar() {
  iniciarCarga();
  iniciarCampo();
  iniciarBanner();
  iniciarRevelado();

  $('#productos').innerHTML = PRODUCTOS.map(productoHTML).join('');
  PRODUCTOS.forEach((p) => pintarProducto(p.id));
  $('#llave').textContent = CONFIG.llave;
  pintarFormulario();

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-accion]');
    if (!el) return;
    const id = Number(el.closest('[data-id]')?.dataset.id);
    acciones[el.dataset.accion]?.(el, id, e);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    CERRAR_CON_ESC.find(([sel]) => !$(sel).hidden)?.[1]();
  });
  $('#comp-input').addEventListener('change', (e) => {
    const archivo = e.target.files?.[0];
    if (archivo) ponerComprobante(archivo);
    e.target.value = '';
  });
  $('#form-pedido').addEventListener('submit', irAlPago);
  $('#form-contacto').addEventListener('submit', enviarContacto);
}

// El script se carga en el <head>: arranca cuando el HTML ya está listo.
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
else iniciar();
