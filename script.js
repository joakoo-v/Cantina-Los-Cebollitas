"use strict";


/* =====================================================
   CONFIGURACIÓN GENERAL
===================================================== */

const STORAGE_KEYS = Object.freeze({
    eventos: "eventos",
    menu: "menu",
    resenas: "resenas"
});


const CONFIG = Object.freeze({
    whatsapp: "https://wa.me/5491171071742",
    maxNombre: 30,
    maxResena: 300,
    eventoSalidaMs: 350
});


/* =====================================================
   DATOS POR DEFECTO DEL MENÚ
===================================================== */

const MENU_POR_DEFECTO = [
    {
        id: "entradas",
        nombre: "ENTRADAS",
        titulo: "ENTRADAS",
        descripcion: "Para compartir y abrir el apetito.",
        icono: "🥟",
        activo: true,
        platos: [
            {
                id: "buñuelos-acelga",
                nombre: "Buñuelos de acelga",
                descripcion: "Clásicos, caseros y recién preparados.",
                precio: ""
            },
            {
                id: "empanadas",
                nombre: "Empanadas",
                descripcion: "Variedades de la casa.",
                precio: ""
            }
        ]
    },

    {
        id: "picadas",
        nombre: "PICADAS",
        titulo: "PICADAS",
        descripcion: "Opciones ideales para compartir.",
        icono: "🧀",
        activo: true,
        platos: [
            {
                id: "picada-cebollitas",
                nombre: "Picada Los Cebollitas",
                descripcion: "Selección de fiambres, quesos y acompañamientos.",
                precio: ""
            }
        ]
    },

    {
        id: "pastas",
        nombre: "PASTAS",
        titulo: "PASTAS",
        descripcion: "Pastas y platos reconfortantes.",
        icono: "🍝",
        activo: true,
        platos: [
            {
                id: "pastas-casa",
                nombre: "Pastas de la casa",
                descripcion: "Consultá las variedades disponibles.",
                precio: ""
            }
        ]
    },

    {
        id: "carnes",
        nombre: "CARNES",
        titulo: "CARNES",
        descripcion: "Clásicos argentinos para disfrutar.",
        icono: "🥩",
        activo: true,
        platos: [
            {
                id: "carne-casa",
                nombre: "Especialidad de la casa",
                descripcion: "Consultá disponibilidad y guarniciones.",
                precio: ""
            }
        ]
    },

    {
        id: "hamburguesas",
        nombre: "HAMBURGUESAS",
        titulo: "HAMBURGUESAS",
        descripcion: "Opciones para comer bien y sin vueltas.",
        icono: "🍔",
        activo: true,
        platos: [
            {
                id: "hamburguesa-cebollitas",
                nombre: "Hamburguesa Los Cebollitas",
                descripcion: "Consultá ingredientes y acompañamiento.",
                precio: ""
            }
        ]
    },

    {
        id: "postres",
        nombre: "POSTRES",
        titulo: "POSTRES",
        descripcion: "Algo dulce para cerrar la comida.",
        icono: "🍰",
        activo: true,
        platos: [
            {
                id: "postre-casa",
                nombre: "Postre de la casa",
                descripcion: "Consultá las opciones disponibles.",
                precio: ""
            }
        ]
    },

    {
        id: "bebidas",
        nombre: "BEBIDAS",
        titulo: "BEBIDAS",
        descripcion: "Bebidas para acompañar cada momento.",
        icono: "🥤",
        activo: true,
        platos: [
            {
                id: "bebidas",
                nombre: "Bebidas",
                descripcion: "Consultá las variedades disponibles.",
                precio: ""
            }
        ]
    }
];


/* =====================================================
   ESTADO
===================================================== */

let categoriaAbierta = null;
let estrellasSeleccionadas = 0;
let temporizadorMensaje = null;
let temporizadorEvento = null;


/* =====================================================
   UTILIDADES
===================================================== */

function obtenerStorage(clave, valorPorDefecto = null) {

    try {

        const dato = localStorage.getItem(clave);

        if (dato === null) {
            return valorPorDefecto;
        }

        return JSON.parse(dato);

    } catch (error) {

        console.warn(
            `No se pudo leer localStorage: ${clave}`,
            error
        );

        return valorPorDefecto;
    }
}


function guardarStorage(clave, valor) {

    try {

        localStorage.setItem(
            clave,
            JSON.stringify(valor)
        );

        return true;

    } catch (error) {

        console.warn(
            `No se pudo guardar localStorage: ${clave}`,
            error
        );

        return false;
    }
}


function escapeHTML(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {
        return "";
    }

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function normalizarTexto(valor, valorPorDefecto = "") {

    if (
        valor === null ||
        valor === undefined
    ) {
        return valorPorDefecto;
    }

    return String(valor).trim();
}


function generarId(prefijo = "id") {

    return (
        prefijo +
        "-" +
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 8)
    );
}


