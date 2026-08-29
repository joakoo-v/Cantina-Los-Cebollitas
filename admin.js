"use strict";

/* =========================================================
   LOS CEBOLLITAS
   ADMIN.JS — PANEL COMPLETO
========================================================= */


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const ADMIN_CONFIG = Object.freeze({

    usuario: "admin",

    contrasena: "admin123",

    sessionKey: "cebollitasAdminSesion",

    userKey: "cebollitasAdminUsuario",

    storage: Object.freeze({
        menu: "menu",
        eventos: "eventos",
        resenas: "resenas",
        reservas: "reservas"
    }),

    legacyStorage: Object.freeze({
        menu: "cartaCantina",
        eventos: "eventosCantina",
        resenas: "resenasCantina",
        reservas: "reservasCantina"
    }),

    whatsapp: "https://wa.me/5491171071742",

    defaultResponse:
        "¡Muchas gracias por tu reseña y por visitarnos! Te esperamos nuevamente en Cantina Los Cebollitas."

});


/* =========================================================
   DATOS POR DEFECTO
========================================================= */

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
                precio: "",
                activo: true
            },
            {
                id: "empanadas",
                nombre: "Empanadas",
                descripcion: "Variedades de la casa.",
                precio: "",
                activo: true
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
                precio: "",
                activo: true
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
                precio: "",
                activo: true
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
                precio: "",
                activo: true
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
                precio: "",
                activo: true
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
                precio: "",
                activo: true
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
                precio: "",
                activo: true
            }
        ]
    }

];


/* =========================================================
   ESTADO
========================================================= */

let resenaAEliminar = null;

let resenaAResponder = null;

let temporizadorNotificacion = null;

let temporizadorBusqueda = null;

let menuActual = [];

let eventosActuales = [];

let resenasActuales = [];


/* =========================================================
   INICIO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    inicializarLogin();

    inicializarNavegacion();

    inicializarBotones();

    inicializarFormularios();

    inicializarModales();

    inicializarBuscadores();

    inicializarPreviews();

    inicializarContadoresTexto();

    inicializarSincronizacion();

    verificarSesion();

});


/* =========================================================
   UTILIDADES
========================================================= */

function generarId(prefijo = "id") {

    return (
        prefijo +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 9)
    );

}


function textoSeguro(valor, fallback = "") {

    if (
        valor === null ||
        valor === undefined
    ) {
        return fallback;
    }

    return String(valor).trim();

}


