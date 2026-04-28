/* ============================================================
   AUTOR: Jean Paul Moncada
   FUNCIÓN: Motor principal del juego. Controla el canvas 2D,
            el bucle con requestAnimationFrame (~60fps), el
            temporizador con setInterval, la física de la bola
            (movimiento, rebote, detección de clic con teorema de
            Pitágoras), los efectos visuales (partículas, destellos),
            el video de fondo, el HUD y el flujo de fin de partida.
   ============================================================ */
"use strict";

/* ============================================================
   game.js — Motor principal del juego
   Controla el canvas, la bola, el cursor, el puntaje y las vidas.
   Todo el juego vive dentro de este objeto llamado "Game".
   ============================================================ */

var Game = {

  /* ==========================================================
     VARIABLES DE ESTADO
     Estas variables guardan la información actual del juego.
     ========================================================== */

  canvas:        null,   /* El elemento <canvas> del HTML */
  ctx:           null,   /* El contexto 2D para dibujar en el canvas */
  animId:        null,   /* ID del requestAnimationFrame activo */
  timerInterval: null,   /* ID del setInterval del temporizador */

  isRunning: false,      /* ¿El juego está corriendo ahora mismo? */
  isPaused:  false,      /* ¿El juego está pausado? */
  clickPending: false,   /* ¿El jugador acaba de hacer clic? */

  /* Posición actual del cursor dentro del canvas */
  cursor: { x: 0, y: 0 },

  /* La bola: posición, velocidad, radio y tipo */
  ball: {
    x:    0,
    y:    0,
    vx:   0,       /* Velocidad horizontal */
    vy:   0,       /* Velocidad vertical */
    r:    30,      /* Radio en píxeles */
    type: "normal" /* "normal" (azul) o "danger" (roja) */
  },

  /* Estadísticas de la partida actual */
  score:       0,   /* Puntaje acumulado */
  lives:       3,   /* Vidas restantes */
  catches:     0,   /* Bolas capturadas esta partida */
  timeBonuses: 0,   /* Cantidad de bonuses de tiempo conseguidos */
  timeLeft:    60,  /* Segundos restantes */

  /* Efectos visuales */
  particles: [],    /* Lista de partículas de explosión */
  slashes:   [],    /* Lista de destellos al atrapar */

  /* Configuración cargada según la dificultad elegida */
  cfg: null,


  /* ==========================================================
     INICIALIZAR
     Se llama UNA SOLA VEZ al cargar la página.
     Prepara el canvas y los eventos del mouse.
     ========================================================== */
  init: function () {

    /* Obtenemos el canvas del HTML */
    this.canvas = document.getElementById("gameCanvas");
    this.ctx    = this.canvas.getContext("2d");

    /* Ajustamos el tamaño del canvas al tamaño de la ventana */
    this.ajustarCanvas();

    /* Si la ventana cambia de tamaño, volvemos a ajustar */
    var self = this;
    window.addEventListener("resize", function () {
      self.ajustarCanvas();
    });

    /* Guardamos el movimiento del mouse en this.cursor */
    this.canvas.addEventListener("mousemove", function (evento) {
      self.alMoverMouse(evento);
    });

    /* Cuando el jugador hace clic, marcamos que hay un clic pendiente */
    this.canvas.addEventListener("mousedown", function () {
      self.clickPending = true;
    });
  },


  /* Ajustar el tamaño del canvas según la ventana */
  ajustarCanvas: function () {
    this.canvas.width  = window.innerWidth  * 0.9;
    this.canvas.height = window.innerHeight * 0.8;
  },


  /* ==========================================================
     INICIAR PARTIDA
     Se llama cada vez que el jugador elige una dificultad.
     Reinicia todos los valores y arranca el juego.
     ========================================================== */
  start: function (dificultad) {

    /* Cargamos la configuración del nivel elegido (de config.js) */
    this.cfg = DIFFICULTY_CONFIG[dificultad];

    /* Reiniciamos todas las estadísticas */
    this.score       = 0;
    this.lives       = this.cfg.livesStart;
    this.catches     = 0;
    this.timeBonuses = 0;
    this.timeLeft    = 60;

    /* Limpiamos los efectos visuales */
    this.particles = [];
    this.slashes   = [];

    /* Marcamos que el juego está corriendo */
    this.isRunning = true;
    this.isPaused  = false;

    /* Lanzamos la primera bola, actualizamos el HUD y arrancamos */
    this.lanzarBola();
    this.actualizarHUD();
    this.iniciarTemporizador();
    this.bucleDeJuego();

    AudioManager.resume();
    AudioManager.startBgMusic();
  },


  /* ==========================================================
     TEMPORIZADOR
     Descuenta 1 segundo cada 1000ms mientras el juego corre.
     ========================================================== */
  iniciarTemporizador: function () {

    var self = this;

    this.timerInterval = setInterval(function () {

      /* Si está pausado o no corre, no hacemos nada */
      if (self.isPaused || !self.isRunning) {
        return;
      }

      /* Descontamos un segundo */
      self.timeLeft = self.timeLeft - 1;
      self.actualizarHUD();

      /* Si llega a 0, termina el juego */
      if (self.timeLeft <= 0) {
        self.endGame();
      }

    }, 1000);
  },


  /* ==========================================================
     LANZAR BOLA
     Coloca la bola en una posición aleatoria arriba del canvas
     con velocidad que aumenta según cuántas bolas se capturaron.
     ========================================================== */
  lanzarBola: function () {

    /* Posición horizontal aleatoria, siempre empieza arriba */
    this.ball.x = Math.random() * this.canvas.width;
    this.ball.y = 50;

    /* La velocidad aumenta con cada captura, hasta el máximo */
    var velocidadCalculada = this.cfg.ballSpeed + this.catches * this.cfg.speedIncrement;

    var velocidadFinal = velocidadCalculada;
    if (velocidadCalculada > this.cfg.maxSpeed) {
      velocidadFinal = this.cfg.maxSpeed;
    }

    /* Velocidad horizontal aleatoria (puede ir izquierda o derecha) */
    this.ball.vx = (Math.random() - 0.5) * velocidadFinal;

    /* Velocidad vertical siempre hacia abajo */
    this.ball.vy = velocidadFinal;

    /* 25% de probabilidad de ser bola peligrosa (roja) */
    if (Math.random() < 0.25) {
      this.ball.type = "danger";
    } else {
      this.ball.type = "normal";
    }
  },


  /* ==========================================================
     BUCLE DEL JUEGO
     Se llama ~60 veces por segundo gracias a requestAnimationFrame.
     Si está pausado, sigue llamándose pero no actualiza nada.
     ========================================================== */
  bucleDeJuego: function () {

    if (!this.isRunning) {
      return;
    }

    var self = this;

    /* requestAnimationFrame llama a esta función en el próximo frame */
    this.animId = requestAnimationFrame(function () {
      self.bucleDeJuego();
    });

    /* Si está pausado, no actualizamos ni dibujamos */
    if (this.isPaused) {
      return;
    }

    this.actualizar();
    this.dibujar();
  },

  /* Alias público que usa main.js */
  gameLoop: function () {
    this.bucleDeJuego();
  },


  /* ==========================================================
     ACTUALIZAR
     Mueve la bola, detecta colisiones y procesa el clic.
     Se ejecuta en cada frame.
     ========================================================== */
  actualizar: function () {

    var bola = this.ball;

    /* Movemos la bola según su velocidad */
    bola.x = bola.x + bola.vx;
    bola.y = bola.y + bola.vy;

    /* Si toca los bordes laterales, rebota */
    if (bola.x <= 0 || bola.x >= this.canvas.width) {
      bola.vx = bola.vx * -1;
    }

    /* Calculamos la distancia entre el cursor y el centro de la bola */
    var diferenciaX  = this.cursor.x - bola.x;
    var diferenciaY  = this.cursor.y - bola.y;
    var distancia    = Math.sqrt(diferenciaX * diferenciaX + diferenciaY * diferenciaY);

    /* Si hay un clic pendiente, verificamos si le dio a la bola */
    if (this.clickPending) {

      if (distancia < bola.r) {

        /* El clic tocó la bola */
        if (bola.type === "danger") {

          /* Era una bola roja — perdemos una vida */
          this.crearExplosion(bola.x, bola.y);
          this.lives = this.lives - 1;
          AudioManager.playMiss();

        } else {

          /* Era una bola normal (azul) — sumamos puntos */
          this.crearDestello(bola.x, bola.y, "#00ffcc");
          this.score   = this.score + this.cfg.pointsPerCatch;
          this.catches = this.catches + 1;
          AudioManager.playCatch();

          /* Cada 5 capturas damos +5 segundos de bonus */
          if (this.catches % 5 === 0) {
            this.timeLeft    = this.timeLeft + 5;
            this.timeBonuses = this.timeBonuses + 1;
            AudioManager.playBonus();
            ScreenManager.toast("+5s BONUS", "info");
          }
        }

        /* Lanzamos una bola nueva y actualizamos el HUD */
        this.lanzarBola();
        this.actualizarHUD();
      }

      /* El clic ya fue procesado */
      this.clickPending = false;
    }

    /* Si la bola cayó fuera del canvas por abajo */
    if (bola.y > this.canvas.height) {

      /* Solo perdemos vida si era una bola normal */
      if (bola.type === "normal") {
        this.lives = this.lives - 1;
        AudioManager.playMiss();
      }

      this.lanzarBola();
      this.actualizarHUD();
    }

    /* Si no quedan vidas, terminamos el juego */
    if (this.lives <= 0) {
      this.endGame();
    }
  },


  /* ==========================================================
     DIBUJAR
     Limpia el canvas y dibuja todo: fondo, efectos, bola, cursor.
     ========================================================== */
  dibujar: function () {

    var ctx = this.ctx;

    /* Borramos todo lo dibujado en el frame anterior */
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    /* Dibujamos en orden: fondo → efectos → bola → cursor */
    this.dibujarFondoVideo();
    this.actualizarYDibujarEfectos();
    this.dibujarBola();
    this.dibujarCursor();
  },


  /* ==========================================================
     EFECTOS VISUALES
     ========================================================== */

  /* Crear un destello donde se capturó la bola */
  crearDestello: function (x, y, color) {
    this.slashes.push({
      x:     x,
      y:     y,
      r:     this.ball.r,
      life:  30,
      color: color
    });
  },

  /* Crear partículas de explosión cuando se dispara una roja */
  crearExplosion: function (x, y) {
    for (var i = 0; i < 30; i++) {
      this.particles.push({
        x:     x,
        y:     y,
        vx:    (Math.random() - 0.5) * 6,
        vy:    (Math.random() - 0.5) * 6,
        life:  40,
        color: "#ff7700"
      });
    }
  },

  /* Dibujar y actualizar todas las partículas y destellos */
  actualizarYDibujarEfectos: function () {

    var ctx = this.ctx;
    var i;

    /* --- Partículas de explosión --- */
    var particulasVivas = [];
    for (i = 0; i < this.particles.length; i++) {
      var p = this.particles[i];
      if (p.life > 0) {
        particulasVivas.push(p);
      }
    }
    this.particles = particulasVivas;

    for (i = 0; i < this.particles.length; i++) {
      var particula = this.particles[i];
      particula.life = particula.life - 1;
      particula.x    = particula.x + particula.vx;
      particula.y    = particula.y + particula.vy;

      /* La opacidad baja conforme se acaba la vida */
      ctx.globalAlpha = particula.life / 40;
      ctx.beginPath();
      ctx.arc(particula.x, particula.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = particula.color;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    /* --- Destellos de captura --- */
    var destellosVivos = [];
    for (i = 0; i < this.slashes.length; i++) {
      var s = this.slashes[i];
      if (s.life > 0) {
        destellosVivos.push(s);
      }
    }
    this.slashes = destellosVivos;

    for (i = 0; i < this.slashes.length; i++) {
      var destello = this.slashes[i];
      destello.life = destello.life - 1;

      ctx.globalAlpha = destello.life / 30;
      ctx.beginPath();
      ctx.arc(destello.x, destello.y, destello.r / 2, 0, Math.PI * 2);
      ctx.fillStyle = destello.color;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  },


  /* ==========================================================
     DIBUJOS SIMPLES
     ========================================================== */

  /* Dibujar la bola en el canvas */
  dibujarBola: function () {
    var bola = this.ball;
    var ctx  = this.ctx;

    ctx.beginPath();
    ctx.arc(bola.x, bola.y, bola.r, 0, Math.PI * 2);

    /* Rojo si es peligrosa, azul si es normal */
    if (bola.type === "danger") {
      ctx.fillStyle = "#ff2200";
    } else {
      ctx.fillStyle = "#00ffcc";
    }

    ctx.fill();
  },

  /* Dibujar el círculo del cursor personalizado */
  dibujarCursor: function () {
    var ctx = this.ctx;

    ctx.beginPath();
    ctx.arc(this.cursor.x, this.cursor.y, 12, 0, Math.PI * 2);
    ctx.strokeStyle = "white";
    ctx.stroke();
  },

  /* Dibujar el video de fondo en el canvas */
  dibujarFondoVideo: function () {
    var video = document.getElementById("game-bg-video");

    /* readyState >= 2 significa que el video tiene datos para mostrar */
    if (!video || video.readyState < 2) {
      return;
    }

    this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
  },


  /* ==========================================================
     EVENTOS DEL MOUSE
     ========================================================== */

  /* Actualizar la posición del cursor cuando se mueve el mouse */
  alMoverMouse: function (evento) {
    var rectangulo  = this.canvas.getBoundingClientRect();
    this.cursor.x   = evento.clientX - rectangulo.left;
    this.cursor.y   = evento.clientY - rectangulo.top;
  },


  /* ==========================================================
     HUD (pantalla de información)
     Actualiza puntaje, vidas, tiempo y récord en el HTML.
     ========================================================== */
  actualizarHUD: function () {

    /* Construimos el texto de corazones según las vidas */
    var corazones = "";
    for (var i = 0; i < this.lives; i++) {
      corazones = corazones + "❤️";
    }

    document.getElementById("hud-score").textContent = this.score;
    document.getElementById("hud-lives").textContent = corazones;
    document.getElementById("hud-time").textContent  = this.timeLeft;
    document.getElementById("hud-best").textContent  = RankingManager.getBest();
  },

  /* Alias para compatibilidad con main.js */
  updateHUD: function () {
    this.actualizarHUD();
  },


  /* ==========================================================
     FIN DEL JUEGO
     Detiene el bucle y el temporizador, y muestra Game Over.
     ========================================================== */
  endGame: function () {

    this.isRunning = false;

    /* Detenemos el temporizador y la animación */
    clearInterval(this.timerInterval);
    cancelAnimationFrame(this.animId);

    AudioManager.playGameOver();

    /* Enviamos los datos a la pantalla de Game Over */
    ScreenManager.showGameOver({
      score:      this.score,
      catches:    this.catches,
      difficulty: DifficultyManager.getCurrent()
    });
  },


  /* ==========================================================
     PAUSAR Y REANUDAR
     ========================================================== */
  pause: function () {
    this.isPaused = true;
  },

  resume: function () {
    this.isPaused = false;
  }

};