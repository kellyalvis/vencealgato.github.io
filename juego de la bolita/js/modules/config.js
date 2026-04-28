/* ============================================================
   AUTOR: Nilton
   FUNCIÓN: Contiene todos los datos fijos del juego sin lógica:
            DIFFICULTY_CONFIG con los tres niveles (easy, medium, hard),
            el array BADGES con los ocho logros y sus condiciones,
            RANKING_CONFIG con la clave de localStorage, y el array
            CREDITS con los datos de cada integrante del equipo.
   ============================================================ */
"use strict";

/* ============================================================
   config.js — Toda la configuración y datos fijos del juego
   Aquí guardamos los valores que el juego necesita para funcionar.
   No hay lógica aquí, solo datos.
   ============================================================ */


/* ── Configuración de cada nivel de dificultad ──────────────
   Cada clave (easy, medium, hard) es un objeto con sus valores.
   El juego lee estos datos al iniciar una partida.
   ─────────────────────────────────────────────────────────── */
var DIFFICULTY_CONFIG = {

  easy: {
    label: "FÁCIL",
    icon: "🟢",
    ballSpeed: 2.8,
    speedIncrement: 0.18,
    ballRadius: 28,
    livesStart: 5,
    pointsPerCatch: 10,
    color: "easy",
    maxSpeed: 9
  },

  medium: {
    label: "MEDIO",
    icon: "🟡",
    ballSpeed: 4.5,
    speedIncrement: 0.28,
    ballRadius: 22,
    livesStart: 3,
    pointsPerCatch: 20,
    color: "medium",
    maxSpeed: 14
  },

  hard: {
    label: "DIFÍCIL",
    icon: "🔴",
    ballSpeed: 6.5,
    speedIncrement: 0.4,
    ballRadius: 16,
    livesStart: 2,
    pointsPerCatch: 35,
    color: "hard",
    maxSpeed: 20
  }

};


/* ── Lista de insignias del juego ────────────────────────────
   Cada insignia tiene un id, ícono, nombre, descripción
   y una condición: una función que recibe las estadísticas
   y devuelve true si el jugador merece esa insignia.
   ─────────────────────────────────────────────────────────── */
var BADGES = [

  {
    id: "novato",
    icon: "🌱",
    name: "NOVATO",
    desc: "Primera partida completada",
    condition: function (stats) {
      return stats.gamesPlayed >= 1;
    }
  },

  {
    id: "guerrero",
    icon: "⚔️",
    name: "GUERRERO",
    desc: "Captura 20 bolas en una partida",
    condition: function (stats) {
      return stats.catchesThisGame >= 20;
    }
  },

  {
    id: "heroe",
    icon: "🦸",
    name: "HÉROE",
    desc: "Alcanza 500 puntos",
    condition: function (stats) {
      return stats.scoreThisGame >= 500;
    }
  },

  {
    id: "leyenda",
    icon: "🏆",
    name: "LEYENDA",
    desc: "Alcanza 1000 puntos",
    condition: function (stats) {
      return stats.scoreThisGame >= 1000;
    }
  },

  {
    id: "superviviente",
    icon: "💀",
    name: "SUPERVIVIENTE",
    desc: "Termina con todas las vidas en difícil",
    condition: function (stats) {
      return stats.difficulty === "hard" && stats.livesLeft >= 2;
    }
  },

  {
    id: "veloz",
    icon: "⚡",
    name: "VELOZ",
    desc: "10 capturas con bonus de tiempo",
    condition: function (stats) {
      return stats.timeBonuses >= 10;
    }
  },

  {
    id: "maestro",
    icon: "🎯",
    name: "MAESTRO",
    desc: "50 capturas en total (acumulado)",
    condition: function (stats) {
      return stats.totalCatches >= 50;
    }
  },

  {
    id: "cosmonaut",
    icon: "🚀",
    name: "COSMONAUTA",
    desc: "Juega en los 3 niveles de dificultad",
    condition: function (stats) {
      return stats.difficultiesPlayed && stats.difficultiesPlayed.size >= 3;
    }
  }

];


/* ── Configuración del ranking ───────────────────────────────
   Dónde guardar el ranking y cuántas entradas mostrar.
   ─────────────────────────────────────────────────────────── */
var RANKING_CONFIG = {
  storageKey: "capturaLaBolita_ranking",
  maxEntries: 10
};


/* ── Créditos del equipo ─────────────────────────────────────
   Lista de los integrantes. main.js los usa para mostrarlos
   en la pantalla de créditos.
   ─────────────────────────────────────────────────────────── */
var CREDITS = [
  { name: "ESTUDIANTE 1", role: "Jean Paul Moncada", avatar: "👾", color: "#00d4ff" },
  { name: "ESTUDIANTE 2", role: "Kelly",             avatar: "🎮", color: "#ff4fcf" },
  { name: "ESTUDIANTE 3", role: "Nilton",            avatar: "🎨", color: "#ffe44d" },
  { name: "ESTUDIANTE 4", role: "Franco",            avatar: "🎵", color: "#00ff88" }
];