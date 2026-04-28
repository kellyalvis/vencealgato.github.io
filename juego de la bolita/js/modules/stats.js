/* ============================================================
   AUTOR: Nilton
   FUNCIÓN: Módulo IIFE que gestiona las estadísticas del jugador
            usando localStorage. Convierte objetos a texto con
            JSON.stringify al guardar y JSON.parse al leer.
            Expone tres funciones públicas: getAll, save y clear.
   ============================================================ */
"use strict";

/* ============================================================
   stats.js — Guarda las estadísticas del jugador
   Usa localStorage para recordar los datos aunque se cierre
   el navegador. localStorage guarda texto, por eso usamos
   JSON.stringify (objeto → texto) y JSON.parse (texto → objeto).
   ============================================================ */

var StatsManager = (function () {

  /* Nombre de la clave en localStorage donde guardamos los datos */
  var CLAVE_GUARDADO = "capturaLaBolita_stats";


  /* ── Obtener las estadísticas guardadas ──────────────────────
     Leemos el localStorage. Si hay datos los devolvemos.
     Si no hay nada, devolvemos valores en cero.
     ─────────────────────────────────────────────────────────── */
  function obtenerTodo() {

    /* Leemos el texto guardado en localStorage */
    var textoGuardado = localStorage.getItem(CLAVE_GUARDADO);

    /* Si existe, lo convertimos de texto a objeto */
    if (textoGuardado) {
      var estadisticas = JSON.parse(textoGuardado);

      /* Nos aseguramos de que los campos existan */
      if (!estadisticas.gamesPlayed) {
        estadisticas.gamesPlayed = 0;
      }
      if (!estadisticas.totalCatches) {
        estadisticas.totalCatches = 0;
      }
      if (!estadisticas.difficultiesPlayed) {
        estadisticas.difficultiesPlayed = [];
      }

      return estadisticas;
    }

    /* Si no hay datos, devolvemos estadísticas vacías */
    var estadisticasVacias = {
      gamesPlayed: 0,
      totalCatches: 0,
      difficultiesPlayed: []
    };

    return estadisticasVacias;
  }


  /* ── Guardar las estadísticas ────────────────────────────────
     Convertimos el objeto a texto con JSON.stringify
     y lo guardamos en localStorage.
     ─────────────────────────────────────────────────────────── */
  function guardar(estadisticas) {

    /* Nos aseguramos de que difficultiesPlayed sea un array */
    if (!Array.isArray(estadisticas.difficultiesPlayed)) {
      estadisticas.difficultiesPlayed = [];
    }

    /* Guardamos el objeto como texto en localStorage */
    var textoParaGuardar = JSON.stringify(estadisticas);
    localStorage.setItem(CLAVE_GUARDADO, textoParaGuardar);
  }


  /* ── Reiniciar todas las estadísticas ────────────────────────
     Simplemente guardamos un objeto con todo en cero.
     ─────────────────────────────────────────────────────────── */
  function reiniciar() {
    var estadisticasVacias = {
      gamesPlayed: 0,
      totalCatches: 0,
      difficultiesPlayed: []
    };

    guardar(estadisticasVacias);
  }


  /* ── Funciones públicas del módulo ───────────────────────────
     Solo estas funciones pueden usarse desde afuera.
     ─────────────────────────────────────────────────────────── */
  return {
    getAll: obtenerTodo,
    save:   guardar,
    clear:  reiniciar
  };

})();