function obtenerFechaTimestamp(fecha) {

    if (
        typeof fecha !== "string" ||
        !fecha
    ) {
        return null;
    }

    const fechaISO =
        /^\d{4}-\d{2}-\d{2}$/.test(fecha)
            ? `${fecha}T00:00:00`
            : fecha;

    const timestamp =
        new Date(fechaISO).getTime();

    return Number.isNaN(timestamp)
        ? null
        : timestamp;
}


function fechaEsValida(fecha) {

    return (
        obtenerFechaTimestamp(fecha) !== null
    );
}


function obtenerHoySinHora() {

    const hoy = new Date();

    hoy.setHours(
        0,
        0,
        0,
        0
    );

    return hoy;
}


function esFechaHoyOFutura(fecha) {

    if (!fecha) {
        return true;
    }

    const timestamp =
        obtenerFechaTimestamp(fecha);

    if (timestamp === null) {
        return true;
    }

    const hoy =
        obtenerHoySinHora().getTime();

    return timestamp >= hoy;
}


function formatearFecha(fecha) {

    if (
        typeof fecha !== "string" ||
        !fecha
    ) {
        return "Próximamente";
    }

    const partes =
        fecha.split("-");

    if (
        partes.length !== 3
    ) {
        return fecha;
    }

    const [
        anio,
        mes,
        dia
    ] = partes;

    if (
        !anio ||
        !mes ||
        !dia
    ) {
        return fecha;
    }

    return `${dia}/${mes}/${anio}`;
}


function normalizarUrl(url, fallback = "#reservar") {

    const valor =
        normalizarTexto(url);

    if (!valor) {
        return fallback;
    }

    if (
        valor.startsWith("#") ||
        valor.startsWith("/") ||
        valor.startsWith("./")
    ) {
        return valor;
    }

    try {

        const urlObj =
            new URL(
                valor,
                window.location.href
            );

        const protocolosPermitidos = [
            "http:",
            "https:",
            "tel:",
            "mailto:"
        ];

        if (
            protocolosPermitidos.includes(
                urlObj.protocol
            )
        ) {
            return urlObj.href;
        }

    } catch (error) {

        return fallback;
    }

    return fallback;
}


/* =====================================================
   EVENTOS
===================================================== */

function obtenerEventos() {

    const eventos =
        obtenerStorage(
            STORAGE_KEYS.eventos,
            []
        );

    if (!Array.isArray(eventos)) {
        return [];
    }

    return eventos;
}


function normalizarEvento(evento) {

    if (
        !evento ||
        typeof evento !== "object"
    ) {
        return null;
    }

    return {
        ...evento,

        id:
            evento.id ??
            Date.now(),

        titulo:
            normalizarTexto(
                evento.titulo,
                "¡DÍA DE PARTIDO!"
            ),

        descripcion:
            normalizarTexto(
                evento.descripcion,
                "Viví el partido junto al Bicho."
            ),

        partido:
            normalizarTexto(
                evento.partido
            ),

        fecha:
            normalizarTexto(
                evento.fecha
            ),

        hora:
            normalizarTexto(
                evento.hora,
                "Horario a confirmar"
            ),

        botonTexto:
            normalizarTexto(
                evento.botonTexto,
                "RESERVAR MESA"
            ),

        botonLink:
            normalizarUrl(
                evento.botonLink,
                "#reservar"
            ),

        imagen:
            normalizarTexto(
                evento.imagen
            ),

        activo:
            evento.activo !== false
    };
}


function obtenerEventosValidos() {

    return obtenerEventos()
        .map(normalizarEvento)
        .filter(Boolean)
        .filter((evento) => {

            if (!evento.activo) {
                return false;
            }

            return esFechaHoyOFutura(
                evento.fecha
            );
        })
        .sort((a, b) => {

            const idA =
                Number(a.id) || 0;

            const idB =
                Number(b.id) || 0;

            if (idA !== idB) {
                return idB - idA;
            }

            const fechaA =
                obtenerFechaTimestamp(
                    a.fecha
                ) || 0;

            const fechaB =
                obtenerFechaTimestamp(
                    b.fecha
                ) || 0;

            return fechaB - fechaA;
        });
}


