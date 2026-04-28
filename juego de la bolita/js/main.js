/* ============================================================
   AUTOR: Jean Paul Moncada
   FUNCIÓN: Punto de entrada principal. Se ejecuta cuando el evento
            "screensReady" confirma que todas las pantallas están en
            el DOM. Inicializa los módulos, conecta cada botón con
            su función mediante getElementById y addEventListener,
            maneja la tecla Escape para pausa/reanuda, y coordina
            el flujo completo del juego incluyendo los créditos.
   ============================================================ */
"use strict";

/* ============================================================
   main.js — Punto de entrada principal
   Se ejecuta cuando todas las pantallas HTML ya están listas.
   Conecta cada botón con su función correspondiente.
   ============================================================ */

document.addEventListener("screensReady", function () {

  /* Iniciamos los módulos principales */
  AudioManager.init();
  Game.init();
  ScreenManager.spawnMeteors();
  mostrarCreditos();


  /* ── Cursor personalizado ─────────────────────────────────── */
  var elementoCursor = document.getElementById("custom-cursor");

  document.addEventListener("mousemove", function (evento) {
    if (elementoCursor) {
      elementoCursor.style.left = evento.clientX + "px";
      elementoCursor.style.top  = evento.clientY + "px";
    }
  });


  /* ── Botones del menú principal ──────────────────────────── */

  var botonIniciar = document.getElementById("btn-start");
  if (botonIniciar) {
    botonIniciar.addEventListener("click", function () {
      AudioManager.resume();
      AudioManager.playClick();
      ScreenManager.goto("difficulty");
      DifficultyManager.renderCards(iniciarJuegoConDificultad);
    });
  }

  var botonRanking = document.getElementById("btn-ranking-intro");
  if (botonRanking) {
    botonRanking.addEventListener("click", function () {
      AudioManager.playClick();
      RankingManager.render("ranking-list");
      ScreenManager.goto("ranking");
    });
  }

  var botonReglas = document.getElementById("btn-rules-intro");
  if (botonReglas) {
    botonReglas.addEventListener("click", function () {
      AudioManager.playClick();
      ScreenManager.goto("rules");
    });
  }

  var botonCreditos = document.getElementById("btn-credits-intro");
  if (botonCreditos) {
    botonCreditos.addEventListener("click", function () {
      AudioManager.playClick();
      ScreenManager.goto("credits");
    });
  }

  var botonVolverDiff = document.getElementById("btn-back-diff");
  if (botonVolverDiff) {
    botonVolverDiff.addEventListener("click", function () {
      AudioManager.playClick();
      ScreenManager.goto("intro");
    });
  }


  /* ── Botones del HUD durante el juego ────────────────────── */

  var botonPausa = document.getElementById("btn-pause");
  if (botonPausa) {
    botonPausa.addEventListener("click", function () {
      if (!Game.isPaused) {
        AudioManager.playClick();
        Game.pause();
        ScreenManager.goto("pause");
      }
    });
  }

  var botonSalir = document.getElementById("btn-quit");
  if (botonSalir) {
    botonSalir.addEventListener("click", function () {
      AudioManager.playClick();
      Game.endGame();
    });
  }


  /* ── Botones de la pantalla de pausa ─────────────────────── */

  var botonReanudar = document.getElementById("btn-resume");
  if (botonReanudar) {
    botonReanudar.addEventListener("click", function () {
      AudioManager.playClick();
      Game.resume();
      ScreenManager.goto("game");
    });
  }

  var botonAbandonar = document.getElementById("btn-quit-pause");
  if (botonAbandonar) {
    botonAbandonar.addEventListener("click", function () {
      AudioManager.playClick();
      Game.endGame();
    });
  }


  /* ── Botones de Game Over ─────────────────────────────────── */

  var botonRejugar = document.getElementById("btn-replay");
  if (botonRejugar) {
    botonRejugar.addEventListener("click", function () {
      AudioManager.playClick();
      var dificultadActual = DifficultyManager.getCurrent();
      ScreenManager.goto("game");
      ScreenManager.showCountdown(function () {
        Game.start(dificultadActual);
      });
    });
  }

  var botonRankingGO = document.getElementById("btn-ranking-go");
  if (botonRankingGO) {
    botonRankingGO.addEventListener("click", function () {
      AudioManager.playClick();
      RankingManager.render("ranking-list");
      ScreenManager.goto("ranking");
    });
  }

  var botonMenuGO = document.getElementById("btn-menu-go");
  if (botonMenuGO) {
    botonMenuGO.addEventListener("click", function () {
      AudioManager.playClick();
      ScreenManager.goto("intro");
    });
  }


  /* ── Botones del ranking ─────────────────────────────────── */

  var botonVolverRanking = document.getElementById("btn-back-ranking");
  if (botonVolverRanking) {
    botonVolverRanking.addEventListener("click", function () {
      AudioManager.playClick();
      ScreenManager.goto("intro");
    });
  }

  var botonBorrarRanking = document.getElementById("btn-clear-ranking");
  if (botonBorrarRanking) {
    botonBorrarRanking.addEventListener("click", function () {
      AudioManager.playClick();
      var confirmar = confirm("¿Eliminar todo el ranking?");
      if (confirmar) {
        RankingManager.clear();
        RankingManager.render("ranking-list");
        ScreenManager.toast("Ranking eliminado", "warning");
      }
    });
  }


  /* ── Botones de reglas y créditos ────────────────────────── */

  var botonVolverReglas = document.getElementById("btn-back-rules");
  if (botonVolverReglas) {
    botonVolverReglas.addEventListener("click", function () {
      AudioManager.playClick();
      ScreenManager.goto("intro");
    });
  }

  var botonVolverCreditos = document.getElementById("btn-back-credits");
  if (botonVolverCreditos) {
    botonVolverCreditos.addEventListener("click", function () {
      AudioManager.playClick();
      ScreenManager.goto("intro");
    });
  }


  /* ── Tecla Escape: pausa o reanuda ───────────────────────── */

  document.addEventListener("keydown", function (evento) {

    if (evento.key === "Escape") {

      var pantallaJuego = document.getElementById("screen-game");
      var pantallaPausa = document.getElementById("screen-pause");

      var juegoVisible  = pantallaJuego && !pantallaJuego.classList.contains("hidden");
      var pausaVisible  = pantallaPausa && !pantallaPausa.classList.contains("hidden");

      if (pausaVisible) {
        Game.resume();
        ScreenManager.goto("game");
      } else if (juegoVisible) {
        Game.pause();
        ScreenManager.goto("pause");
      }
    }
  });


  /* ── Función: iniciar juego con la dificultad elegida ─────── */

  function iniciarJuegoConDificultad(dificultad) {

    DifficultyManager.set(dificultad);
    ScreenManager.goto("game");

    ScreenManager.showCountdown(function () {
      Game.start(dificultad);
      var nombreDificultad = DIFFICULTY_CONFIG[dificultad].label;
      ScreenManager.toast("¡Modo " + nombreDificultad + " activado!", "info");
    });
  }

  /* Mostramos las tarjetas de dificultad al cargar */
  DifficultyManager.renderCards(iniciarJuegoConDificultad);


  /* ── Función: mostrar créditos del equipo ─────────────────── */

  function mostrarCreditos() {

    var grid = document.getElementById("credits-grid");
    if (!grid) { return; }

    var htmlTotal = "";

    for (var i = 0; i < CREDITS.length; i++) {
      var miembro = CREDITS[i];

      htmlTotal += "<div class='creator-card panel'>";
      htmlTotal +=   "<div class='creator-avatar' style='border-color:" + miembro.color + ";box-shadow:0 0 20px " + miembro.color + "44;background:" + miembro.color + "18;'>";
      htmlTotal +=     miembro.avatar;
      htmlTotal +=   "</div>";
      htmlTotal +=   "<div class='creator-name' style='color:" + miembro.color + "'>" + miembro.name + "</div>";
      htmlTotal +=   "<div class='creator-role'>" + miembro.role + "</div>";
      htmlTotal += "</div>";
    }

    grid.innerHTML = htmlTotal;
  }


  /* ── Pantalla inicial ─────────────────────────────────────── */
  ScreenManager.goto("intro");

});