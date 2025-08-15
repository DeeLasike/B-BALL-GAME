// 2 Player Basketball Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
// Side view: hoop on right, players start left
// Game objects (side view, two hoops)
const hoops = [
	{ x: 60, y: 320, width: 10, height: 80, rimY: 340 }, // left hoop
	{ x: canvas.width - 100, y: 320, width: 10, height: 80, rimY: 340 } // right hoop
];
const players = [
	{ x: 120, y: 400, w: 32, h: 64, color: '#ff4444', ball: null, score: 0, facing: 1, hoopIdx: 1 }, // Player 1 shoots right
	{ x: canvas.width - 180, y: 400, w: 32, h: 64, color: '#4488ff', ball: null, score: 0, facing: -1, hoopIdx: 0 }  // Player 2 shoots left
];

// Ball properties
function createBall(playerIdx) {
	// Ball starts at player's hand, moves in an arc toward their hoop
	let direction = players[playerIdx].hoopIdx === 1 ? 1 : -1;
	return {
		x: players[playerIdx].x + (direction === 1 ? players[playerIdx].w : 0),
		y: players[playerIdx].y + 20,
		radius: 12,
		vy: -7,
		vx: 7 * direction,
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

	// Boundaries (side view)
	players.forEach(p => {
		p.x = Math.max(0, Math.min(canvas.width - p.w, p.x));
		p.y = Math.max(320, Math.min(canvas.height - p.h, p.y));
	});

	// Shooting
	if (keys['Space'] && !players[0].ball) {
		players[0].ball = createBall(0);
	}
	if (keys['Enter'] && !players[1].ball) {
		players[1].ball = createBall(1);
	}

	// Ball movement (side view, two hoops)
	players.forEach((p, idx) => {
		if (p.ball && p.ball.active) {
			p.ball.y += p.ball.vy;
			p.ball.x += p.ball.vx;
			p.ball.vy += 0.3; // gravity
			// Check for correct hoop
			const hoop = hoops[p.hoopIdx];
			if (
				p.ball.x + p.ball.radius > hoop.x &&
				p.ball.x - p.ball.radius < hoop.x + hoop.width + 20 &&
				p.ball.y + p.ball.radius > hoop.rimY &&
				p.ball.y - p.ball.radius < hoop.rimY + 10
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
	// Draw court (floor)
	ctx.fillStyle = '#deb887';
	ctx.fillRect(0, 320 + 64, canvas.width, canvas.height - (320 + 64));
	// Draw hoops (side view, both sides)
	hoops.forEach(hoop => {
		ctx.strokeStyle = '#888';
		ctx.lineWidth = 8;
		ctx.beginPath();
		ctx.moveTo(hoop.x, hoop.y); // pole
		ctx.lineTo(hoop.x, hoop.y + hoop.height);
		ctx.stroke();
		// Rim
		ctx.strokeStyle = '#ffcc00';
		ctx.lineWidth = 6;
		ctx.beginPath();
		ctx.moveTo(hoop.x, hoop.rimY);
		ctx.lineTo(hoop.x + 30, hoop.rimY);
		ctx.stroke();
		// Net
		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 2;
		for (let i = 0; i < 5; i++) {
			ctx.beginPath();
			ctx.moveTo(hoop.x + 6 * i, hoop.rimY);
			ctx.lineTo(hoop.x + 6 * i, hoop.rimY + 18);
			ctx.stroke();
		}
	});
	// Draw players (side view)
	players.forEach((p, idx) => {
		// Body (torso)
		ctx.fillStyle = p.color;
		ctx.fillRect(p.x + 8, p.y + 24, 16, 28);
		// Head (profile)
		ctx.beginPath();
		ctx.arc(p.x + 16, p.y + 16, 12, Math.PI * 0.1, Math.PI * 1.9);
		ctx.fillStyle = '#fcd299';
		ctx.fill();
		ctx.strokeStyle = '#333';
		ctx.stroke();
		// Arm (front, shooting)
		ctx.strokeStyle = '#fcd299';
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.moveTo(p.x + 24, p.y + 32);
		ctx.lineTo(p.x + 36, p.y + 20);
		ctx.stroke();
		// Arm (back)
		ctx.beginPath();
		ctx.moveTo(p.x + 8, p.y + 32);
		ctx.lineTo(p.x - 4, p.y + 20);
		ctx.stroke();
		// Legs
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
		// Jersey number
		ctx.fillStyle = '#fff';
		ctx.font = 'bold 12px Arial';
		ctx.fillText(idx + 1, p.x + 13, p.y + 44);
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
