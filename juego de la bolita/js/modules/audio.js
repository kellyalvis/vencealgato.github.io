  /* ============================================================
    AUTOR: Franco
    FUNCIÓN: Módulo IIFE que controla toda la música y efectos de
              sonido. Gestiona el bloqueo de autoplay del navegador
              con un listener de clic {once:true}, crea objetos Audio
              nuevos por cada efecto para permitir superposición, y
              expone funciones públicas como playCatch, playMiss,
              playBonus, playGameOver y toggleMute.
    ============================================================ */
"use strict";

  /* ============================================================
    audio.js — Controla toda la música y efectos de sonido
    Usamos el objeto Audio del navegador para reproducir sonidos.
    El patrón (function(){ ... })() crea un módulo privado:
    las variables de adentro no se pueden tocar desde afuera.
    ============================================================ */

var AudioManager = (function () {

  /* Música de fondo — se carga una sola vez al inicio */
  var musicaFondo = new Audio("assets/audio/song.ogg");
  musicaFondo.loop   = true;   /* Se repite sola */
  musicaFondo.volume = 0.5;    /* Volumen al 50% */

  /* Variable que controla si el sonido está silenciado */
  var silenciado = false;


    /* ── Inicializar el audio ────────────────────────────────────
      Los navegadores bloquean el audio hasta que el usuario
      haga un clic. Aquí "desbloqueamos" el audio con ese primer clic.
      ─────────────────────────────────────────────────────────── */
  function inicializar() {

    /* { once: true } hace que el evento se ejecute solo una vez */
    document.addEventListener("click", function () {
      musicaFondo.play()
        .then(function () {
          /* Pausamos enseguida — solo queríamos desbloquear */
          musicaFondo.pause();
          musicaFondo.currentTime = 0;
        })
        .catch(function () {
          /* Si falla, no hacemos nada — el navegador lo bloqueó */
        });
    }, { once: true });
  }


    /* ── Iniciar música de fondo ─────────────────────────────────
      Se llama cuando empieza una partida.
      ─────────────────────────────────────────────────────────── */
  function iniciarMusica() {
    if (!silenciado) {
      musicaFondo.play().catch(function () {});
    }
  }


    /* ── Detener música de fondo ─────────────────────────────────
      Se llama cuando termina la partida.
      ─────────────────────────────────────────────────────────── */
  function detenerMusica() {
    musicaFondo.pause();
    musicaFondo.currentTime = 0;
  }


  /* ── Reproducir cualquier sonido por ruta ────────────────────
     Creamos un objeto Audio nuevo cada vez para poder
     reproducir el mismo sonido varias veces a la vez.
     ─────────────────────────────────────────────────────────── */
  function reproducirSonido(ruta, volumen) {

    /* Si está silenciado, no reproducimos nada */
    if (silenciado) {
      return;
    }

    /* Si no se pasa volumen, usamos 0.5 por defecto */
    if (!volumen) {
      volumen = 0.5;
    }

    var sonido = new Audio(ruta);
    sonido.volume = volumen;
    sonido.play().catch(function () {});
  }


  /* ── Sonidos específicos del juego ───────────────────────────
     Cada función llama a reproducirSonido con su archivo.
     Así el resto del código solo llama AudioManager.playCatch()
     sin saber qué archivo se usa.
     ─────────────────────────────────────────────────────────── */

  function sonidoInicio() {
    reproducirSonido("assets/audio/start.ogg", 0.3);
  }

  function sonidoCaptura() {
    reproducirSonido("assets/audio/catch.wav", 0.6);
  }

  function sonidoFallo() {
    reproducirSonido("assets/audio/beep.ogg", 0.6);
  }

  function sonidoBonus() {
    reproducirSonido("assets/audio/bonus.ogg", 0.6);
  }

  function sonidoGameOver() {
    detenerMusica();
    reproducirSonido("assets/audio/gameover.ogg", 0.7);
  }

  function sonidoClic() {
    reproducirSonido("assets/audio/click.ogg", 0.5);
  }

  function sonidoCuentaRegresiva() {
    reproducirSonido("assets/audio/beep.ogg", 0.5);
  }


  /* ── Silenciar o activar el sonido ───────────────────────────
     Cambia el estado y devuelve si está silenciado o no.
     ─────────────────────────────────────────────────────────── */
  function alternarSilencio() {
    silenciado = !silenciado;
    musicaFondo.muted = silenciado;
    return silenciado;
  }


  /* ── Función vacía para compatibilidad ───────────────────────
     main.js llama AudioManager.resume() — la dejamos para
     que no dé error, aunque no hace nada aquí.
     ─────────────────────────────────────────────────────────── */
  function reanudar() {
    /* No necesita hacer nada */
  }


  /* ── Funciones públicas del módulo ───────────────────────────
     Los nombres de afuera (init, playCatch...) siguen igual
     para que el resto del juego funcione sin cambios.
     ─────────────────────────────────────────────────────────── */
  return {
    init:             inicializar,
    startBgMusic:     iniciarMusica,
    stopBgMusic:      detenerMusica,
    playStart:        sonidoInicio,
    playCatch:        sonidoCaptura,
    playMiss:         sonidoFallo,
    playBonus:        sonidoBonus,
    playGameOver:     sonidoGameOver,
    playClick:        sonidoClic,
    playCountdownBeep: sonidoCuentaRegresiva,
    toggleMute:       alternarSilencio,
    resume:           reanudar
  };

})();