function escaparHTML(valor) {

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


function escaparAtributo(valor) {

    return escaparHTML(valor)
        .replace(/`/g, "&#096;");

}


function leerStorage(clave, fallback = null, legacy = null) {

    try {

        const principal =
            localStorage.getItem(clave);

        if (principal !== null) {

            return JSON.parse(principal);

        }

        if (legacy) {

            const anterior =
                localStorage.getItem(legacy);

            if (anterior !== null) {

                const datos =
                    JSON.parse(anterior);

                localStorage.setItem(
                    clave,
                    JSON.stringify(datos)
                );

                return datos;

            }

        }

    } catch (error) {

        console.warn(
            "No se pudo leer localStorage:",
            clave,
            error
        );

    }

    return fallback;

}


function guardarStorage(clave, datos) {

    try {

        localStorage.setItem(
            clave,
            JSON.stringify(datos)
        );

        window.dispatchEvent(
            new CustomEvent(
                "cebollitasStorageChange",
                {
                    detail: {
                        clave,
                        datos
                    }
                }
            )
        );

        return true;

    } catch (error) {

        console.error(
            "No se pudo guardar:",
            clave,
            error
        );

        mostrarNotificacion(
            "No se pudo guardar",
            "El navegador no permitió guardar los cambios.",
            "error"
        );

        return false;

    }

}


function obtenerTimestamp(fecha) {

    if (!fecha) {
        return 0;
    }

    const timestamp =
        new Date(fecha).getTime();

    return Number.isNaN(timestamp)
        ? 0
        : timestamp;

}


function formatearFecha(fecha) {

    if (!fecha) {
        return "Fecha no indicada";
    }

    const partes =
        String(fecha).split("-");

    if (partes.length !== 3) {
        return String(fecha);
    }

    const [
        anio,
        mes,
        dia
    ] = partes;

    const fechaObj =
        new Date(
            Number(anio),
            Number(mes) - 1,
            Number(dia)
        );

    if (Number.isNaN(fechaObj.getTime())) {
        return String(fecha);
    }

    return fechaObj.toLocaleDateString(
        "es-AR",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


function formatearFechaCorta(fecha) {

    if (!fecha) {
        return "Sin fecha";
    }

    const timestamp =
        obtenerTimestamp(fecha);

    if (!timestamp) {
        return "Sin fecha";
    }

    return new Date(timestamp)
        .toLocaleDateString(
            "es-AR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

}


function normalizarUrl(
    valor,
    fallback = "#reservar"
) {

    const url =
        textoSeguro(valor);

    if (!url) {
        return fallback;
    }

    if (
        url.startsWith("#") ||
        url.startsWith("/") ||
        url.startsWith("./")
    ) {
        return url;
    }

    try {

        const objeto =
            new URL(
                url,
                window.location.href
            );

        const protocolos = [
            "http:",
            "https:",
            "tel:",
            "mailto:"
        ];

        if (
            protocolos.includes(
                objeto.protocol
            )
        ) {
            return objeto.href;
        }

    } catch (error) {

        return fallback;

    }

    return fallback;

}


function fechaEsValida(fecha) {

    if (!fecha) {
        return false;
    }

    return !Number.isNaN(
        new Date(
            `${fecha}T00:00:00`
        ).getTime()
    );

}


function esFechaPasada(fecha) {

    if (!fecha) {
        return false;
    }

    const fechaEvento =
        new Date(
            `${fecha}T00:00:00`
        );

    fechaEvento.setHours(
        0,
        0,
        0,
        0
    );

    const hoy =
        new Date();

    hoy.setHours(
        0,
        0,
        0,
        0
    );

    return fechaEvento < hoy;

}


/* =========================================================
   LOGIN
========================================================= */

function inicializarLogin() {

    const form =
        document.getElementById(
            "formLogin"
        );

    form?.addEventListener(
        "submit",
        manejarLogin
    );

    const toggle =
        document.getElementById(
            "togglePassword"
        );

    toggle?.addEventListener(
        "click",
        alternarPassword
    );

}


function manejarLogin(event) {

    event.preventDefault();

    const usuario =
        textoSeguro(
            document.getElementById(
                "usuario"
            )?.value
        );

    const contrasena =
        textoSeguro(
            document.getElementById(
                "contrasena"
            )?.value
        );

    const error =
        document.getElementById(
            "errorLogin"
        );

    if (
        usuario.toLowerCase() !==
        ADMIN_CONFIG.usuario.toLowerCase() ||
        contrasena !==
        ADMIN_CONFIG.contrasena
    ) {

        if (error) {

            error.textContent =
                "Usuario o contraseña incorrectos.";

        }

        const password =
            document.getElementById(
                "contrasena"
            );

        password?.classList.add(
            "login-input-error"
        );

        setTimeout(() => {

            password?.classList.remove(
                "login-input-error"
            );

        }, 600);

        return;

    }

    sessionStorage.setItem(
        ADMIN_CONFIG.sessionKey,
        "true"
    );

    sessionStorage.setItem(
        ADMIN_CONFIG.userKey,
        usuario
    );

    if (error) {
        error.textContent = "";
    }

    mostrarPanel();

    mostrarNotificacion(
        "Sesión iniciada",
        "Bienvenido al panel de administración.",
        "success"
    );

}


function verificarSesion() {

    const sesion =
        sessionStorage.getItem(
            ADMIN_CONFIG.sessionKey
        );

    if (sesion === "true") {

        mostrarPanel(false);

    } else {

        mostrarLogin();

    }

}


function mostrarLogin() {

    document
        .getElementById("login")
        ?.classList.remove("hidden");

    document
        .getElementById("panel")
        ?.classList.add("hidden");

}


function mostrarPanel(animar = true) {

    const login =
        document.getElementById("login");

    const panel =
        document.getElementById("panel");

    login?.classList.add("hidden");

    panel?.classList.remove("hidden");

    actualizarUsuario();

    actualizarTodo();

    if (animar) {

        panel.style.opacity = "0";

        requestAnimationFrame(() => {

            panel.style.transition =
                "opacity .30s ease";

            panel.style.opacity = "1";

        });

    }

}


function alternarPassword() {

    const input =
        document.getElementById(
            "contrasena"
        );

    const button =
        document.getElementById(
            "togglePassword"
        );

    if (!input) {
        return;
    }

    const mostrar =
        input.type === "password";

    input.type =
        mostrar
            ? "text"
            : "password";

    button?.setAttribute(
        "aria-pressed",
        String(mostrar)
    );

    button?.setAttribute(
        "aria-label",
        mostrar
            ? "Ocultar contraseña"
            : "Mostrar contraseña"
    );

}


function cerrarSesion() {

    sessionStorage.removeItem(
        ADMIN_CONFIG.sessionKey
    );

    sessionStorage.removeItem(
        ADMIN_CONFIG.userKey
    );

    const usuario =
        document.getElementById(
            "usuario"
        );

    const password =
        document.getElementById(
            "contrasena"
        );

    if (usuario) {
        usuario.value = "";
    }

    if (password) {
        password.value = "";
        password.type = "password";
    }

    document
        .getElementById(
            "errorLogin"
        )
        ?.replaceChildren();

    mostrarLogin();

}


/* =========================================================
   USUARIO
========================================================= */

function actualizarUsuario() {

    const usuario =
        sessionStorage.getItem(
            ADMIN_CONFIG.userKey
        ) ||
        ADMIN_CONFIG.usuario;

    const nombre =
        usuario.charAt(0).toUpperCase() +
        usuario.slice(1);

    const nombreUsuario =
        document.getElementById(
            "nombreUsuario"
        );

    const usuarioHeader =
        document.getElementById(
            "usuarioHeader"
        );

    const avatar =
        document.getElementById(
            "avatarUsuario"
        );

    if (nombreUsuario) {
        nombreUsuario.textContent =
            nombre;
    }

    if (usuarioHeader) {
        usuarioHeader.textContent =
            nombre;
    }

    if (avatar) {
        avatar.textContent =
            nombre.charAt(0).toUpperCase();
    }

}


/* =========================================================
   NAVEGACIÓN
========================================================= */

function inicializarNavegacion() {

    document
        .querySelectorAll(
            ".nav-item[data-section]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    cambiarSeccion(
                        button.dataset.section
                    );

                    cerrarSidebarMobile();

                }
            );

        });

}


function cambiarSeccion(seccion) {

    const secciones =
        document.querySelectorAll(
            ".admin-section"
        );

    secciones.forEach(section => {

        section.classList.toggle(
            "active",
            section.id === seccion
        );

    });

    const botones =
        document.querySelectorAll(
            ".nav-item[data-section]"
        );

    botones.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.section === seccion
        );

    });

    const titulos = {

        dashboard: "Dashboard",

        resenas: "Reseñas",

        carta: "Carta digital",

        eventos: "Eventos",

        reservas: "Reservas"

    };

    const title =
        document.getElementById(
            "pageTitle"
        );

    if (title) {

        title.textContent =
            titulos[seccion] ||
            "Dashboard";

    }

    const breadcrumb =
        document.getElementById(
            "breadcrumb"
        );

    if (breadcrumb) {

        breadcrumb.textContent =
            `LOS CEBOLLITAS / ${
                titulos[seccion] || "PANEL"
            }`;

    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (seccion === "resenas") {
        renderizarResenas();
    }

    if (seccion === "carta") {
        renderizarCarta();
    }

    if (seccion === "eventos") {
        renderizarEventos();
    }

    if (seccion === "reservas") {
        renderizarReservas();
    }

}


/* =========================================================
   BOTONES
========================================================= */

function inicializarBotones() {

    document
        .getElementById(
            "botonLogout"
        )
        ?.addEventListener(
            "click",
            cerrarSesion
        );

    document
        .getElementById(
            "botonRestaurante"
        )
        ?.addEventListener(
            "click",
            () => {

                window.open(
                    "./index.html",
                    "_blank",
                    "noopener,noreferrer"
                );

            }
        );

    document
        .getElementById(
            "verResenas"
        )
        ?.addEventListener(
            "click",
            () => cambiarSeccion(
                "resenas"
            )
        );

    document
        .getElementById(
            "accesoCarta"
        )
        ?.addEventListener(
            "click",
            () => cambiarSeccion(
                "carta"
            )
        );

    document
        .getElementById(
            "accesoEvento"
        )
        ?.addEventListener(
            "click",
            () => cambiarSeccion(
                "eventos"
            )
        );

    document
        .getElementById(
            "cancelarEdicionPlato"
        )
        ?.addEventListener(
            "click",
            limpiarFormularioPlato
        );

    document
        .getElementById(
            "cancelarEdicionEvento"
        )
        ?.addEventListener(
            "click",
            limpiarFormularioEvento
        );

    document
        .getElementById(
            "crearCategoriaButton"
        )
        ?.addEventListener(
            "click",
            () => abrirModalCategoria()
        );

    document
        .querySelectorAll(
            ".quick-action[data-go]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => cambiarSeccion(
                    button.dataset.go
                )
            );

        });

    inicializarMobile();

}


/* =========================================================
   MOBILE
========================================================= */

function inicializarMobile() {

    const button =
        document.getElementById(
            "mobileMenuButton"
        );

    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );

    button?.addEventListener(
        "click",
        toggleSidebarMobile
    );

    overlay?.addEventListener(
        "click",
        cerrarSidebarMobile
    );

}


function toggleSidebarMobile() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );

    const button =
        document.getElementById(
            "mobileMenuButton"
        );

    const abierto =
        sidebar?.classList.toggle(
            "mobile-open"
        );

    overlay?.classList.toggle(
        "visible",
        Boolean(abierto)
    );

    button?.setAttribute(
        "aria-expanded",
        String(Boolean(abierto))
    );

}


function cerrarSidebarMobile() {

    document
        .getElementById(
            "sidebar"
        )
        ?.classList.remove(
            "mobile-open"
        );

    document
        .getElementById(
            "sidebarOverlay"
        )
        ?.classList.remove(
            "visible"
        );

    document
        .getElementById(
            "mobileMenuButton"
        )
        ?.setAttribute(
            "aria-expanded",
            "false"
        );

}


/* =========================================================
   FORMULARIOS
========================================================= */

function inicializarFormularios() {

    document
        .getElementById(
            "formPlato"
        )
        ?.addEventListener(
            "submit",
            guardarPlato
        );

    document
        .getElementById(
            "formEvento"
        )
        ?.addEventListener(
            "submit",
            guardarEvento
        );

    document
        .getElementById(
            "formRespuesta"
        )
        ?.addEventListener(
            "submit",
            guardarRespuesta
        );

    document
        .getElementById(
            "formCategoria"
        )
        ?.addEventListener(
            "submit",
            guardarCategoria
        );

}


/* =========================================================
   MENÚ — LECTURA
========================================================= */

function obtenerMenu() {

    const datos =
        leerStorage(
            ADMIN_CONFIG.storage.menu,
            null,
            ADMIN_CONFIG.legacyStorage.menu
        );

    if (
        Array.isArray(datos) &&
        datos.length
    ) {

        return normalizarMenu(datos);

    }

    return normalizarMenu(
        MENU_POR_DEFECTO
    );

}


function normalizarMenu(menu) {

    if (!Array.isArray(menu)) {
        return [];
    }

    return menu
        .filter(
            categoria =>
                categoria &&
                typeof categoria === "object"
        )
        .map(
            categoria => {

                const platos =
                    Array.isArray(
                        categoria.platos
                    )
                        ? categoria.platos
                        : Array.isArray(
                            categoria.items
                        )
                            ? categoria.items
                            : [];

                return {

                    ...categoria,

                    id:
                        textoSeguro(
                            categoria.id,
                            generarId("cat")
                        ),

                    nombre:
                        textoSeguro(
                            categoria.nombre ||
                            categoria.titulo,
                            "Sin categoría"
                        ),

                    titulo:
                        textoSeguro(
                            categoria.titulo ||
                            categoria.nombre,
                            "Sin categoría"
                        ),

                    descripcion:
                        textoSeguro(
                            categoria.descripcion
                        ),

                    icono:
                        textoSeguro(
                            categoria.icono,
                            "🍽️"
                        ),

                    activo:
                        categoria.activo !== false,

                    platos:
                        platos
                            .filter(
                                plato =>
                                    plato &&
                                    typeof plato === "object"
                            )
                            .map(
                                plato => ({
                                    ...plato,

                                    id:
                                        textoSeguro(
                                            plato.id,
                                            generarId(
                                                "plato"
                                            )
                                        ),

                                    nombre:
                                        textoSeguro(
                                            plato.nombre ||
                                            plato.titulo,
                                            "Plato"
                                        ),

                                    descripcion:
                                        textoSeguro(
                                            plato.descripcion ||
                                            plato.detalle ||
                                            plato.ingredientes
                                        ),

                                    precio:
                                        textoSeguro(
                                            plato.precio ||
                                            plato.valor
                                        ),

                                    activo:
                                        plato.activo !== false
                                })
                            )

                };

            }
        );

}


/* =========================================================
   GUARDAR PLATO
========================================================= */

function guardarPlato(event) {

    event.preventDefault();

    const nombre =
        textoSeguro(
            document.getElementById(
                "nombrePlato"
            )?.value
        );

    const precio =
        textoSeguro(
            document.getElementById(
                "precioPlato"
            )?.value
        );

    const categoriaId =
        textoSeguro(
            document.getElementById(
                "categoriaPlato"
            )?.value
        );

    const descripcion =
        textoSeguro(
            document.getElementById(
                "descripcionPlato"
            )?.value
        );

    const imagen =
        textoSeguro(
            document.getElementById(
                "imagenPlato"
            )?.value
        );

    const editando =
        textoSeguro(
            document.getElementById(
                "platoEditando"
            )?.value
        );

    if (
        !nombre ||
        !precio ||
        !categoriaId ||
        !descripcion
    ) {

        mostrarNotificacion(
            "Faltan datos",
            "Completá nombre, precio, categoría y descripción.",
            "error"
        );

        return;

    }

    const menu =
        obtenerMenu();

    const categoria =
        menu.find(
            item =>
                String(item.id) ===
                String(categoriaId)
        );

    if (!categoria) {

        mostrarNotificacion(
            "Categoría no encontrada",
            "Seleccioná una categoría válida.",
            "error"
        );

        return;

    }

    if (!Array.isArray(categoria.platos)) {
        categoria.platos = [];
    }


    if (editando) {

        let encontrado = null;

        let categoriaAnterior = null;

        menu.forEach(cat => {

            const plato =
                cat.platos.find(
                    item =>
                        String(item.id) ===
                        String(editando)
                );

            if (plato) {

                encontrado = plato;
                categoriaAnterior = cat;

            }

        });


        if (!encontrado) {

            mostrarNotificacion(
                "Plato no encontrado",
                "No se pudo localizar el plato que querés editar.",
                "error"
            );

            return;

        }


        const actualizado = {

            ...encontrado,

            id: encontrado.id,

            nombre,

            precio,

            descripcion,

            activo:
                encontrado.activo !== false

        };


        if (
            categoriaAnterior &&
            String(categoriaAnterior.id) !==
            String(categoria.id)
        ) {

            categoriaAnterior.platos =
                categoriaAnterior.platos.filter(
                    plato =>
                        String(plato.id) !==
                        String(editando)
                );

            categoria.platos.push(
                actualizado
            );

        } else {

            const index =
                categoria.platos.findIndex(
                    plato =>
                        String(plato.id) ===
                        String(editando)
                );

            if (index !== -1) {

                categoria.platos[index] =
                    actualizado;

            }

        }


        if (imagen) {

            actualizado.imagen =
                normalizarUrl(
                    imagen,
                    ""
                );

        } else {

            delete actualizado.imagen;

        }


        guardarStorage(
            ADMIN_CONFIG.storage.menu,
            menu
        );

        limpiarFormularioPlato();

        mostrarNotificacion(
            "Plato actualizado",
            `"${nombre}" fue actualizado correctamente.`,
            "success"
        );

    } else {

        const nuevoPlato = {

            id:
                generarId("plato"),

            nombre,

            precio,

            descripcion,

            activo: true

        };


        if (imagen) {

            nuevoPlato.imagen =
                normalizarUrl(
                    imagen,
                    ""
                );

        }


        categoria.platos.push(
            nuevoPlato
        );


        guardarStorage(
            ADMIN_CONFIG.storage.menu,
            menu
        );

        limpiarFormularioPlato();

        mostrarNotificacion(
            "Plato publicado",
            `"${nombre}" ya forma parte de la carta.`,
            "success"
        );

    }

    actualizarTodo();

}


/* =========================================================
   EDITAR PLATO
========================================================= */

function editarPlato(
    categoriaId,
    platoId
) {

    const menu =
        obtenerMenu();

    const categoria =
        menu.find(
            item =>
                String(item.id) ===
                String(categoriaId)
        );

    if (!categoria) {
        return;
    }

    const plato =
        categoria.platos.find(
            item =>
                String(item.id) ===
                String(platoId)
        );

    if (!plato) {
        return;
    }

    const nombre =
        document.getElementById(
            "nombrePlato"
        );

    const precio =
        document.getElementById(
            "precioPlato"
        );

    const select =
        document.getElementById(
            "categoriaPlato"
        );

    const descripcion =
        document.getElementById(
            "descripcionPlato"
        );

    const imagen =
        document.getElementById(
            "imagenPlato"
        );

    const hidden =
        document.getElementById(
            "platoEditando"
        );

    const titulo =
        document.getElementById(
            "tituloEditorPlato"
        );

    const modo =
        document.getElementById(
            "modoPlato"
        );

    const guardar =
        document.getElementById(
            "textoGuardarPlato"
        );

    if (nombre) {
        nombre.value =
            plato.nombre || "";
    }

    if (precio) {
        precio.value =
            plato.precio || "";
    }

    if (select) {
        select.value =
            categoria.id;
    }

    if (descripcion) {
        descripcion.value =
            plato.descripcion || "";
    }

    if (imagen) {
        imagen.value =
            plato.imagen || "";
    }

    if (hidden) {
        hidden.value =
            plato.id;
    }

    if (titulo) {
        titulo.textContent =
            "Editar plato";
    }

    if (modo) {
        modo.textContent =
            "EDITANDO PLATO";
    }

    if (guardar) {
        guardar.textContent =
            "ACTUALIZAR PLATO";
    }

    actualizarContadoresTexto();

    actualizarPreview(
        "imagenPlato",
        "previewImagenPlato"
    );

    cambiarSeccion("carta");

    document
        .getElementById(
            "nombrePlato"
        )
        ?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

}


/* =========================================================
   ELIMINAR PLATO
========================================================= */

function eliminarPlato(
    categoriaId,
    platoId
) {

    const menu =
        obtenerMenu();

    const categoria =
        menu.find(
            item =>
                String(item.id) ===
                String(categoriaId)
        );

    if (!categoria) {
        return;
    }

    const plato =
        categoria.platos.find(
            item =>
                String(item.id) ===
                String(platoId)
        );

    if (!plato) {
        return;
    }

    const confirmar =
        window.confirm(
            `¿Eliminar "${plato.nombre}" de la carta?\n\nEl plato también desaparecerá de la página principal.`
        );

    if (!confirmar) {
        return;
    }

    categoria.platos =
        categoria.platos.filter(
            item =>
                String(item.id) !==
                String(platoId)
        );

    guardarStorage(
        ADMIN_CONFIG.storage.menu,
        menu
    );

    mostrarNotificacion(
        "Plato eliminado",
        `"${plato.nombre}" fue eliminado de la carta.`,
        "success"
    );

    actualizarTodo();

}


/* =========================================================
   CAMBIAR ESTADO PLATO
========================================================= */

function cambiarEstadoPlato(
    categoriaId,
    platoId
) {

    const menu =
        obtenerMenu();

    const categoria =
        menu.find(
            item =>
                String(item.id) ===
                String(categoriaId)
        );

    if (!categoria) {
        return;
    }

    const plato =
        categoria.platos.find(
            item =>
                String(item.id) ===
                String(platoId)
        );

    if (!plato) {
        return;
    }

    plato.activo =
        plato.activo === false;

    guardarStorage(
        ADMIN_CONFIG.storage.menu,
        menu
    );

    mostrarNotificacion(
        plato.activo
            ? "Plato publicado"
            : "Plato ocultado",
        plato.activo
            ? `"${plato.nombre}" volvió a mostrarse.`
            : `"${plato.nombre}" fue ocultado de la página.`,
        "success"
    );

    actualizarTodo();

}


/* =========================================================
   LIMPIAR PLATO
========================================================= */

function limpiarFormularioPlato() {

    const form =
        document.getElementById(
            "formPlato"
        );

    form?.reset();

    const hidden =
        document.getElementById(
            "platoEditando"
        );

    const titulo =
        document.getElementById(
            "tituloEditorPlato"
        );

    const modo =
        document.getElementById(
            "modoPlato"
        );

    const guardar =
        document.getElementById(
            "textoGuardarPlato"
        );

    if (hidden) {
        hidden.value = "";
    }

    if (titulo) {
        titulo.textContent =
            "Agregar nuevo plato";
    }

    if (modo) {
        modo.textContent =
            "NUEVO PLATO";
    }

    if (guardar) {
        guardar.textContent =
            "GUARDAR PLATO";
    }

    actualizarSelectCategorias();

    actualizarContadoresTexto();

    limpiarPreview(
        "previewImagenPlato"
    );

}


/* =========================================================
   CATEGORÍAS
========================================================= */

function abrirModalCategoria(
    categoriaId = ""
) {

    const form =
        document.getElementById(
            "formCategoria"
        );

    form?.reset();

    const hidden =
        document.getElementById(
            "categoriaEditando"
        );

    const nombre =
        document.getElementById(
            "nombreCategoria"
        );

    const descripcion =
        document.getElementById(
            "descripcionCategoria"
        );

    const icono =
        document.getElementById(
            "iconoCategoria"
        );

    const titulo =
        document.getElementById(
            "modalCategoriaTitulo"
        );

    if (hidden) {
        hidden.value =
            categoriaId;
    }

    if (categoriaId) {

        const menu =
            obtenerMenu();

        const categoria =
            menu.find(
                item =>
                    String(item.id) ===
                    String(categoriaId)
            );

        if (!categoria) {
            return;
        }

        if (titulo) {
            titulo.textContent =
                "Editar categoría";
        }

        if (nombre) {
            nombre.value =
                categoria.nombre || "";
        }

        if (descripcion) {
            descripcion.value =
                categoria.descripcion || "";
        }

        if (icono) {
            icono.value =
                categoria.icono || "🍽️";
        }

    } else {

        if (titulo) {
            titulo.textContent =
                "Nueva categoría";
        }

        if (icono) {
            icono.value =
                "🍽️";
        }

    }

    abrirModal(
        "modalCategoria"
    );

}


function guardarCategoria(event) {

    event.preventDefault();

    const nombre =
        textoSeguro(
            document.getElementById(
                "nombreCategoria"
            )?.value
        );

    const descripcion =
        textoSeguro(
            document.getElementById(
                "descripcionCategoria"
            )?.value
        );

    const icono =
        textoSeguro(
            document.getElementById(
                "iconoCategoria"
            )?.value,
            "🍽️"
        );

    const editando =
        textoSeguro(
            document.getElementById(
                "categoriaEditando"
            )?.value
        );

    if (!nombre) {

        mostrarNotificacion(
            "Nombre requerido",
            "Ingresá un nombre para la categoría.",
            "error"
        );

        return;

    }

    const menu =
        obtenerMenu();

    const existe =
        menu.some(
            categoria =>
                String(categoria.id) !==
                String(editando) &&
                categoria.nombre
                    .toLowerCase()
                    .trim() ===
                nombre
                    .toLowerCase()
                    .trim()
        );

    if (existe) {

        mostrarNotificacion(
            "Categoría existente",
            "Ya existe una categoría con ese nombre.",
            "error"
        );

        return;

    }


    if (editando) {

        const categoria =
            menu.find(
                item =>
                    String(item.id) ===
                    String(editando)
            );

        if (!categoria) {
            return;
        }

        categoria.nombre =
            nombre;

        categoria.titulo =
            nombre;

        categoria.descripcion =
            descripcion;

        categoria.icono =
            icono || "🍽️";

        guardarStorage(
            ADMIN_CONFIG.storage.menu,
            menu
        );

        cerrarModal(
            "modalCategoria"
        );

        mostrarNotificacion(
            "Categoría actualizada",
            `"${nombre}" fue actualizada correctamente.`,
            "success"
        );

    } else {

        menu.push({

            id:
                generarId("cat"),

            nombre,

            titulo:
                nombre,

            descripcion,

            icono:
                icono || "🍽️",

            activo: true,

            platos: []

        });

        guardarStorage(
            ADMIN_CONFIG.storage.menu,
            menu
        );

        cerrarModal(
            "modalCategoria"
        );

        mostrarNotificacion(
            "Categoría creada",
            `"${nombre}" fue agregada a la carta.`,
            "success"
        );

    }

    actualizarTodo();

}


function editarCategoria(
    categoriaId
) {

    abrirModalCategoria(
        categoriaId
    );

}


function eliminarCategoria(
    categoriaId
) {

    const menu =
        obtenerMenu();

    const categoria =
        menu.find(
            item =>
                String(item.id) ===
                String(categoriaId)
        );

    if (!categoria) {
        return;
    }

    const cantidad =
        categoria.platos.length;

    const mensaje =
        cantidad
            ? `La categoría "${categoria.nombre}" contiene ${cantidad} plato(s).\n\nSi la eliminás, esos platos también dejarán de aparecer en la página principal.\n\n¿Continuar?`
            : `¿Eliminar la categoría "${categoria.nombre}"?`;

    if (!window.confirm(mensaje)) {
        return;
    }

    const nuevoMenu =
        menu.filter(
            item =>
                String(item.id) !==
                String(categoriaId)
        );

    guardarStorage(
        ADMIN_CONFIG.storage.menu,
        nuevoMenu
    );

    mostrarNotificacion(
        "Categoría eliminada",
        `"${categoria.nombre}" fue eliminada.`,
        "success"
    );

    actualizarTodo();

}


function cambiarEstadoCategoria(
    categoriaId
) {

    const menu =
        obtenerMenu();

    const categoria =
        menu.find(
            item =>
                String(item.id) ===
                String(categoriaId)
        );

    if (!categoria) {
        return;
    }

    categoria.activo =
        categoria.activo === false;

    guardarStorage(
        ADMIN_CONFIG.storage.menu,
        menu
    );

    mostrarNotificacion(
        categoria.activo
            ? "Categoría publicada"
            : "Categoría oculta",
        categoria.activo
            ? `"${categoria.nombre}" vuelve a estar visible.`
            : `"${categoria.nombre}" fue ocultada.`,
        "success"
    );

    actualizarTodo();

}


/* =========================================================
   SELECT CATEGORÍAS
========================================================= */

function actualizarSelectCategorias() {

    const select =
        document.getElementById(
            "categoriaPlato"
        );

    if (!select) {
        return;
    }

    const valorActual =
        select.value;

    const menu =
        obtenerMenu();

    if (!menu.length) {

        select.innerHTML = `
            <option value="">
                Creá una categoría primero
            </option>
        `;

        return;

    }

    select.innerHTML =
        menu.map(
            categoria => `
                <option
                    value="${escaparAtributo(categoria.id)}"
                >
                    ${escaparHTML(categoria.nombre)}
                </option>
            `
        ).join("");

    if (
        menu.some(
            categoria =>
                String(categoria.id) ===
                String(valorActual)
        )
    ) {

        select.value =
            valorActual;

    }

}


/* =========================================================
   RENDER CARTA
========================================================= */

function renderizarCarta() {

    const contenedor =
        document.getElementById(
            "listaPlatosAdmin"
        );

    if (!contenedor) {
        return;
    }

    const menu =
        obtenerMenu();

    menuActual =
        menu;

    actualizarSelectCategorias();

    const totalPlatos =
        menu.reduce(
            (total, categoria) =>
                total +
                categoria.platos.length,
            0
        );

    ponerTexto(
        "contadorPlatosGrande",
        totalPlatos
    );

    ponerTexto(
        "cantidadPlatos",
        totalPlatos
    );

    const busqueda =
        textoSeguro(
            document.getElementById(
                "buscarPlatos"
            )?.value
        ).toLowerCase();

    const filtrado =
        menu.map(
            categoria => ({

                ...categoria,

                platos:
                    categoria.platos.filter(
                        plato => {

                            if (!busqueda) {
                                return true;
                            }

                            return (
                                plato.nombre
                                    .toLowerCase()
                                    .includes(busqueda) ||

                                plato.descripcion
                                    .toLowerCase()
                                    .includes(busqueda) ||

                                categoria.nombre
                                    .toLowerCase()
                                    .includes(busqueda)
                            );

                        }
                    )

            })
        );


    if (!menu.length) {

        contenedor.innerHTML = crearEstadoVacio(
            "☷",
            "La carta está vacía",
            "Creá una categoría para comenzar."
        );

        return;

    }


    const hayResultados =
        filtrado.some(
            categoria =>
                categoria.platos.length > 0
        );


    let html = "";

    filtrado.forEach(
        categoria => {

            if (
                busqueda &&
                !categoria.platos.length
            ) {
                return;
            }

            html += crearCategoriaAdminHTML(
                categoria
            );

        }
    );


    if (!hayResultados && busqueda) {

        contenedor.innerHTML =
            crearEstadoVacio(
                "⌕",
                "No encontramos platos",
                "Probá con otro nombre, descripción o categoría."
            );

        return;

    }

    contenedor.innerHTML =
        html;

}


function crearCategoriaAdminHTML(
    categoria
) {

    const categoriaId =
        escaparAtributo(
            categoria.id
        );

    const platos =
        Array.isArray(
            categoria.platos
        )
            ? categoria.platos
            : [];

    const claseOculta =
        categoria.activo
            ? ""
            : "is-hidden";

    return `

        <article
            class="category-card ${claseOculta}"
        >

            <div class="category-header">

                <div class="category-info">

                    <div class="category-label">

                        <span class="category-icon">
                            ${escaparHTML(categoria.icono)}
                        </span>

                        ${categoria.activo
                            ? "PUBLICADA"
                            : "OCULTA"
                        }

                    </div>

                    <h3 class="category-title">
                        ${escaparHTML(categoria.nombre)}
                    </h3>

                    <div class="category-description">
                        ${escaparHTML(
                            categoria.descripcion ||
                            "Sin descripción"
                        )}
                        ·
                        ${platos.length}
                        plato${platos.length === 1 ? "" : "s"}
                    </div>

                </div>


                <div class="category-actions">

                    <button
                        class="item-button edit"
                        type="button"
                        data-action="edit-category"
                        data-category="${categoriaId}"
                    >
                        EDITAR
                    </button>

                    <button
                        class="item-button edit"
                        type="button"
                        data-action="toggle-category"
                        data-category="${categoriaId}"
                    >
                        ${
                            categoria.activo
                                ? "OCULTAR"
                                : "PUBLICAR"
                        }
                    </button>

                    <button
                        class="item-button delete"
                        type="button"
                        data-action="delete-category"
                        data-category="${categoriaId}"
                    >
                        ELIMINAR
                    </button>

                </div>

            </div>


            <div class="category-plats">

                ${
                    platos.length
                        ? platos.map(
                            plato =>
                                crearPlatoAdminHTML(
                                    categoria,
                                    plato
                                )
                        ).join("")
                        : `
                            <div class="category-empty">
                                Esta categoría todavía no tiene platos.
                            </div>
                        `
                }

            </div>

        </article>

    `;

}


function crearPlatoAdminHTML(
    categoria,
    plato
) {

    const categoriaId =
        escaparAtributo(
            categoria.id
        );

    const platoId =
        escaparAtributo(
            plato.id
        );

    const visible =
        categoria.activo &&
        plato.activo !== false;

    return `

        <div
            class="dish-row ${
                visible
                    ? ""
                    : "is-hidden"
            }"
        >

            <div class="dish-info">

                <div class="dish-status">
                    ${
                        visible
                            ? "PUBLICADO"
                            : "OCULTO"
                    }
                </div>

                <h4 class="dish-name">
                    ${escaparHTML(plato.nombre)}
                </h4>

                <p class="dish-description">
                    ${escaparHTML(
                        plato.descripcion ||
                        "Sin descripción"
                    )}
                </p>

            </div>


            <div class="dish-right">

                <div class="dish-price">
                    ${escaparHTML(
                        plato.precio ||
                        "Consultar"
                    )}
                </div>

                <div class="item-actions">

                    <button
                        class="item-button edit"
                        type="button"
                        data-action="edit-dish"
                        data-category="${categoriaId}"
                        data-dish="${platoId}"
                    >
                        EDITAR
                    </button>

                    <button
                        class="item-button edit"
                        type="button"
                        data-action="toggle-dish"
                        data-category="${categoriaId}"
                        data-dish="${platoId}"
                    >
                        ${
                            plato.activo === false
                                ? "PUBLICAR"
                                : "OCULTAR"
                        }
                    </button>

                    <button
                        class="item-button delete"
                        type="button"
                        data-action="delete-dish"
                        data-category="${categoriaId}"
                        data-dish="${platoId}"
                    >
                        ELIMINAR
                    </button>

                </div>

            </div>

        </div>

    `;

}


/* =========================================================
   EVENTOS — LECTURA
========================================================= */

function obtenerEventos() {

    const datos =
        leerStorage(
            ADMIN_CONFIG.storage.eventos,
            [],
            ADMIN_CONFIG.legacyStorage.eventos
        );

    return Array.isArray(datos)
        ? normalizarEventos(datos)
        : [];

}


function normalizarEventos(
    eventos
) {

    if (!Array.isArray(eventos)) {
        return [];
    }

    return eventos
        .filter(
            evento =>
                evento &&
                typeof evento === "object"
        )
        .map(
            evento => ({

                ...evento,

                id:
                    evento.id ??
                    generarId("evento"),

                titulo:
                    textoSeguro(
                        evento.titulo,
                        "¡DÍA DE PARTIDO!"
                    ),

                partido:
                    textoSeguro(
                        evento.partido
                    ),

                descripcion:
                    textoSeguro(
                        evento.descripcion,
                        "Viví el partido junto al Bicho."
                    ),

                fecha:
                    textoSeguro(
                        evento.fecha
                    ),

                hora:
                    textoSeguro(
                        evento.hora,
                        "Horario a confirmar"
                    ),

                botonTexto:
                    textoSeguro(
                        evento.botonTexto,
                        "RESERVAR MESA"
                    ),

                botonLink:
                    normalizarUrl(
                        evento.botonLink,
                        "#reservar"
                    ),

                imagen:
                    textoSeguro(
                        evento.imagen
                    ),

                textoPromocional:
                    textoSeguro(
                        evento.textoPromocional
                    ),

                activo:
                    evento.activo !== false

            })
        );

}


/* =========================================================
   GUARDAR EVENTO
========================================================= */

function guardarEvento(event) {

    event.preventDefault();

    const titulo =
        textoSeguro(
            document.getElementById(
                "tituloEvento"
            )?.value
        );

    const partido =
        textoSeguro(
            document.getElementById(
                "partidoEvento"
            )?.value
        );

    const fecha =
        textoSeguro(
            document.getElementById(
                "fechaEvento"
            )?.value
        );

    const hora =
        textoSeguro(
            document.getElementById(
                "horaEvento"
            )?.value
        );

    const descripcion =
        textoSeguro(
            document.getElementById(
                "descripcionEvento"
            )?.value
        );

    const imagen =
        textoSeguro(
            document.getElementById(
                "imagenEvento"
            )?.value
        );

    const botonTexto =
        textoSeguro(
            document.getElementById(
                "botonTextoEvento"
            )?.value,
            "RESERVAR POR WHATSAPP"
        );

    const botonLink =
        textoSeguro(
            document.getElementById(
                "botonLinkEvento"
            )?.value
        );

    const activo =
        Boolean(
            document.getElementById(
                "activoEvento"
            )?.checked
        );

    const editando =
        textoSeguro(
            document.getElementById(
                "eventoEditando"
            )?.value
        );


    if (
        !titulo ||
        !fecha ||
        !hora ||
        !descripcion
    ) {

        mostrarNotificacion(
            "Faltan datos",
            "Completá título, fecha, hora y descripción.",
            "error"
        );

        return;

    }


    if (!fechaEsValida(fecha)) {

        mostrarNotificacion(
            "Fecha inválida",
            "Seleccioná una fecha válida.",
            "error"
        );

        return;

    }


    const eventos =
        obtenerEventos();


    const datos = {

        titulo,

        partido,

        descripcion,

        fecha,

        hora,

        botonTexto:
            botonTexto ||
            "RESERVAR POR WHATSAPP",

        botonLink:
            normalizarUrl(
                botonLink,
                ADMIN_CONFIG.whatsapp
            ),

        imagen:
            imagen
                ? normalizarUrl(
                    imagen,
                    ""
                )
                : "",

        activo

    };


    if (editando) {

        const index =
            eventos.findIndex(
                evento =>
                    String(evento.id) ===
                    String(editando)
            );

        if (index === -1) {

            mostrarNotificacion(
                "Evento no encontrado",
                "No se pudo encontrar el evento.",
                "error"
            );

            return;

        }

        eventos[index] = {

            ...eventos[index],

            ...datos,

            id:
                eventos[index].id

        };

        guardarStorage(
            ADMIN_CONFIG.storage.eventos,
            eventos
        );

        limpiarFormularioEvento();

        mostrarNotificacion(
            "Evento actualizado",
            `"${titulo}" fue actualizado correctamente.`,
            "success"
        );

    } else {

        eventos.unshift({

            id:
                generarId("evento"),

            ...datos,

            fechaCreacion:
                new Date().toISOString()

        });

        guardarStorage(
            ADMIN_CONFIG.storage.eventos,
            eventos
        );

        limpiarFormularioEvento();

        mostrarNotificacion(
            activo
                ? "Evento publicado"
                : "Evento guardado",
            activo
                ? `"${titulo}" ya está disponible en la página.`
                : `"${titulo}" fue guardado como oculto.`,
            "success"
        );

    }

    actualizarTodo();

}


/* =========================================================
   EDITAR EVENTO
========================================================= */

function editarEvento(
    eventoId
) {

    const eventos =
        obtenerEventos();

    const evento =
        eventos.find(
            item =>
                String(item.id) ===
                String(eventoId)
        );

    if (!evento) {
        return;
    }

    ponerValor(
        "eventoEditando",
        evento.id
    );

    ponerValor(
        "tituloEvento",
        evento.titulo
    );

    ponerValor(
        "partidoEvento",
        evento.partido
    );

    ponerValor(
        "fechaEvento",
        evento.fecha
    );

    ponerValor(
        "horaEvento",
        evento.hora
    );

    ponerValor(
        "descripcionEvento",
        evento.descripcion
    );

    ponerValor(
        "imagenEvento",
        evento.imagen
    );

    ponerValor(
        "botonTextoEvento",
        evento.botonTexto ||
        "RESERVAR POR WHATSAPP"
    );

    ponerValor(
        "botonLinkEvento",
        evento.botonLink ===
        ADMIN_CONFIG.whatsapp
            ? ""
            : evento.botonLink
    );

    const activo =
        document.getElementById(
            "activoEvento"
        );

    if (activo) {
        activo.checked =
            evento.activo !== false;
    }

    ponerTexto(
        "modoEvento",
        "EDITANDO EVENTO"
    );

    ponerTexto(
        "tituloEditorEvento",
        "Editar publicación"
    );

    ponerTexto(
        "textoGuardarEvento",
        "ACTUALIZAR EVENTO"
    );

    actualizarContadoresTexto();

    actualizarPreview(
        "imagenEvento",
        "previewImagenEvento"
    );

    cambiarSeccion(
        "eventos"
    );

    document
        .getElementById(
            "tituloEvento"
        )
        ?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

}


/* =========================================================
   ELIMINAR EVENTO
========================================================= */

function eliminarEvento(
    eventoId
) {

    const eventos =
        obtenerEventos();

    const evento =
        eventos.find(
            item =>
                String(item.id) ===
                String(eventoId)
        );

    if (!evento) {
        return;
    }

    if (
        !window.confirm(
            `¿Eliminar el evento "${evento.titulo}"?\n\nTambién desaparecerá de la página principal.`
        )
    ) {
        return;
    }

    const nuevos =
        eventos.filter(
            item =>
                String(item.id) !==
                String(eventoId)
        );

    guardarStorage(
        ADMIN_CONFIG.storage.eventos,
        nuevos
    );

    mostrarNotificacion(
        "Evento eliminado",
        `"${evento.titulo}" ya no aparecerá públicamente.`,
        "success"
    );

    actualizarTodo();

}


/* =========================================================
   ESTADO EVENTO
========================================================= */

function cambiarEstadoEvento(
    eventoId
) {

    const eventos =
        obtenerEventos();

    const evento =
        eventos.find(
            item =>
                String(item.id) ===
                String(eventoId)
        );

    if (!evento) {
        return;
    }

    evento.activo =
        evento.activo === false;

    guardarStorage(
        ADMIN_CONFIG.storage.eventos,
        eventos
    );

    mostrarNotificacion(
        evento.activo
            ? "Evento publicado"
            : "Evento ocultado",
        evento.activo
            ? `"${evento.titulo}" vuelve a estar visible.`
            : `"${evento.titulo}" fue ocultado.`,
        "success"
    );

    actualizarTodo();

}


/* =========================================================
   LIMPIAR EVENTO
========================================================= */

function limpiarFormularioEvento() {

    const form =
        document.getElementById(
            "formEvento"
        );

    form?.reset();

    ponerValor(
        "eventoEditando",
        ""
    );

    ponerTexto(
        "modoEvento",
        "NUEVO EVENTO"
    );

    ponerTexto(
        "tituloEditorEvento",
        "Crear publicación"
    );

    ponerTexto(
        "textoGuardarEvento",
        "PUBLICAR EVENTO"
    );

    const activo =
        document.getElementById(
            "activoEvento"
        );

    if (activo) {
        activo.checked = true;
    }

    ponerValor(
        "botonTextoEvento",
        "RESERVAR POR WHATSAPP"
    );

    actualizarContadoresTexto();

    limpiarPreview(
        "previewImagenEvento"
    );

}


/* =========================================================
   RENDER EVENTOS
========================================================= */

function renderizarEventos() {

    const contenedor =
        document.getElementById(
            "listaEventosAdmin"
        );

    if (!contenedor) {
        return;
    }

    const eventos =
        obtenerEventos();

    eventosActuales =
        eventos;

    const activos =
        eventos.filter(
            evento =>
                evento.activo !== false
        ).length;

    ponerTexto(
        "contadorEventosGrande",
        activos
    );

    ponerTexto(
        "cantidadEventos",
        activos
    );

    ponerTexto(
        "contadorEventosMenu",
        activos
    );


    const busqueda =
        textoSeguro(
            document.getElementById(
                "buscarEventos"
            )?.value
        ).toLowerCase();


    const filtrados =
        eventos.filter(
            evento => {

                if (!busqueda) {
                    return true;
                }

                return (

                    evento.titulo
                        .toLowerCase()
                        .includes(busqueda) ||

                    evento.partido
                        .toLowerCase()
                        .includes(busqueda) ||

                    evento.descripcion
                        .toLowerCase()
                        .includes(busqueda)

                );

            }
        );


    if (!eventos.length) {

        contenedor.innerHTML =
            crearEstadoVacio(
                "⚽",
                "No hay eventos todavía",
                "Creá el primer evento desde el formulario."
            );

        return;

    }


    if (!filtrados.length) {

        contenedor.innerHTML =
            crearEstadoVacio(
                "⌕",
                "No encontramos eventos",
                "Probá con otro término de búsqueda."
            );

        return;

    }


    contenedor.innerHTML =
        filtrados.map(
            crearEventoAdminHTML
        ).join("");

}


function crearEventoAdminHTML(
    evento
) {

    const id =
        escaparAtributo(
            evento.id
        );

    const oculto =
        evento.activo === false
            ? "is-hidden"
            : "";

    const imagen =
        evento.imagen
            ? `
                <img
                    src="${escaparAtributo(evento.imagen)}"
                    alt="${escaparAtributo(evento.titulo)}"
                    loading="lazy"
                >
            `
            : `
                <span class="event-image-placeholder">
                    ⚽
                </span>
            `;

    return `

        <article
            class="event-card ${oculto}"
        >

            <div class="event-image">
                ${imagen}
            </div>


            <div class="event-info">

                <div class="event-status">
                    ${
                        evento.activo
                            ? "PUBLICADO"
                            : "OCULTO"
                    }
                </div>

                <h3 class="event-title">
                    ${escaparHTML(
                        evento.titulo
                    )}
                </h3>

                ${
                    evento.partido
                        ? `
                            <strong class="event-match">
                                ${escaparHTML(
                                    evento.partido
                                )}
                            </strong>
                        `
                        : ""
                }

                <div class="event-date">
                    📅
                    ${escaparHTML(
                        formatearFecha(
                            evento.fecha
                        )
                    )}
                    ·
                    🕐
                    ${escaparHTML(
                        evento.hora
                    )}
                </div>

                <p class="event-description">
                    ${escaparHTML(
                        evento.descripcion
                    )}
                </p>

                ${
                    evento.textoPromocional
                        ? `
                            <div class="event-extra">
                                ${escaparHTML(
                                    evento.textoPromocional
                                )}
                            </div>
                        `
                        : ""
                }

                <div class="event-actions">

                    <div class="item-actions">

                        <button
                            class="item-button edit"
                            type="button"
                            data-action="edit-event"
                            data-event="${id}"
                        >
                            EDITAR
                        </button>

                        <button
                            class="item-button edit"
                            type="button"
                            data-action="toggle-event"
                            data-event="${id}"
                        >
                            ${
                                evento.activo
                                    ? "OCULTAR"
                                    : "PUBLICAR"
                            }
                        </button>

                        <button
                            class="item-button delete"
                            type="button"
                            data-action="delete-event"
                            data-event="${id}"
                        >
                            ELIMINAR
                        </button>

                    </div>

                </div>

            </div>

        </article>

    `;

}


/* =========================================================
   RESEÑAS — LECTURA
========================================================= */

function obtenerResenas() {

    const datos =
        leerStorage(
            ADMIN_CONFIG.storage.resenas,
            [],
            ADMIN_CONFIG.legacyStorage.resenas
        );

    if (!Array.isArray(datos)) {
        return [];
    }

    return datos.map(
        resena => ({

            ...resena,

            id:
                resena.id ||
                generarId("resena"),

            nombre:
                textoSeguro(
                    resena.nombre ||
                    resena.nombreCliente ||
                    resena.usuario,
                    "Cliente"
                ),

            comentario:
                textoSeguro(
                    resena.comentario ||
                    resena.texto ||
                    resena.mensaje
                ),

            estrellas:
                Math.max(
                    0,
                    Math.min(
                        5,
                        Number(
                            resena.estrellas ||
                            resena.rating ||
                            resena.puntuacion ||
                            5
                        )
                    )
                ),

            fecha:
                resena.fecha ||
                resena.createdAt ||
                new Date().toISOString(),

            respuestaAdmin:
                textoSeguro(
                    resena.respuestaAdmin ||
                    resena.respuesta
                ),

            fechaRespuesta:
                resena.fechaRespuesta ||
                null

        })
    );

}


/* =========================================================
   RENDER RESEÑAS
========================================================= */

function renderizarResenas() {

    const contenedor =
        document.getElementById(
            "adminListaResenas"
        );

    if (!contenedor) {
        return;
    }

    const resenas =
        obtenerResenas();

    resenasActuales =
        resenas;

    resenas.sort(
        (a, b) =>
            obtenerTimestamp(
                b.fecha
            ) -
            obtenerTimestamp(
                a.fecha
            )
    );

    actualizarContadoresResenas(
        resenas
    );

    const busqueda =
        textoSeguro(
            document.getElementById(
                "buscarResenas"
            )?.value
        ).toLowerCase();

    const filtradas =
        resenas.filter(
            resena => {

                if (!busqueda) {
                    return true;
                }

                return (

                    resena.nombre
                        .toLowerCase()
                        .includes(busqueda) ||

                    resena.comentario
                        .toLowerCase()
                        .includes(busqueda)

                );

            }
        );


    if (!resenas.length) {

        contenedor.innerHTML =
            crearEstadoVacio(
                "★",
                "Todavía no hay reseñas",
                "Cuando un cliente deje una opinión aparecerá automáticamente acá."
            );

        return;

    }


    if (!filtradas.length) {

        contenedor.innerHTML =
            crearEstadoVacio(
                "⌕",
                "No encontramos reseñas",
                "Probá con otro nombre o comentario."
            );

        return;

    }


    contenedor.innerHTML =
        filtradas.map(
            crearReviewHTML
        ).join("");

}


function crearReviewHTML(
    resena
) {

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

    const estrellasHTML =
        "★".repeat(estrellas) +
        `<span>${
            "★".repeat(
                5 - estrellas
            )
        }</span>`;

    const respuesta =
        textoSeguro(
            resena.respuestaAdmin
        );

    const id =
        escaparAtributo(
            resena.id
        );

    return `

        <article class="review-card">

            <div class="review-main">

                <div class="review-top">

                    <div class="review-stars">
                        ${estrellasHTML}
                    </div>

                    <small class="review-date">
                        ${escaparHTML(
                            formatearFechaCorta(
                                resena.fecha
                            )
                        )}
                    </small>

                </div>


                <h3 class="review-name">
                    ${escaparHTML(
                        resena.nombre
                    )}
                </h3>


                <p class="review-comment">
                    ${escaparHTML(
                        resena.comentario
                    )}
                </p>


                ${
                    respuesta
                        ? `
                            <div class="review-answer">

                                <strong>
                                    RESPUESTA DE LA CANTINA
                                </strong>

                                <p>
                                    ${escaparHTML(
                                        respuesta
                                    )}
                                </p>

                            </div>
                        `
                        : `
                            <div class="review-unanswered">
                                Todavía no respondiste esta reseña.
                            </div>
                        `
                }

            </div>


            <div class="item-actions">

                <button
                    class="item-button edit"
                    type="button"
                    data-action="answer-review"
                    data-review="${id}"
                >
                    ${
                        respuesta
                            ? "EDITAR RESPUESTA"
                            : "RESPONDER"
                    }
                </button>

                <button
                    class="item-button delete"
                    type="button"
                    data-action="delete-review"
                    data-review="${id}"
                >
                    ELIMINAR
                </button>

            </div>

        </article>

    `;

}


/* =========================================================
   RESPONDER RESEÑA
========================================================= */

function abrirResponderResena(
    resenaId
) {

    const resenas =
        obtenerResenas();

    const resena =
        resenas.find(
            item =>
                String(item.id) ===
                String(resenaId)
        );

    if (!resena) {
        return;
    }

    resenaAResponder =
        resena.id;

    ponerValor(
        "resenaAResponder",
        resena.id
    );

    ponerTexto(
        "nombreClienteRespuesta",
        resena.nombre
    );

    ponerTexto(
        "previewEstrellas",
        "★".repeat(
            Math.max(
                0,
                Math.min(
                    5,
                    Number(
                        resena.estrellas
                    ) || 0
                )
            )
        ) +
        "☆".repeat(
            5 -
            Math.max(
                0,
                Math.min(
                    5,
                    Number(
                        resena.estrellas
                    ) || 0
                )
            )
        )
    );

    ponerTexto(
        "previewComentario",
        resena.comentario
    );

    ponerValor(
        "textoRespuesta",
        resena.respuestaAdmin ||
        ADMIN_CONFIG.defaultResponse
    );

    actualizarContadoresTexto();

    abrirModal(
        "modalResponder"
    );

    setTimeout(() => {

        document
            .getElementById(
                "textoRespuesta"
            )
            ?.focus();

    }, 150);

}


function guardarRespuesta(event) {

    event.preventDefault();

    const id =
        textoSeguro(
            document.getElementById(
                "resenaAResponder"
            )?.value
        );

    const texto =
        textoSeguro(
            document.getElementById(
                "textoRespuesta"
            )?.value
        );

    if (!id) {
        return;
    }

    if (!texto) {

        mostrarNotificacion(
            "Respuesta vacía",
            "Escribí una respuesta antes de guardarla.",
            "error"
        );

        return;

    }

    const resenas =
        obtenerResenas();

    const resena =
        resenas.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!resena) {
        return;
    }

    resena.respuestaAdmin =
        texto;

    resena.respuesta =
        texto;

    resena.fechaRespuesta =
        new Date().toISOString();

    guardarStorage(
        ADMIN_CONFIG.storage.resenas,
        resenas
    );

    cerrarModal(
        "modalResponder"
    );

    mostrarNotificacion(
        "Respuesta publicada",
        "La respuesta quedó guardada y puede mostrarse en la página pública.",
        "success"
    );

    actualizarTodo();

}


/* =========================================================
   ELIMINAR RESEÑA
========================================================= */

function abrirEliminarResena(
    resenaId
) {

    const resenas =
        obtenerResenas();

    const resena =
        resenas.find(
            item =>
                String(item.id) ===
                String(resenaId)
        );

    if (!resena) {
        return;
    }

    resenaAEliminar =
        resena.id;

    abrirModal(
        "modalEliminar"
    );

}


function confirmarEliminarResena() {

    if (!resenaAEliminar) {
        return;
    }

    const resenas =
        obtenerResenas();

    const existe =
        resenas.some(
            item =>
                String(item.id) ===
                String(resenaAEliminar)
        );

    if (!existe) {

        cerrarModal(
            "modalEliminar"
        );

        return;

    }

    const nuevas =
        resenas.filter(
            item =>
                String(item.id) !==
                String(resenaAEliminar)
        );

    guardarStorage(
        ADMIN_CONFIG.storage.resenas,
        nuevas
    );

    resenaAEliminar =
        null;

    cerrarModal(
        "modalEliminar"
    );

    mostrarNotificacion(
        "Reseña eliminada",
        "La opinión fue eliminada de la página principal.",
        "success"
    );

    actualizarTodo();

}


/* =========================================================
   CONTADORES RESEÑAS
========================================================= */

function actualizarContadoresResenas(
    resenas
) {

    const cantidad =
        Array.isArray(resenas)
            ? resenas.length
            : 0;

    ponerTexto(
        "contadorResenas",
        cantidad
    );

    ponerTexto(
        "cantidadResenas",
        cantidad
    );

    ponerTexto(
        "contadorResenasGrande",
        cantidad
    );

}


/* =========================================================
   ÚLTIMAS RESEÑAS
========================================================= */

function renderizarUltimasResenas() {

    const contenedor =
        document.getElementById(
            "ultimasResenas"
        );

    if (!contenedor) {
        return;
    }

    const resenas =
        obtenerResenas()
            .sort(
                (a, b) =>
                    obtenerTimestamp(
                        b.fecha
                    ) -
                    obtenerTimestamp(
                        a.fecha
                    )
            )
            .slice(
                0,
                4
            );

    if (!resenas.length) {

        contenedor.innerHTML = `
            <div class="empty-mini">
                Todavía no hay reseñas.
            </div>
        `;

        return;

    }

    contenedor.innerHTML =
        resenas.map(
            resena => {

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

                const inicial =
                    resena.nombre
                        .charAt(0)
                        .toUpperCase();

                return `

                    <div class="activity-review">

                        <div class="activity-avatar">
                            ${escaparHTML(
                                inicial
                            )}
                        </div>

                        <div class="activity-info">

                            <strong>
                                ${escaparHTML(
                                    resena.nombre
                                )}
                            </strong>

                            <div class="activity-stars">
                                ${
                                    "★".repeat(
                                        estrellas
                                    )
                                }
                                ${
                                    "☆".repeat(
                                        5 - estrellas
                                    )
                                }
                            </div>

                            <p>
                                ${escaparHTML(
                                    resena.comentario
                                )}
                            </p>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


/* =========================================================
   ACTIVIDAD CSS
========================================================= */

const activityStyles = document.createElement(
    "style"
);

activityStyles.textContent = `

    .activity-review {
        display: flex;
        align-items: center;

        gap: 12px;

        padding: 13px 0;

        border-top: 1px solid rgba(255,255,255,.045);
    }

    .activity-review:first-child {
        border-top: 0;
    }

    .activity-avatar {
        width: 35px;
        height: 35px;

        flex-shrink: 0;

        display: flex;
        align-items: center;
        justify-content: center;

        border-radius: 50%;

        background: rgba(227,6,47,.09);

        border: 1px solid rgba(227,6,47,.13);

        color: #e3062f;

        font-size: 10px;
        font-weight: 900;
    }

    .activity-info {
        min-width: 0;
    }

    .activity-info strong {
        font-size: 10px;
    }

    .activity-stars {
        margin: 3px 0;

        color: #f0d18a;

        font-size: 8px;
        letter-spacing: 1px;
    }

    .activity-info p {
        max-width: 600px;

        margin: 0;

        overflow: hidden;

        color: #777780;

        font-size: 8px;

        line-height: 1.4;

        text-overflow: ellipsis;

        white-space: nowrap;
    }

    @media (max-width:650px) {

        .activity-info p {
            max-width: 250px;
        }

    }

`;

document.head.appendChild(
    activityStyles
);


/* =========================================================
   RESERVAS
========================================================= */

function obtenerReservas() {

    const datos =
        leerStorage(
            ADMIN_CONFIG.storage.reservas,
            [],
            ADMIN_CONFIG.legacyStorage.reservas
        );

    return Array.isArray(datos)
        ? datos
        : [];

}


function renderizarReservas() {

    const contenedor =
        document.getElementById(
            "listaReservasAdmin"
        );

    if (!contenedor) {
        return;
    }

    const reservas =
        obtenerReservas();

    ponerTexto(
        "cantidadReservas",
        reservas.length
    );

    ponerTexto(
        "contadorReservasLista",
        reservas.length
    );


    if (!reservas.length) {

        contenedor.innerHTML =
            crearEstadoVacio(
                "◷",
                "No hay reservas almacenadas",
                "Actualmente las reservas se gestionan mediante WhatsApp."
            );

        return;

    }


    contenedor.innerHTML =
        reservas
            .map(
                (reserva, index) => `

                    <article class="reservation-row">

                        <strong>
                            Reserva #${index + 1}
                        </strong>

                        <p>
                            ${escaparHTML(
                                typeof reserva === "string"
                                    ? reserva
                                    : JSON.stringify(
                                        reserva
                                    )
                            )}
                        </p>

                    </article>

                `
            )
            .join("");

}


/* =========================================================
   BUSCADORES
========================================================= */

function inicializarBuscadores() {

    const buscadores = [

        [
            "buscarResenas",
            renderizarResenas
        ],

        [
            "buscarPlatos",
            renderizarCarta
        ],

        [
            "buscarEventos",
            renderizarEventos
        ]

    ];

    buscadores.forEach(
        ([id, callback]) => {

            document
                .getElementById(id)
                ?.addEventListener(
                    "input",
                    () => {

                        clearTimeout(
                            temporizadorBusqueda
                        );

                        temporizadorBusqueda =
                            setTimeout(
                                callback,
                                100
                            );

                    }
                );

        }
    );


    document
        .getElementById(
            "limpiarBusquedaResenas"
        )
        ?.addEventListener(
            "click",
            () => {

                const input =
                    document.getElementById(
                        "buscarResenas"
                    );

                if (input) {
                    input.value = "";
                }

                renderizarResenas();

            }
        );

}


/* =========================================================
   PREVIEWS IMAGEN
========================================================= */

function inicializarPreviews() {

    [
        [
            "imagenPlato",
            "previewImagenPlato"
        ],

        [
            "imagenEvento",
            "previewImagenEvento"
        ]

    ].forEach(
        ([inputId, previewId]) => {

            document
                .getElementById(inputId)
                ?.addEventListener(
                    "input",
                    () =>
                        actualizarPreview(
                            inputId,
                            previewId
                        )
                );

        }
    );

}


function actualizarPreview(
    inputId,
    previewId
) {

    const input =
        document.getElementById(
            inputId
        );

    const preview =
        document.getElementById(
            previewId
        );

    if (!input || !preview) {
        return;
    }

    const url =
        textoSeguro(
            input.value
        );

    if (!url) {

        limpiarPreview(
            previewId
        );

        return;

    }

    const segura =
        normalizarUrl(
            url,
            ""
        );

    if (!segura) {

        preview.classList.remove(
            "hidden"
        );

        preview.classList.add(
            "error"
        );

        preview.textContent =
            "La URL ingresada no es válida.";

        return;

    }

    preview.classList.remove(
        "hidden",
        "error"
    );

    preview.innerHTML = `
        <img
            src="${escaparAtributo(segura)}"
            alt="Vista previa"
        >
    `;

    const imagen =
        preview.querySelector(
            "img"
        );

    imagen?.addEventListener(
        "error",
        () => {

            preview.classList.add(
                "error"
            );

            preview.innerHTML =
                "No se pudo cargar la imagen.";

        },
        {
            once: true
        }
    );

}


function limpiarPreview(
    previewId
) {

    const preview =
        document.getElementById(
            previewId
        );

    if (!preview) {
        return;
    }

    preview.classList.add(
        "hidden"
    );

    preview.classList.remove(
        "error"
    );

    preview.replaceChildren();

}


/* =========================================================
   CONTADORES TEXTO
========================================================= */

function inicializarContadoresTexto() {

    [
        [
            "descripcionPlato",
            "contadorDescripcionPlato"
        ],

        [
            "descripcionEvento",
            "contadorDescripcionEvento"
        ],

        [
            "textoRespuesta",
            "contadorRespuesta"
        ]

    ].forEach(
        ([inputId, counterId]) => {

            document
                .getElementById(
                    inputId
                )
                ?.addEventListener(
                    "input",
                    actualizarContadoresTexto
                );

        }
    );

}


function actualizarContadoresTexto() {

    const pares = [

        [
            "descripcionPlato",
            "contadorDescripcionPlato"
        ],

        [
            "descripcionEvento",
            "contadorDescripcionEvento"
        ],

        [
            "textoRespuesta",
            "contadorRespuesta"
        ]

    ];

    pares.forEach(
        ([inputId, counterId]) => {

            const input =
                document.getElementById(
                    inputId
                );

            const counter =
                document.getElementById(
                    counterId
                );

            if (
                input &&
                counter
            ) {

                counter.textContent =
                    input.value.length;

            }

        }
    );

}


/* =========================================================
   EVENT DELEGATION
========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-action]"
            );

        if (!button) {
            return;
        }

        const action =
            button.dataset.action;


        if (
            action ===
            "edit-dish"
        ) {

            editarPlato(
                button.dataset.category,
                button.dataset.dish
            );

        }


        if (
            action ===
            "delete-dish"
        ) {

            eliminarPlato(
                button.dataset.category,
                button.dataset.dish
            );

        }


        if (
            action ===
            "toggle-dish"
        ) {

            cambiarEstadoPlato(
                button.dataset.category,
                button.dataset.dish
            );

        }


        if (
            action ===
            "edit-category"
        ) {

            editarCategoria(
                button.dataset.category
            );

        }


        if (
            action ===
            "delete-category"
        ) {

            eliminarCategoria(
                button.dataset.category
            );

        }


        if (
            action ===
            "toggle-category"
        ) {

            cambiarEstadoCategoria(
                button.dataset.category
            );

        }


        if (
            action ===
            "edit-event"
        ) {

            editarEvento(
                button.dataset.event
            );

        }


        if (
            action ===
            "delete-event"
        ) {

            eliminarEvento(
                button.dataset.event
            );

        }


        if (
            action ===
            "toggle-event"
        ) {

            cambiarEstadoEvento(
                button.dataset.event
            );

        }


        if (
            action ===
            "answer-review"
        ) {

            abrirResponderResena(
                button.dataset.review
            );

        }


        if (
            action ===
            "delete-review"
        ) {

            abrirEliminarResena(
                button.dataset.review
            );

        }

    }
);


/* =========================================================
   MODALES
========================================================= */

function inicializarModales() {

    document
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    cerrarModal(
                        button.dataset.closeModal
                    );

                }
            );

        });


    document
        .querySelectorAll(
            ".modal"
        )
        .forEach(modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modal
                    ) {

                        cerrarModal(
                            modal.id
                        );

                    }

                }
            );

        });


    document
        .getElementById(
            "confirmarEliminar"
        )
        ?.addEventListener(
            "click",
            confirmarEliminarResena
        );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                document
                    .querySelectorAll(
                        ".modal.open"
                    )
                    .forEach(
                        modal =>
                            cerrarModal(
                                modal.id
                            )
                    );

                cerrarSidebarMobile();

            }

        }
    );

}