function mostrarEventoDestacado() {

    const contenedor =
        document.getElementById(
            "eventoDestacado"
        );

    if (!contenedor) {
        return;
    }

    const eventosValidos =
        obtenerEventosValidos();

    if (
        eventosValidos.length === 0
    ) {

        ocultarEvento();

        return;
    }

    const evento =
        eventosValidos[0];

    const titulo =
        document.getElementById(
            "eventoTitulo"
        );

    const descripcion =
        document.getElementById(
            "eventoDescripcion"
        );

    const fecha =
        document.getElementById(
            "eventoFecha"
        );

    const hora =
        document.getElementById(
            "eventoHora"
        );

    const boton =
        document.getElementById(
            "eventoBoton"
        );

    const fondo =
        contenedor.querySelector(
            ".evento-fondo"
        );


    /* =================================================
       TITULO
    ================================================= */

    if (titulo) {

        titulo.textContent =
            evento.titulo ||
            "¡DÍA DE PARTIDO!";
    }


    /* =================================================
       DESCRIPCIÓN
    ================================================= */

    if (descripcion) {

        const descripcionBase =
            evento.descripcion ||
            "Viví el partido junto al Bicho.";

        if (evento.partido) {

            descripcion.textContent =
                `${evento.partido} — ${descripcionBase}`;

        } else {

            descripcion.textContent =
                descripcionBase;
        }
    }


    /* =================================================
       FECHA
    ================================================= */

    if (fecha) {

        fecha.textContent =
            `📅 ${
                evento.fecha
                    ? formatearFecha(
                        evento.fecha
                    )
                    : "Próximamente"
            }`;
    }


    /* =================================================
       HORA
    ================================================= */

    if (hora) {

        hora.textContent =
            `🕐 ${
                evento.hora ||
                "Horario a confirmar"
            }`;
    }


    /* =================================================
       BOTON
    ================================================= */

    if (boton) {

        boton.innerHTML = `
            ${escapeHTML(
                evento.botonTexto ||
                "RESERVAR MESA"
            )}
            <span aria-hidden="true">→</span>
        `;

        boton.href =
            normalizarUrl(
                evento.botonLink,
                "#reservar"
            );

        if (
            boton.href.startsWith(
                "http://"
            ) ||
            boton.href.startsWith(
                "https://"
            )
        ) {

            boton.target = "_blank";

            boton.rel =
                "noopener noreferrer";

        } else {

            boton.removeAttribute(
                "target"
            );

            boton.removeAttribute(
                "rel"
            );
        }
    }


    /* =================================================
       IMAGEN
    ================================================= */

    if (fondo) {

        if (evento.imagen) {

            fondo.style.backgroundImage =
                `url("${evento.imagen
                    .replace(/\\/g, "\\\\")
                    .replace(/"/g, '\\"')
                }")`;

            fondo.classList.add(
                "tiene-imagen"
            );

        } else {

            fondo.style.backgroundImage =
                "";

            fondo.classList.remove(
                "tiene-imagen"
            );
        }
    }


    /* =================================================
       MOSTRAR
    ================================================= */

    contenedor.classList.remove(
        "cerrando"
    );

    contenedor.classList.add(
        "visible"
    );

    contenedor.setAttribute(
        "aria-hidden",
        "false"
    );
}


function ocultarEvento() {

    const contenedor =
        document.getElementById(
            "eventoDestacado"
        );

    if (!contenedor) {
        return;
    }

    contenedor.classList.remove(
        "visible",
        "cerrando"
    );

    contenedor.setAttribute(
        "aria-hidden",
        "true"
    );
}


function cerrarEvento() {

    const contenedor =
        document.getElementById(
            "eventoDestacado"
        );

    if (!contenedor) {
        return;
    }

    clearTimeout(
        temporizadorEvento
    );

    contenedor.classList.add(
        "cerrando"
    );

    temporizadorEvento =
        setTimeout(
            () => {

                contenedor.classList.remove(
                    "visible",
                    "cerrando"
                );

                contenedor.setAttribute(
                    "aria-hidden",
                    "true"
                );

            },
            CONFIG.eventoSalidaMs
        );
}


/* =====================================================
   MENU
===================================================== */

function obtenerMenu() {

    const menu =
        obtenerStorage(
            STORAGE_KEYS.menu,
            null
        );

    if (
        Array.isArray(menu) &&
        menu.length > 0
    ) {
        return menu;
    }

    return MENU_POR_DEFECTO;
}


function obtenerPlatos(categoria) {

    if (!categoria) {
        return [];
    }

    const posibles = [
        categoria.platos,
        categoria.items,
        categoria.productos,
        categoria.menu
    ];

    for (const lista of posibles) {

        if (Array.isArray(lista)) {
            return lista;
        }
    }

    return [];
}


function normalizarCategoria(
    categoria,
    indice
) {

    if (
        !categoria ||
        typeof categoria !== "object"
    ) {
        return null;
    }

    const platos =
        obtenerPlatos(
            categoria
        );

    return {
        ...categoria,

        id:
            normalizarTexto(
                categoria.id,
                `categoria-${indice}`
            ),

        nombre:
            normalizarTexto(
                categoria.nombre ||
                categoria.titulo ||
                categoria.nombreCategoria,
                `Categoría ${indice + 1}`
            ),

        titulo:
            normalizarTexto(
                categoria.titulo ||
                categoria.nombre,
                `Categoría ${indice + 1}`
            ),

        descripcion:
            normalizarTexto(
                categoria.descripcion,
                "Descubrí nuestras opciones."
            ),

        icono:
            normalizarTexto(
                categoria.icono ||
                categoria.emoji,
                "🍽️"
            ),

        activo:
            categoria.activo !== false,

        platos:
            platos
                .map(
                    normalizarPlato
                )
                .filter(Boolean)
    };
}


