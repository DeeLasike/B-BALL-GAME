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
	{ x: 120, y: 400, w: 32, h: 64, color: '#ff4444', ball: null, score: 0, facing: 1, hoopIdx: 1, vy: 0, onGround: true }, // Player 1 shoots right
	{ x: canvas.width - 180, y: 400, w: 32, h: 64, color: '#4488ff', ball: null, score: 0, facing: -1, hoopIdx: 0, vy: 0, onGround: true }  // Player 2 shoots left
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
	// Jump for Player 1
	if (keys['KeyW'] && players[0].onGround) {
		players[0].vy = -12;
		players[0].onGround = false;
	}
	// Player 2: Arrow Keys
	if (keys['ArrowLeft']) players[1].x -= 5;
	if (keys['ArrowRight']) players[1].x += 5;
	// Jump for Player 2
	if (keys['ArrowUp'] && players[1].onGround) {
		players[1].vy = -12;
		players[1].onGround = false;
	}

	// Gravity and vertical movement
	players.forEach(p => {
		if (!p.onGround) {
			p.vy += 0.7; // gravity
			p.y += p.vy;
			// Ground collision
			if (p.y >= canvas.height - p.h) {
				p.y = canvas.height - p.h;
				p.vy = 0;
				p.onGround = true;
			}
		}
	});

	// Boundaries (side view)
	players.forEach(p => {
		p.x = Math.max(0, Math.min(canvas.width - p.w, p.x));
		// Prevent going above the court
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
	const courtY = 320 + 64;
	const courtHeight = canvas.height - courtY;
	ctx.fillStyle = '#deb887';
	ctx.fillRect(0, courtY, canvas.width, courtHeight);

	// Clip to court area for lines
	ctx.save();
	ctx.beginPath();
	ctx.rect(0, courtY, canvas.width, courtHeight);
	ctx.clip();
	ctx.strokeStyle = '#fff';
	ctx.lineWidth = 3;
	// Baselines
	ctx.beginPath();
	ctx.moveTo(0, canvas.height - 1);
	ctx.lineTo(canvas.width, canvas.height - 1);
	ctx.stroke();
	// Sidelines
	ctx.beginPath();
	ctx.moveTo(0, courtY);
	ctx.lineTo(canvas.width, courtY);
	ctx.stroke();
	// Key/paint areas (both sides)
	// Left key
	ctx.strokeRect(60, canvas.height - 180, 60, 120);
	// Right key
	ctx.strokeRect(canvas.width - 120, canvas.height - 180, 60, 120);
	// Free throw circles
	ctx.beginPath();
	ctx.arc(90, canvas.height - 180, 30, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(canvas.width - 90, canvas.height - 180, 30, 0, 2 * Math.PI);
	ctx.stroke();
	// Center circle
	ctx.beginPath();
	ctx.arc(canvas.width / 2, canvas.height - 120, 50, 0, 2 * Math.PI);
	ctx.stroke();
	// Three-point arcs
	ctx.beginPath();
	ctx.arc(90, canvas.height - 120, 90, Math.PI * 0.7, Math.PI * 2.3);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(canvas.width - 90, canvas.height - 120, 90, Math.PI * 0.7, Math.PI * 2.3);
	ctx.stroke();
	ctx.restore();
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