function abrirModal(
    modalId
) {

    const modal =
        document.getElementById(
            modalId
        );

    if (!modal) {
        return;
    }

    modal.classList.add(
        "open"
    );

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";

}


function cerrarModal(
    modalId
) {

    const modal =
        document.getElementById(
            modalId
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "open"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    if (
        !document.querySelector(
            ".modal.open"
        )
    ) {

        document.body.style.overflow =
            "";

    }

    if (
        modalId ===
        "modalEliminar"
    ) {

        resenaAEliminar =
            null;

    }

    if (
        modalId ===
        "modalResponder"
    ) {

        resenaAResponder =
            null;

    }

}


/* =========================================================
   SINCRONIZACIÓN
========================================================= */

function inicializarSincronizacion() {

    const claves =
        [

            ADMIN_CONFIG.storage.menu,

            ADMIN_CONFIG.storage.eventos,

            ADMIN_CONFIG.storage.resenas,

            ADMIN_CONFIG.storage.reservas,

            ADMIN_CONFIG.legacyStorage.menu,

            ADMIN_CONFIG.legacyStorage.eventos,

            ADMIN_CONFIG.legacyStorage.resenas,

            ADMIN_CONFIG.legacyStorage.reservas

        ];


    window.addEventListener(
        "storage",
        event => {

            if (
                claves.includes(
                    event.key
                )
            ) {

                actualizarTodo();

            }

        }
    );


    window.addEventListener(
        "cebollitasStorageChange",
        event => {

            if (
                !event.detail ||
                claves.includes(
                    event.detail.clave
                )
            ) {

                actualizarTodo();

            }

        }
    );


    window.addEventListener(
        "focus",
        actualizarTodo
    );


    setInterval(
        () => {

            if (
                sessionStorage.getItem(
                    ADMIN_CONFIG.sessionKey
                ) === "true"
            ) {

                actualizarTodo();

            }

        },
        3000
    );

}


/* =========================================================
   ACTUALIZAR TODO
========================================================= */

function actualizarTodo() {

    actualizarUsuario();

    actualizarDashboard();

    renderizarUltimasResenas();

    renderizarResenas();

    renderizarCarta();

    renderizarEventos();

    renderizarReservas();

}


/* =========================================================
   DASHBOARD
========================================================= */

function actualizarDashboard() {

    const menu =
        obtenerMenu();

    const eventos =
        obtenerEventos();

    const resenas =
        obtenerResenas();

    const reservas =
        obtenerReservas();


    const cantidadPlatos =
        menu.reduce(
            (total, categoria) =>
                total +
                categoria.platos.length,
            0
        );


    const eventosActivos =
        eventos.filter(
            evento =>
                evento.activo !== false
        ).length;


    ponerTexto(
        "cantidadPlatos",
        cantidadPlatos
    );

    ponerTexto(
        "cantidadEventos",
        eventosActivos
    );

    ponerTexto(
        "cantidadResenas",
        resenas.length
    );

    ponerTexto(
        "cantidadReservas",
        reservas.length
    );

    ponerTexto(
        "contadorEventosMenu",
        eventosActivos
    );

    ponerTexto(
        "contadorResenas",
        resenas.length
    );

}


/* =========================================================
   ESTADO VACÍO
========================================================= */

function crearEstadoVacio(
    icono,
    titulo,
    descripcion
) {

    return `

        <div class="empty-state">

            <div class="empty-icon">
                ${escaparHTML(icono)}
            </div>

            <h3>
                ${escaparHTML(titulo)}
            </h3>

            <p>
                ${escaparHTML(descripcion)}
            </p>

        </div>

    `;

}


/* =========================================================
   HELPERS DOM
========================================================= */

function ponerTexto(
    id,
    texto
) {

    const elemento =
        document.getElementById(
            id
        );

    if (elemento) {

        elemento.textContent =
            texto ?? "";

    }

}


function ponerValor(
    id,
    valor
) {

    const elemento =
        document.getElementById(
            id
        );

    if (elemento) {

        elemento.value =
            valor ?? "";

    }

}


/* =========================================================
   NOTIFICACIONES
========================================================= */

function mostrarNotificacion(
    titulo,
    mensaje,
    tipo = "success"
) {

    const notificacion =
        document.getElementById(
            "notificacionAdmin"
        );

    if (!notificacion) {
        return;
    }

    clearTimeout(
        temporizadorNotificacion
    );

    notificacion.className =
        "notification";

    if (
        tipo === "error"
    ) {

        notificacion.classList.add(
            "error"
        );

    }

    const icono =
        tipo === "error"
            ? "!"
            : "✓";

    notificacion.innerHTML = `

        <div class="notification-icon">
            ${icono}
        </div>

        <div class="notification-content">

            <strong>
                ${escaparHTML(titulo)}
            </strong>

            <span>
                ${escaparHTML(mensaje)}
            </span>

        </div>

    `;

    requestAnimationFrame(
        () => {

            notificacion.classList.add(
                "show"
            );

        }
    );

    temporizadorNotificacion =
        setTimeout(
            () => {

                notificacion.classList.remove(
                    "show"
                );

            },
            4000
        );

}


/* =========================================================
   EXPORTACIÓN GLOBAL
   Compatibilidad con cualquier código anterior
========================================================= */

window.editarPlato =
    editarPlato;

window.eliminarPlato =
    eliminarPlato;

window.cambiarEstadoPlato =
    cambiarEstadoPlato;

window.crearCategoria =
    () => abrirModalCategoria();

window.editarCategoria =
    editarCategoria;

window.eliminarCategoria =
    eliminarCategoria;

window.cambiarEstadoCategoria =
    cambiarEstadoCategoria;

window.editarEvento =
    editarEvento;

window.eliminarEvento =
    eliminarEvento;

window.cambiarEstadoEvento =
    cambiarEstadoEvento;

window.responderResena =
    abrirResponderResena;

window.abrirModalEliminar =
    abrirEliminarResena;


/* =========================================================
   FIN
========================================================= */