function normalizarPlato(
    plato,
    indice
) {

    if (
        typeof plato === "string"
    ) {

        return {
            id:
                `plato-${indice}`,

            nombre:
                plato,

            descripcion:
                "",

            precio:
                ""
        };
    }

    if (
        !plato ||
        typeof plato !== "object"
    ) {
        return null;
    }

    return {
        ...plato,

        id:
            normalizarTexto(
                plato.id,
                `plato-${indice}`
            ),

        nombre:
            normalizarTexto(
                plato.nombre ||
                plato.titulo ||
                plato.nombrePlato,
                "Plato"
            ),

        descripcion:
            normalizarTexto(
                plato.descripcion ||
                plato.detalle ||
                plato.ingredientes
            ),

        precio:
            normalizarTexto(
                plato.precio ||
                plato.valor
            ),

        activo:
            plato.activo !== false
    };
}


function obtenerCategoriasMenu() {

    return obtenerMenu()
        .map(
            normalizarCategoria
        )
        .filter(Boolean)
        .filter(
            categoria =>
                categoria.activo
        );
}


function renderizarMenu() {

    const contenedor =
        document.getElementById(
            "menuDinamico"
        );

    if (!contenedor) {
        return;
    }

    const categorias =
        obtenerCategoriasMenu();

    if (
        categorias.length === 0
    ) {

        contenedor.innerHTML = `
            <div class="menu-vacio">
                El menú se encuentra temporalmente
                sin categorías disponibles.
            </div>
        `;

        return;
    }

    contenedor.innerHTML =
        categorias
            .map(
                (
                    categoria,
                    indice
                ) =>
                    crearCategoriaHTML(
                        categoria,
                        indice
                    )
            )
            .join("");

    prepararAcordeonMenu();
}


function crearCategoriaHTML(
    categoria,
    indice
) {

    const id =
        `categoria-${slugSeguro(
            categoria.id ||
            categoria.nombre ||
            indice
        )}-${indice}`;

    const categoriaId =
        escapeHTML(id);

    const nombre =
        escapeHTML(
            categoria.nombre
        );

    const descripcion =
        escapeHTML(
            categoria.descripcion
        );

    const icono =
        escapeHTML(
            categoria.icono
        );

    const titulo =
        escapeHTML(
            categoria.titulo
        );

    const platos =
        categoria.platos
            .filter(
                plato =>
                    plato.activo !== false
            );

    const platosHTML =
        platos.length > 0
            ? platos
                .map(
                    crearPlatoHTML
                )
                .join("")
            : `
                <div class="menu-vacio">
                    Próximamente agregaremos
                    opciones a esta categoría.
                </div>
            `;

    return `
        <article
            class="categoria-contenedor"
            data-categoria-id="${categoriaId}"
        >

            <button
                type="button"
                class="categoria-boton"
                data-categoria="${categoriaId}"
                aria-expanded="false"
                aria-controls="carta-${categoriaId}"
            >

                <span class="categoria-info">

                    <span
                        class="categoria-icono"
                        aria-hidden="true"
                    >
                        ${icono}
                    </span>

                    <span class="categoria-texto">

                        <strong>
                            ${nombre}
                        </strong>

                        <small>
                            ${descripcion}
                        </small>

                    </span>

                </span>

                <span
                    class="categoria-flecha"
                    aria-hidden="true"
                >
                    ↓
                </span>

            </button>

            <div
                id="carta-${categoriaId}"
                class="carta-categoria"
                aria-hidden="true"
            >

                <div class="carta-categoria-inner">

                    <div class="carta-titulo">
                        ${titulo}
                    </div>

                    ${platosHTML}

                </div>

            </div>

        </article>
    `;
}


function crearPlatoHTML(
    plato
) {

    const nombre =
        escapeHTML(
            plato.nombre
        );

    const descripcion =
        escapeHTML(
            plato.descripcion
        );

    const precio =
        escapeHTML(
            plato.precio
        );

    const descripcionHTML =
        descripcion
            ? `
                <small>
                    ${descripcion}
                </small>
            `
            : "";

    const precioHTML =
        precio
            ? `
                <span class="plato-precio">
                    ${precio}
                </span>
            `
            : "";

    return `
        <div class="plato">

            <div class="plato-info">

                <strong>
                    ${nombre}
                </strong>

                ${descripcionHTML}

            </div>

            ${precioHTML}

        </div>
    `;
}


function slugSeguro(valor) {

    return String(valor)
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        )
        .slice(0, 60) ||
        "categoria";
}


/* =====================================================
   ACORDEON DEL MENU
===================================================== */

function prepararAcordeonMenu() {

    const botones =
        document.querySelectorAll(
            ".categoria-boton"
        );

    botones.forEach(
        boton => {

            boton.addEventListener(
                "click",
                () => {

                    const id =
                        boton.dataset.categoria;

                    if (
                        categoriaAbierta === id
                    ) {

                        cerrarTodasLasCategorias();

                        categoriaAbierta =
                            null;

                        return;
                    }

                    abrirCategoria(
                        id
                    );
                }
            );
        }
    );
}


