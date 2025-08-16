// Entry point: initialize game, call setup functions
function drawPlayers(ctx, players, gameMode) {
	players.forEach((p, idx) => {
		if (gameMode === 'training' && idx === 1) return;
		ctx.fillStyle = p.color;
		ctx.fillRect(p.x + 8, p.y + 24, 16, 28);
		ctx.beginPath();
		ctx.arc(p.x + 16, p.y + 16, 12, Math.PI * 0.1, Math.PI * 1.9);
		ctx.fillStyle = '#fcd299';
		ctx.fill();
		ctx.strokeStyle = '#333';
		ctx.stroke();
		ctx.strokeStyle = '#fcd299';
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.moveTo(p.x + 24, p.y + 32);
		ctx.lineTo(p.x + 36, p.y + 20);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(p.x + 8, p.y + 32);
		ctx.lineTo(p.x - 4, p.y + 20);
		ctx.stroke();
		ctx.strokeStyle = p.color;
		ctx.lineWidth = 7;
		ctx.beginPath();
		ctx.moveTo(p.x + 14, p.y + 52);
		ctx.lineTo(p.x + 14, p.y + p.h);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(p.x + 18, p.y + 52);
		ctx.lineTo(p.x + 18, p.y + p.h);
		ctx.stroke();
		ctx.fillStyle = '#fff';
		ctx.font = 'bold 12px Arial';
		ctx.fillText(idx + 1, p.x + 13, p.y + 44);
	});
}

function drawBalls(ctx, players) {
	players.forEach(p => {
		if (p.ball && p.ball.active) {
			ctx.beginPath();
			ctx.arc(p.ball.x, p.ball.y, p.ball.radius, 0, 2 * Math.PI);
			ctx.fillStyle = '#ff8800';
			ctx.fill();
			ctx.strokeStyle = '#fff';
			ctx.stroke();
		}
	});
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawCrowd(ctx, canvas, hoops);
	drawCourt(ctx, canvas, hoops);
	drawPlayers(ctx, players, gameMode);
	drawBalls(ctx, players);
}

function gameLoop() {
	update();
	draw();
	requestAnimationFrame(gameLoop);
}

function startGame(mode) {
	gameMode = mode;
	startScreen.style.display = 'none';
	gameUI.style.display = '';
	if (mode === '1p') {
		scoreboard.innerHTML = '<span id="score1">Player 1: 0</span> | <span id="score2">Bot: 0</span>';
	} else if (mode === '2p') {
		scoreboard.innerHTML = '<span id="score1">Player 1: 0</span> | <span id="score2">Player 2: 0</span>';
	} else if (mode === 'training') {
		scoreboard.innerHTML = '<span id="score1">Training</span>';
		players[1].x = -9999;
	}
	players[0].score = 0;
	if (players[1]) players[1].score = 0;
	if (document.getElementById('score1')) document.getElementById('score1').textContent = 'Player 1: 0';
	if (document.getElementById('score2')) document.getElementById('score2').textContent = 'Player 2: 0';
	gameLoop();
}
