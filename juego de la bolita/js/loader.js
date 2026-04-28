/* ============================================================
   AUTOR: Jean Paul Moncada
   FUNCIÓN: Carga los 8 archivos HTML de pantallas de forma secuencial
            usando fetch() y recursión (para respetar el orden, ya que
            fetch es asíncrono). Inserta cada pantalla en el #app con
            insertAdjacentHTML y al terminar lanza el evento
            personalizado "screensReady" para que main.js arranque.
   ============================================================ */
"use strict";

/* ============================================================
   loader.js — Carga los archivos HTML de las pantallas
   El juego tiene 8 pantallas separadas en archivos .html.
   Este archivo los descarga uno por uno y los pega dentro
   del div #app del index.html.
   Cuando termina, lanza el evento "screensReady" para que
   main.js sepa que puede arrancar.
   ============================================================ */

/* Lista de archivos de pantallas que hay que cargar */
var listaDePantallas = [
  "screens/screen-intro.html",
  "screens/screen-difficulty.html",
  "screens/screen-game.html",
  "screens/screen-pause.html",
  "screens/screen-gameover.html",
  "screens/screen-ranking.html",
  "screens/screen-rules.html",
  "screens/screen-credits.html"
];


/* ── Cargar un archivo HTML e insertarlo en el contenedor ────
   fetch() descarga el archivo desde el servidor.
   Cuando termina llama a la función "siguiente" para
   cargar el próximo archivo de la lista.
   ─────────────────────────────────────────────────────────── */
function cargarUnaPantalla(archivo, contenedor, siguiente) {

  fetch(archivo)
    .then(function (respuesta) {

      /* Convertimos la respuesta a texto HTML */
      return respuesta.text();
    })
    .then(function (codigoHTML) {

      /* Pegamos el HTML al final del #app */
      contenedor.insertAdjacentHTML("beforeend", codigoHTML);

      /* Llamamos al siguiente paso */
      siguiente();
    })
    .catch(function () {

      /* Si el archivo no se encontró, avisamos y seguimos igual */
      console.warn("No se pudo cargar:", archivo);
      siguiente();
    });
}


/* ── Cargar todas las pantallas una por una ──────────────────
   Esta función se llama a sí misma (recursión) con el índice
   siguiente hasta que no queden más archivos por cargar.
   ─────────────────────────────────────────────────────────── */
function cargarTodasLasPantallas(indice, contenedor) {

  /* Si ya cargamos todas, lanzamos el evento "screensReady" */
  if (indice >= listaDePantallas.length) {
    document.dispatchEvent(new Event("screensReady"));
    return;
  }

  /* Tomamos el archivo que corresponde a este índice */
  var archivoActual = listaDePantallas[indice];

  /* Cargamos ese archivo y al terminar pasamos al siguiente */
  cargarUnaPantalla(archivoActual, contenedor, function () {
    cargarTodasLasPantallas(indice + 1, contenedor);
  });
}


/* ── Arrancar cuando el HTML de la página esté listo ─────────
   DOMContentLoaded se dispara cuando el navegador terminó
   de leer el index.html.
   ─────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", function () {

  /* Buscamos el contenedor principal */
  var contenedorApp = document.getElementById("app");

  /* Si no existe el #app, no hacemos nada */
  if (!contenedorApp) {
    return;
  }

  /* Empezamos a cargar desde el primer archivo (índice 0) */
  cargarTodasLasPantallas(0, contenedorApp);
});