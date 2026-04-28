/* ============================================================
   AUTOR: Jean Paul Moncada
   FUNCIÓN: Módulo IIFE que controla qué pantalla se muestra.
            irAPantalla oculta todas y muestra solo la pedida.
            mostrarGameOver rellena los datos de resultado.
            pedirNombreParaRanking gestiona el modal con listeners
            que se eliminan solos para evitar duplicados.
            También maneja toasts, cuenta regresiva y meteoros.
   ============================================================ */
"use strict";

/* ============================================================
   screens.js — Controla qué pantalla se muestra en cada momento
   El juego tiene 8 pantallas. Solo una está visible a la vez.
   Este módulo se encarga de mostrar, ocultar y navegar entre ellas.
   ============================================================ */

var listaNombresPantallas = [
  "intro", "difficulty", "game", "pause",
  "gameover", "ranking", "rules", "credits"
];

var pantallasConMenu = ["intro", "difficulty", "ranking", "rules", "credits"];

var ScreenManager = (function () {

  function mostrarPantalla(idPantalla) {
    var elemento = document.getElementById("screen-" + idPantalla);
    if (!elemento) { return; }
    elemento.classList.remove("hidden");
    elemento.classList.remove("fade-out");
    elemento.classList.add("fade-in");
  }

  function ocultarPantalla(idPantalla) {
    var elemento = document.getElementById("screen-" + idPantalla);
    if (!elemento) { return; }
    elemento.classList.add("hidden");
  }

  function irAPantalla(idPantalla) {
    for (var i = 0; i < listaNombresPantallas.length; i++) {
      var elem = document.getElementById("screen-" + listaNombresPantallas[i]);
      if (elem) { elem.classList.add("hidden"); }
    }
    mostrarPantalla(idPantalla);
    var header = document.getElementById("global-header");
    var footer = document.getElementById("global-footer");
    if (header && footer) {
      var esMenu = false;
      for (var j = 0; j < pantallasConMenu.length; j++) {
        if (pantallasConMenu[j] === idPantalla) { esMenu = true; }
      }
      if (esMenu) {
        header.style.display = "flex";
        footer.style.display = "flex";
      } else {
        header.style.display = "none";
        footer.style.display = "none";
      }
    }
  }

  function mostrarGameOver(datos) {
    var puntaje    = datos.score;
    var capturas   = datos.catches;
    var dificultad = datos.difficulty;
    var insignia   = datos.badge;
    var config     = DIFFICULTY_CONFIG[dificultad];

    var elemPuntaje  = document.getElementById("go-score");
    var elemCapturas = document.getElementById("go-catches");
    var elemDiff     = document.getElementById("go-diff");
    var elemBadge    = document.getElementById("go-badge");

    if (elemPuntaje)  { elemPuntaje.textContent  = puntaje.toLocaleString(); }
    if (elemCapturas) { elemCapturas.textContent = capturas; }
    if (elemDiff)     { elemDiff.textContent     = config ? config.label : dificultad; }

    if (elemBadge) {
      if (insignia) {
        elemBadge.innerHTML =
          "<span class='badge-icon'>" + insignia.icon + "</span>" +
          "<div class='badge-info'>"  +
            "<div class='badge-title'>" + insignia.name + "</div>" +
            "<div class='badge-desc'>"  + insignia.desc + "</div>" +
          "</div>";
        elemBadge.classList.remove("hidden");
      } else {
        elemBadge.classList.add("hidden");
      }
    }

    irAPantalla("gameover");
    pedirNombreParaRanking(puntaje, dificultad, capturas);
  }

  function pedirNombreParaRanking(puntaje, dificultad, capturas) {
    var modal        = document.getElementById("modal-name");
    var campoNombre  = document.getElementById("modal-name-input");
    var botonGuardar = document.getElementById("modal-name-confirm");
    if (!modal || !campoNombre || !botonGuardar) { return; }

    var posicion   = RankingManager.getPosition(puntaje);
    var textoModal = document.getElementById("modal-pos-text");
    if (textoModal) {
      textoModal.textContent = "¡Entraste en el TOP #" + posicion + "! ¿Cuál es tu nombre?";
    }

    campoNombre.value = "";
    modal.classList.remove("hidden");
    setTimeout(function () { campoNombre.focus(); }, 100);

    function confirmarNombre() {
      var nombreEscrito = campoNombre.value.trim();
      if (nombreEscrito === "") { nombreEscrito = "ANÓNIMO"; }
      RankingManager.addEntry(nombreEscrito, puntaje, dificultad, capturas);
      modal.classList.add("hidden");
      botonGuardar.removeEventListener("click", confirmarNombre);
      campoNombre.removeEventListener("keydown", alPresionarEnter);
    }

    function alPresionarEnter(evento) {
      if (evento.key === "Enter") { confirmarNombre(); }
    }

    botonGuardar.addEventListener("click", confirmarNombre);
    campoNombre.addEventListener("keydown", alPresionarEnter);
  }

  function mostrarToast(mensaje, tipo) {
    if (!tipo) { tipo = "info"; }
    var contenedor = document.getElementById("toast-container");
    if (!contenedor) { return; }
    var toast = document.createElement("div");
    toast.className   = "toast " + tipo;
    toast.textContent = mensaje;
    contenedor.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3200);
  }

  function mostrarCuentaRegresiva(alTerminar) {
    var fondo = document.createElement("div");
    fondo.className = "countdown-overlay";
    document.body.appendChild(fondo);
    var numero = 3;

    function actualizarNumero(texto, esUltimo) {
      var claseExtra = esUltimo ? " go" : "";
      fondo.innerHTML = "<div class='countdown-num" + claseExtra + "'>" + texto + "</div>";
    }

    actualizarNumero(numero, false);

    var intervalo = setInterval(function () {
      numero = numero - 1;
      if (numero > 0) {
        actualizarNumero(numero, false);
      } else if (numero === 0) {
        actualizarNumero("¡YA!", true);
        setTimeout(function () {
          fondo.remove();
          clearInterval(intervalo);
          if (alTerminar) { alTerminar(); }
        }, 900);
      }
    }, 900);
  }

  function crearMeteoros() {
    for (var i = 0; i < 6; i++) {
      var meteoro = document.createElement("div");
      meteoro.className               = "meteor";
      meteoro.style.left              = (Math.random() * 100) + "%";
      meteoro.style.top               = (Math.random() * -20) + "%";
      meteoro.style.animationDuration = (3 + Math.random() * 5) + "s";
      meteoro.style.animationDelay    = (Math.random() * 8) + "s";
      meteoro.style.opacity           = 0;
      document.body.appendChild(meteoro);
    }
  }

  return {
    show:          mostrarPantalla,
    hide:          ocultarPantalla,
    goto:          irAPantalla,
    showGameOver:  mostrarGameOver,
    toast:         mostrarToast,
    showCountdown: mostrarCuentaRegresiva,
    spawnMeteors:  crearMeteoros
  };

})();