// 2 Player Basketball Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const hoop = { x: canvas.width / 2 - 40, y: 50, width: 80, height: 10 };
const players = [
	{ x: 150, y: 400, w: 40, h: 40, color: '#ff4444', ball: null, score: 0 }, // Player 1
	{ x: 650, y: 400, w: 40, h: 40, color: '#4488ff', ball: null, score: 0 }  // Player 2
];

// Ball properties
function createBall(playerIdx) {
	return {
		x: players[playerIdx].x + players[playerIdx].w / 2,
		y: players[playerIdx].y,
		radius: 12,
		vy: -8,
		vx: 0,
		active: true,
		player: playerIdx
	};
}

// Controls
const keys = {};
document.addEventListener('keydown', e => { keys[e.code] = true; });
document.addEventListener('keyup', e => { keys[e.code] = false; });

function update() {
	// Player 1: WASD
	if (keys['KeyA']) players[0].x -= 5;
	if (keys['KeyD']) players[0].x += 5;
	if (keys['KeyW']) players[0].y -= 5;
	if (keys['KeyS']) players[0].y += 5;
	// Player 2: Arrow Keys
	if (keys['ArrowLeft']) players[1].x -= 5;
	if (keys['ArrowRight']) players[1].x += 5;
	if (keys['ArrowUp']) players[1].y -= 5;
	if (keys['ArrowDown']) players[1].y += 5;

	// Boundaries
	players.forEach(p => {
		p.x = Math.max(0, Math.min(canvas.width - p.w, p.x));
		p.y = Math.max(hoop.y + hoop.height + 10, Math.min(canvas.height - p.h, p.y));
	});

	// Shooting
	if (keys['Space'] && !players[0].ball) {
		players[0].ball = createBall(0);
	}
	if (keys['Enter'] && !players[1].ball) {
		players[1].ball = createBall(1);
	}

	// Ball movement
	players.forEach((p, idx) => {
		if (p.ball && p.ball.active) {
			p.ball.y += p.ball.vy;
			p.ball.x += p.ball.vx;
			p.ball.vy += 0.3; // gravity
			// Check for hoop
			if (
				p.ball.y - p.ball.radius < hoop.y + hoop.height &&
				p.ball.x > hoop.x && p.ball.x < hoop.x + hoop.width &&
				p.ball.y > hoop.y
			) {
				p.score++;
				document.getElementById('score' + (idx + 1)).textContent = `Player ${idx + 1}: ${p.score}`;
				p.ball.active = false;
			}
			// Out of bounds
			if (p.ball.y > canvas.height || p.ball.x < 0 || p.ball.x > canvas.width) {
				p.ball.active = false;
			}
			if (!p.ball.active) p.ball = null;
		}
	});
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// Draw hoop
	ctx.fillStyle = '#ffcc00';
	ctx.fillRect(hoop.x, hoop.y, hoop.width, hoop.height);
	ctx.strokeStyle = '#fff';
	ctx.lineWidth = 4;
	ctx.beginPath();
	ctx.arc(hoop.x + hoop.width / 2, hoop.y + 5, 35, Math.PI, 0);
	ctx.stroke();
	// Draw players
	players.forEach(p => {
		ctx.fillStyle = p.color;
		ctx.fillRect(p.x, p.y, p.w, p.h);
	});
	// Draw balls
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

function gameLoop() {
	update();
	draw();
	requestAnimationFrame(gameLoop);
}

gameLoop();
