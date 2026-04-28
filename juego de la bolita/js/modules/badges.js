/* ============================================================
   AUTOR: Franco
   FUNCIÓN: Módulo IIFE que gestiona el sistema de insignias/logros.
            Compara estadísticas de la partida contra las condiciones
            de cada badge en BADGES, guarda las desbloqueadas en
            localStorage, determina la mejor insignia por índice,
            muestra la animación de desbloqueo y selecciona cuál
            mostrar en la pantalla de Game Over.
   ============================================================ */
"use strict";

/* ============================================================
   badges.js — Sistema de insignias / logros del juego
   Cuando termina una partida, revisamos si el jugador
   cumplió alguna condición para ganar una insignia nueva.
   ============================================================ */

var BadgeManager = (function () {

  /* Clave de localStorage donde guardamos las insignias ganadas */
  var CLAVE_GUARDADO = "capturaLaBolita_badges";


  /* ── Obtener las insignias ya desbloqueadas ──────────────────
     Devuelve una lista de ids (ejemplo: ["novato", "guerrero"])
     ─────────────────────────────────────────────────────────── */
  function obtenerDesbloqueadas() {

    var textoGuardado = localStorage.getItem(CLAVE_GUARDADO);

    if (textoGuardado) {
      return JSON.parse(textoGuardado);
    }

    return [];
  }


  /* ── Guardar la lista de insignias desbloqueadas ─────────────
     ─────────────────────────────────────────────────────────── */
  function guardarDesbloqueadas(lista) {
    localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(lista));
  }


  /* ── Evaluar si el jugador ganó insignias nuevas ─────────────
     Recibe las estadísticas de la partida.
     Revisa cada insignia del array BADGES (de config.js)
     y verifica si se cumple su condición.
     Devuelve la lista de insignias nuevas ganadas.
     ─────────────────────────────────────────────────────────── */
  function evaluarInsignias(estadisticas) {

    var listaDesbloqueadas = obtenerDesbloqueadas();
    var listaNuevas = [];

    /* Revisamos cada insignia definida en config.js */
    for (var i = 0; i < BADGES.length; i++) {
      var insignia = BADGES[i];

      /* Verificamos si ya estaba desbloqueada antes */
      var yaDesbloqueada = false;
      for (var j = 0; j < listaDesbloqueadas.length; j++) {
        if (listaDesbloqueadas[j] === insignia.id) {
          yaDesbloqueada = true;
        }
      }

      /* Si no estaba desbloqueada y cumple la condición, la añadimos */
      if (!yaDesbloqueada && insignia.condition(estadisticas)) {
        listaDesbloqueadas.push(insignia.id);
        listaNuevas.push(insignia);
      }
    }

    /* Si ganó insignias nuevas, las guardamos */
    if (listaNuevas.length > 0) {
      guardarDesbloqueadas(listaDesbloqueadas);
    }

    return listaNuevas;
  }


  /* ── Obtener la mejor insignia de una lista ──────────────────
     "Mejor" = la que aparece más abajo en el array BADGES.
     Eso significa que es más difícil de ganar.
     ─────────────────────────────────────────────────────────── */
  function obtenerMejorInsignia(listaNuevas) {

    if (!listaNuevas || listaNuevas.length === 0) {
      return null;
    }

    var mejor = listaNuevas[0];

    for (var i = 0; i < listaNuevas.length; i++) {
      var actual = listaNuevas[i];

      /* Buscamos el índice de cada una en el array BADGES */
      var indiceMejor  = -1;
      var indiceActual = -1;

      for (var j = 0; j < BADGES.length; j++) {
        if (BADGES[j].id === mejor.id)  { indiceMejor  = j; }
        if (BADGES[j].id === actual.id) { indiceActual = j; }
      }

      /* Si la actual está más abajo (índice mayor), es mejor */
      if (indiceActual > indiceMejor) {
        mejor = actual;
      }
    }

    return mejor;
  }


  /* ── Mostrar animación de insignia desbloqueada ──────────────
     Crea un div que aparece en pantalla y desaparece solo.
     ─────────────────────────────────────────────────────────── */
  function mostrarAnimacion(insignia) {

    if (!insignia) {
      return;
    }

    var div = document.createElement("div");
    div.className = "badge-unlock";

    div.innerHTML =
      "<span class='badge-icon'>"  + insignia.icon + "</span>" +
      "<div class='badge-label'>✨ INSIGNIA DESBLOQUEADA</div>" +
      "<div class='badge-name'>"   + insignia.name + "</div>";

    document.body.appendChild(div);

    /* Eliminamos el div después de 3.2 segundos */
    setTimeout(function () {
      div.remove();
    }, 3200);
  }


  /* ── Obtener insignia para mostrar en Game Over ──────────────
     Si hay insignias nuevas, muestra la mejor.
     Si no, muestra una de las ya ganadas al azar.
     ─────────────────────────────────────────────────────────── */
  function obtenerInsigniaGameOver(listaNuevas) {

    /* Primero intentamos con las nuevas */
    var mejor = obtenerMejorInsignia(listaNuevas);
    if (mejor) {
      return mejor;
    }

    /* Si no hay nuevas, buscamos una aleatoria de las ya ganadas */
    var desbloqueadas = obtenerDesbloqueadas();

    if (desbloqueadas.length === 0) {
      return null;
    }

    var indiceAleatorio = Math.floor(Math.random() * desbloqueadas.length);
    var idAleatorio = desbloqueadas[indiceAleatorio];

    /* Buscamos el objeto completo de esa insignia */
    for (var i = 0; i < BADGES.length; i++) {
      if (BADGES[i].id === idAleatorio) {
        return BADGES[i];
      }
    }

    return null;
  }


  /* ── Borrar todas las insignias ──────────────────────────────
     Guardamos una lista vacía.
     ─────────────────────────────────────────────────────────── */
  function borrarTodo() {
    guardarDesbloqueadas([]);
  }


  /* ── Funciones públicas ──────────────────────────────────────
     Los nombres de afuera siguen igual para no romper el juego.
     ─────────────────────────────────────────────────────────── */
  return {
    getUnlocked:          obtenerDesbloqueadas,
    evaluate:             evaluarInsignias,
    getBestBadge:         obtenerMejorInsignia,
    showUnlockAnimation:  mostrarAnimacion,
    getBadgeForGameOver:  obtenerInsigniaGameOver,
    clear:                borrarTodo
  };

})();