function abrirCategoria(id) {

    cerrarTodasLasCategorias();

    const boton =
        document.querySelector(
            `.categoria-boton[data-categoria="${cssEscape(
                id
            )}"]`
        );

    if (!boton) {
        return;
    }

    const cartaId =
        boton.getAttribute(
            "aria-controls"
        );

    const carta =
        document.getElementById(
            cartaId
        );

    if (!carta) {
        return;
    }

    boton.classList.add(
        "activo"
    );

    carta.classList.add(
        "abierta"
    );

    boton.setAttribute(
        "aria-expanded",
        "true"
    );

    carta.setAttribute(
        "aria-hidden",
        "false"
    );

    categoriaAbierta = id;
}


function cerrarTodasLasCategorias() {

    const botones =
        document.querySelectorAll(
            ".categoria-boton"
        );

    const cartas =
        document.querySelectorAll(
            ".carta-categoria"
        );

    botones.forEach(
        boton => {

            boton.classList.remove(
                "activo"
            );

            boton.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    );

    cartas.forEach(
        carta => {

            carta.classList.remove(
                "abierta"
            );

            carta.setAttribute(
                "aria-hidden",
                "true"
            );
        }
    );
}


function cssEscape(valor) {

    if (
        window.CSS &&
        typeof window.CSS.escape === "function"
    ) {
        return window.CSS.escape(
            String(valor)
        );
    }

    return String(valor)
        .replace(
            /["\\]/g,
            "\\$&"
        );
}


/* =====================================================
   RESEÑAS
===================================================== */

function obtenerResenas() {

    const resenas =
        obtenerStorage(
            STORAGE_KEYS.resenas,
            []
        );

    if (!Array.isArray(resenas)) {
        return [];
    }

    return resenas
        .filter(
            resena =>
                resena &&
                typeof resena === "object"
        )
        .sort(
            (a, b) =>
                Number(
                    b.id || 0
                ) -
                Number(
                    a.id || 0
                )
        );
}


function configurarEstrellas() {

    const contenedor =
        document.getElementById(
            "estrellas"
        );

    if (!contenedor) {
        return;
    }

    const botones =
        contenedor.querySelectorAll(
            "button[data-estrellas]"
        );

    botones.forEach(
        boton => {

            boton.addEventListener(
                "click",
                () => {

                    const cantidad =
                        Number(
                            boton.dataset.estrellas
                        );

                    seleccionarEstrellas(
                        cantidad
                    );
                }
            );

            boton.addEventListener(
                "mouseenter",
                () => {

                    const cantidad =
                        Number(
                            boton.dataset.estrellas
                        );

                    previsualizarEstrellas(
                        cantidad
                    );
                }
            );
        }
    );

    contenedor.addEventListener(
        "mouseleave",
        () => {

            pintarEstrellas(
                estrellasSeleccionadas
            );
        }
    );
}


function seleccionarEstrellas(
    cantidad
) {

    if (
        cantidad < 1 ||
        cantidad > 5
    ) {
        return;
    }

    estrellasSeleccionadas =
        cantidad;

    pintarEstrellas(
        cantidad
    );
}


function previsualizarEstrellas(
    cantidad
) {

    pintarEstrellas(
        cantidad
    );
}


function pintarEstrellas(
    cantidad
) {

    const botones =
        document.querySelectorAll(
            "#estrellas button[data-estrellas]"
        );

    botones.forEach(
        boton => {

            const numero =
                Number(
                    boton.dataset.estrellas
                );

            const activa =
                numero <= cantidad;

            boton.classList.toggle(
                "seleccionada",
                activa
            );

            boton.setAttribute(
                "aria-pressed",
                activa &&
                numero === cantidad
                    ? "true"
                    : "false"
            );
        }
    );
}


function configurarContadorResena() {

    const textarea =
        document.getElementById(
            "textoResena"
        );

    const contador =
        document.getElementById(
            "contadorResena"
        );

    if (
        !textarea ||
        !contador
    ) {
        return;
    }

    const actualizar =
        () => {

            contador.textContent =
                textarea.value.length;
        };

    textarea.addEventListener(
        "input",
        actualizar
    );

    actualizar();
}


function mostrarMensajeResena(
    mensaje,
    tipo = "exito"
) {

    const elemento =
        document.getElementById(
            "mensajeResena"
        );

    if (!elemento) {
        return;
    }

    clearTimeout(
        temporizadorMensaje
    );

    elemento.textContent =
        mensaje;

    elemento.classList.remove(
        "exito",
        "error",
        "mostrar"
    );

    elemento.classList.add(
        tipo
    );

    requestAnimationFrame(
        () => {

            elemento.classList.add(
                "mostrar"
            );
        }
    );

    temporizadorMensaje =
        setTimeout(
            () => {

                elemento.classList.remove(
                    "mostrar"
                );

            },
            3500
        );
}


function publicarResena() {

    const nombreInput =
        document.getElementById(
            "nombreResena"
        );

    const textoInput =
        document.getElementById(
            "textoResena"
        );

    if (
        !nombreInput ||
        !textoInput
    ) {
        return;
    }

    const nombre =
        normalizarTexto(
            nombreInput.value
        );

    const texto =
        normalizarTexto(
            textoInput.value
        );


    /* =================================================
       VALIDACIONES
    ================================================= */

    if (!nombre) {

        mostrarMensajeResena(
            "Por favor ingresá tu nombre.",
            "error"
        );

        nombreInput.focus();

        return;
    }

    if (
        nombre.length >
        CONFIG.maxNombre
    ) {

        mostrarMensajeResena(
            `El nombre no puede superar los ${CONFIG.maxNombre} caracteres.`,
            "error"
        );

        nombreInput.focus();

        return;
    }

    if (
        estrellasSeleccionadas < 1
    ) {

        mostrarMensajeResena(
            "Seleccioná una calificación.",
            "error"
        );

        return;
    }

    if (!texto) {

        mostrarMensajeResena(
            "Escribí tu opinión antes de publicarla.",
            "error"
        );

        textoInput.focus();

        return;
    }

    if (
        texto.length >
        CONFIG.maxResena
    ) {

        mostrarMensajeResena(
            `La opinión no puede superar los ${CONFIG.maxResena} caracteres.`,
            "error"
        );

        textoInput.focus();

        return;
    }


    /* =================================================
       CREAR RESEÑA
    ================================================= */

    const resenas =
        obtenerResenas();

    const nuevaResena = {
        id: Date.now(),

        nombre,

        estrellas:
            estrellasSeleccionadas,

        texto,

        fecha:
            new Date().toISOString()
    };

    resenas.unshift(
        nuevaResena
    );

    const guardado =
        guardarStorage(
            STORAGE_KEYS.resenas,
            resenas
        );

    if (!guardado) {

        mostrarMensajeResena(
            "No se pudo guardar la reseña. Intentá nuevamente.",
            "error"
        );

        return;
    }


    /* =================================================
       LIMPIAR FORMULARIO
    ================================================= */

    nombreInput.value = "";

    textoInput.value = "";

    estrellasSeleccionadas =
        0;

    pintarEstrellas(0);

    configurarContadorResena();


    /* =================================================
       ACTUALIZAR
    ================================================= */

    renderizarResenas();

    mostrarMensajeResena(
        "¡Gracias por compartir tu opinión!",
        "exito"
    );
}


function formatearFechaResena(
    fecha
) {

    if (!fecha) {
        return "";
    }

    const fechaObj =
        new Date(fecha);

    if (
        Number.isNaN(
            fechaObj.getTime()
        )
    ) {
        return "";
    }

    return fechaObj.toLocaleDateString(
        "es-AR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


function crearEstrellasHTML(
    cantidad
) {

    const numero =
        Math.max(
            0,
            Math.min(
                5,
                Number(cantidad) || 0
            )
        );

    return "★".repeat(
        numero
    ) +
        "☆".repeat(
            5 - numero
        );
}


function renderizarResenas() {

    const contenedor =
        document.getElementById(
            "listaResenas"
        );

    if (!contenedor) {
        return;
    }

    const resenas =
        obtenerResenas();

    if (
        resenas.length === 0
    ) {

        contenedor.innerHTML = `
            <div class="sin-resenas">
                Todavía no hay reseñas publicadas.
                ¡Sé el primero en dejar tu opinión!
            </div>
        `;

        return;
    }

    contenedor.innerHTML =
        resenas
            .map(
                crearResenaHTML
            )
            .join("");
}


function crearResenaHTML(
    resena
) {

    const nombre =
        escapeHTML(
            normalizarTexto(
                resena.nombre,
                "Cliente"
            )
        );

    const texto =
        escapeHTML(
            normalizarTexto(
                resena.texto ||
                resena.comentario
            )
        );

    const estrellas =
        Math.max(
            0,
            Math.min(
                5,
                Number(
                    resena.estrellas
                ) || 0
            )
        );

    const fecha =
        escapeHTML(
            formatearFechaResena(
                resena.fecha
            )
        );

    const respuesta =
        normalizarTexto(
            resena.respuestaAdmin ||
            resena.respuesta
        );

    return `
        <article class="resena">

            <div class="resena-estrellas">
                ${crearEstrellasHTML(
                    estrellas
                )}
            </div>

            <h3>
                ${nombre}
            </h3>

            <p>
                ${texto}
            </p>

            ${
                fecha
                    ? `
                        <small>
                            ${fecha}
                        </small>
                    `
                    : ""
            }

            ${
                respuesta
                    ? `
                        <div class="respuesta-admin">

                            <strong>
                                Respuesta de la Cantina
                            </strong>

                            <p>
                                ${escapeHTML(
                                    respuesta
                                )}
                            </p>

                        </div>
                    `
                    : ""
            }

        </article>
    `;
}


/* =====================================================
   HEADER Y MENU MOBILE
===================================================== */

function configurarMenuMobile() {

    const toggle =
        document.getElementById(
            "menuToggle"
        );

    const menu =
        document.getElementById(
            "menuNavegacion"
        );

    if (
        !toggle ||
        !menu
    ) {
        return;
    }

    toggle.addEventListener(
        "click",
        () => {

            const abierto =
                menu.classList.toggle(
                    "abierto"
                );

            toggle.classList.toggle(
                "abierto",
                abierto
            );

            toggle.setAttribute(
                "aria-expanded",
                String(abierto)
            );

            toggle.setAttribute(
                "aria-label",
                abierto
                    ? "Cerrar menú"
                    : "Abrir menú"
            );
        }
    );


    /* Cerrar al tocar un enlace */

    menu.querySelectorAll(
        "a"
    ).forEach(
        enlace => {

            enlace.addEventListener(
                "click",
                () => {

                    cerrarMenuMobile();
                }
            );
        }
    );


    /* Cerrar al tocar fuera */

    document.addEventListener(
        "click",
        evento => {

            if (
                !menu.classList.contains(
                    "abierto"
                )
            ) {
                return;
            }

            const estaDentro =
                menu.contains(
                    evento.target
                );

            const esBoton =
                toggle.contains(
                    evento.target
                );

            if (
                !estaDentro &&
                !esBoton
            ) {
                cerrarMenuMobile();
            }
        }
    );


    /* Cerrar con Escape */

    document.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key === "Escape"
            ) {

                cerrarMenuMobile();
            }
        }
    );
}


function cerrarMenuMobile() {

    const toggle =
        document.getElementById(
            "menuToggle"
        );

    const menu =
        document.getElementById(
            "menuNavegacion"
        );

    if (
        !toggle ||
        !menu
    ) {
        return;
    }

    menu.classList.remove(
        "abierto"
    );

    toggle.classList.remove(
        "abierto"
    );

    toggle.setAttribute(
        "aria-expanded",
        "false"
    );

    toggle.setAttribute(
        "aria-label",
        "Abrir menú"
    );
}


/* =====================================================
   HEADER SCROLL
===================================================== */

function configurarHeaderScroll() {

    const header =
        document.getElementById(
            "header"
        );

    if (!header) {
        return;
    }

    const actualizar =
        () => {

            header.classList.toggle(
                "scrolled",
                window.scrollY > 20
            );
        };

    window.addEventListener(
        "scroll",
        actualizar,
        {
            passive: true
        }
    );

    actualizar();
}


/* =====================================================
   NAVEGACION ACTIVA
===================================================== */

function configurarNavegacionActiva() {

    const enlaces =
        Array.from(
            document.querySelectorAll(
                ".menu a[href^='#']"
            )
        );

    if (
        enlaces.length === 0
    ) {
        return;
    }

    const secciones =
        enlaces
            .map(
                enlace => {

                    const id =
                        enlace
                            .getAttribute(
                                "href"
                            )
                            .slice(1);

                    return document.getElementById(
                        id
                    );
                }
            )
            .filter(Boolean);

    const observer =
        new IntersectionObserver(
            entries => {

                const visibles =
                    entries
                        .filter(
                            entry =>
                                entry.isIntersecting
                        )
                        .sort(
                            (a, b) =>
                                b.intersectionRatio -
                                a.intersectionRatio
                        );

                if (
                    visibles.length === 0
                ) {
                    return;
                }

                const id =
                    visibles[0]
                        .target
                        .id;

                enlaces.forEach(
                    enlace => {

                        enlace.classList.toggle(
                            "activo",
                            enlace.getAttribute(
                                "href"
                            ) === `#${id}`
                        );
                    }
                );
            },
            {
                root: null,

                rootMargin:
                    "-25% 0px -60% 0px",

                threshold: [
                    0,
                    0.15,
                    0.3,
                    0.5
                ]
            }
        );

    secciones.forEach(
        seccion =>
            observer.observe(
                seccion
            )
    );
}


/* =====================================================
   EVENTO — BOTON CERRAR
===================================================== */

function configurarEvento() {

    const botonCerrar =
        document.getElementById(
            "cerrarEvento"
        );

    if (!botonCerrar) {
        return;
    }

    botonCerrar.addEventListener(
        "click",
        cerrarEvento
    );
}


/* =====================================================
   ACTUALIZACION ENTRE PESTAÑAS
===================================================== */

function configurarSincronizacionStorage() {

    window.addEventListener(
        "storage",
        evento => {

            if (
                evento.key ===
                STORAGE_KEYS.menu
            ) {

                renderizarMenu();
            }

            if (
                evento.key ===
                STORAGE_KEYS.resenas
            ) {

                renderizarResenas();
            }

            if (
                evento.key ===
                STORAGE_KEYS.eventos
            ) {

                mostrarEventoDestacado();
            }
        }
    );
}


/* =====================================================
   BOTONES RESERVA
===================================================== */

function configurarBotonesReserva() {

    const botones =
        document.querySelectorAll(
            'a[href="#reservar"]'
        );

    botones.forEach(
        boton => {

            boton.addEventListener(
                "click",
                () => {

                    cerrarMenuMobile();
                }
            );
        }
    );
}


/* =====================================================
   INICIALIZACION
===================================================== */

function inicializarPagina() {

    renderizarMenu();

    renderizarResenas();

    configurarEstrellas();

    configurarContadorResena();

    configurarMenuMobile();

    configurarHeaderScroll();

    configurarNavegacionActiva();

    configurarEvento();

    configurarSincronizacionStorage();

    configurarBotonesReserva();

    mostrarEventoDestacado();


    /* =================================================
       PUBLICAR RESEÑA
    ================================================= */

    const botonPublicar =
        document.getElementById(
            "publicarResena"
        );

    if (botonPublicar) {

        botonPublicar.addEventListener(
            "click",
            publicarResena
        );
    }
}


/* =====================================================
   ARRANQUE
===================================================== */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        inicializarPagina
    );

} else {

    inicializarPagina();
}

