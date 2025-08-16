// UI logic: start screen, mode selection, pause button
const startScreen = document.getElementById('startScreen');
const gameUI = document.getElementById('gameUI');
const btn1p = document.getElementById('btn1p');
const btn2p = document.getElementById('btn2p');
const btnTraining = document.getElementById('btnTraining');
const scoreboard = document.getElementById('scoreboard');
let gameMode = null;
btn1p.onclick = () => startGame('1p');
btn2p.onclick = () => startGame('2p');
btnTraining.onclick = () => startGame('training');
gameUI.style.display = 'none';
