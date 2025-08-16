// Game logic, player and bot movement, ball handling
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const hoops = [
	{ x: 60, y: 320, width: 10, height: 80, rimY: 340 },
	{ x: canvas.width - 100, y: 320, width: 10, height: 80, rimY: 340 }
];
const players = [
	{ x: 120, y: 400, w: 32, h: 64, color: '#ff4444', ball: null, score: 0, facing: 1, hoopIdx: 1, vy: 0, onGround: true },
	{ x: canvas.width - 180, y: 400, w: 32, h: 64, color: '#4488ff', ball: null, score: 0, facing: -1, hoopIdx: 0, vy: 0, onGround: true }
];
let botCooldown = 0;

function createBall(playerIdx) {
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

const keys = {};
document.addEventListener('keydown', e => { keys[e.code] = true; });
document.addEventListener('keyup', e => { keys[e.code] = false; });

function update() {
	// ...existing code for update logic...
	// Player 1: WASD
	if (keys['KeyA']) players[0].x -= 5;
	if (keys['KeyD']) players[0].x += 5;
	// Jump for Player 1
	if (keys['KeyW'] && players[0].onGround) {
		players[0].vy = -12;
		players[0].onGround = false;
	}

	// Player 2: Human or Bot
	if (gameMode === '2p') {
		if (keys['ArrowLeft']) players[1].x -= 5;
		if (keys['ArrowRight']) players[1].x += 5;
		// Jump for Player 2
		if (keys['ArrowUp'] && players[1].onGround) {
			players[1].vy = -12;
			players[1].onGround = false;
		}
	} else if (gameMode === '1p') {
		// Simple bot logic: follow ball or player, jump and shoot
		const bot = players[1];
		const targetX = players[0].x;
		if (Math.abs(bot.x - targetX) > 10) {
			bot.x += bot.x < targetX ? 3 : -3;
		}
		// Bot jumps randomly if on ground
		if (bot.onGround && Math.random() < 0.01) {
			bot.vy = -12;
			bot.onGround = false;
		}
		// Bot shoots if near hoop and not already shooting
		if (!bot.ball && bot.x < 200 && bot.onGround && botCooldown <= 0) {
			bot.ball = createBall(1);
			botCooldown = 60; // cooldown frames
		}
		if (botCooldown > 0) botCooldown--;
	} else if (gameMode === 'training') {
		// Do nothing for player 2
	}

	// Gravity and vertical movement (land on middle of tan court)
	const courtY = 320 + 64;
	const courtHeight = canvas.height - courtY;
	const middleCourtY = courtY + courtHeight / 2 - players[0].h / 2;
	players.forEach(p => {
		if (!p.onGround) {
			p.vy += 0.7; // gravity
			p.y += p.vy;
			// Ground collision: always land on middle of tan court
			if (p.y >= canvas.height - p.h) {
				p.y = middleCourtY;
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
	if (gameMode === '2p' && keys['Enter'] && !players[1].ball) {
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
				if (gameMode === '1p') {
					if (idx === 0) {
						document.getElementById('score1').textContent = `Player 1: ${p.score}`;
					} else {
						document.getElementById('score2').textContent = `Bot: ${p.score}`;
					}
				} else {
					document.getElementById('score' + (idx + 1)).textContent = `Player ${idx + 1}: ${p.score}`;
				}
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