/* ==========================================
   EVENTO DESTACADO
========================================== */

document.addEventListener("DOMContentLoaded", cargarEventoActivo);

function cargarEventoActivo() {

    const eventos =
        JSON.parse(localStorage.getItem("eventos") || "[]");

    const evento =
        eventos.find(e => e.activo !== false);

    const contenedor =
        document.getElementById("eventoContenido");

    if (!contenedor) return;

    if (!evento) {

        contenedor.innerHTML = `
            <div class="evento-vacio">
                <h3>📢 No hay eventos programados</h3>
                <p>Pronto anunciaremos nuevos partidos y promociones.</p>
            </div>
        `;

        return;
    }

    contenedor.innerHTML = `
        <div class="evento-card">

            ${
                evento.imagen
                    ? `<img src="${evento.imagen}" class="evento-img" alt="${evento.titulo}">`
                    : ""
            }

            <div class="evento-info">

                <span class="evento-badge">
                    EVENTO ACTIVO
                </span>

                <h2>${evento.titulo}</h2>

                ${
                    evento.partido
                        ? `<h3>${evento.partido}</h3>`
                        : ""
                }

                <p>${evento.descripcion}</p>

                <div class="evento-fecha">
                    📅 ${evento.fecha}
                    &nbsp;&nbsp;
                    🕐 ${evento.hora}
                </div>

                <a href="${evento.botonLink}"
                   class="evento-btn">
                    ${evento.botonTexto}
                </a>

            </div>

        </div>
    `;
}

/* ==========================================
   EVENTO DESTACADO
========================================== */

document.addEventListener("DOMContentLoaded", cargarEventoDestacado);

function cargarEventoDestacado() {

    const eventos = JSON.parse(localStorage.getItem("eventos") || "[]");

    const evento = eventos.find(e => e.activo !== false);

    if (!evento) {

        document.getElementById("eventoSeccionTitulo").textContent =
            "Próximamente habrá nuevos eventos";

        document.getElementById("eventoSeccionDescripcion").textContent =
            "Seguinos para enterarte de las próximas fechas.";

        document.getElementById("eventoSeccionPartido").style.display = "none";

        return;
    }

    document.getElementById("eventoSeccionTitulo").textContent =
        evento.titulo;

    document.getElementById("eventoSeccionDescripcion").textContent =
        evento.descripcion;

    document.getElementById("eventoSeccionPartido").textContent =
        evento.partido || "";

    document.getElementById("eventoSeccionFecha").textContent =
        evento.fecha;

    document.getElementById("eventoSeccionHora").textContent =
        evento.hora;

    const boton = document.getElementById("eventoSeccionBoton");

    boton.textContent =
        evento.botonTexto || "Reservar mesa";

    boton.href =
        evento.botonLink || "#reservar";

    if (evento.imagen) {

        document.getElementById("eventoSeccionFondo").style.backgroundImage =
            `url("${evento.imagen}")`;

    }
}

/* =====================================================
   ESTADO ABIERTO / CERRADO
===================================================== */

function actualizarEstadoCantina() {

    const contenedor =
        document.getElementById(
            "estadoCantina"
        );

    if (!contenedor) {
        return;
    }

    const titulo =
        document.getElementById(
            "estadoTitulo"
        );

    const horario =
        document.getElementById(
            "estadoHorario"
        );

    const ahora =
        new Date();

    const dia =
        ahora.getDay();

    const minutos =
        ahora.getHours() * 60 +
        ahora.getMinutes();

    let abierto = false;

    let cierre = "22:00 hs";

    if (dia >= 1 && dia <= 4) {

        abierto =
            minutos >= 9 * 60 &&
            minutos < 22 * 60;

        cierre = "22:00 hs";

    } else {

        abierto =
            minutos >= 9 * 60;

        cierre = "00:00 hs";

    }

    if (abierto) {

        contenedor.classList.remove(
            "cerrado"
        );

        titulo.textContent =
            "ABIERTO AHORA";

        horario.textContent =
            `Hasta las ${cierre}`;

    } else {

        contenedor.classList.add(
            "cerrado"
        );

        titulo.textContent =
            "CERRADO";

        horario.textContent =
            "Abrimos a las 09:00 hs";

    }

}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        actualizarEstadoCantina();

        setInterval(
            actualizarEstadoCantina,
            60000
        );

    }
);
