// 2 Player Basketball Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Start screen logic
const startScreen = document.getElementById('startScreen');
const gameUI = document.getElementById('gameUI');
const btn1p = document.getElementById('btn1p');
const btn2p = document.getElementById('btn2p');
const btnTraining = document.getElementById('btnTraining');
const instructions = document.getElementById('instructions');
const scoreboard = document.getElementById('scoreboard');
let gameMode = null;
let botCooldown = 0;

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
		players[1].x = -9999; // Move player 2 off screen
	}
	// Reset scores and game state if needed
	players[0].score = 0;
	if (players[1]) players[1].score = 0;
	if (document.getElementById('score1')) document.getElementById('score1').textContent = 'Player 1: 0';
	if (document.getElementById('score2')) document.getElementById('score2').textContent = 'Player 2: 0';
	// Start game loop
	gameLoop();
}

btn1p.onclick = () => startGame('1p');
btn2p.onclick = () => startGame('2p');
btnTraining.onclick = () => startGame('training');

// Hide game UI initially
gameUI.style.display = 'none';

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

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw animated crowd above the court (multiple rows, with chairs)
	// Fill the green part with crowd
	const courtY = 320 + 64;
	const crowdSpacingX = 50; // more spread out horizontally
	const crowdSpacingY = 28; // more spread out vertically
	const backboardTop = hoops[0].y;
	const crowdRows = Math.floor((backboardTop - 40) / crowdSpacingY);
	const crowdPerRow = Math.floor(canvas.width / crowdSpacingX);
	const t = Date.now() / 400;
	const hoopMargin = 0;
	for (let row = 0; row < crowdRows; row++) {
		const yOffset = 40 + row * crowdSpacingY;
		for (let i = 0; i < crowdPerRow; i++) {
			const x = i * crowdSpacingX + 32 + (row % 2) * (crowdSpacingX / 2);
			// Skip crowd members that would overlap with the left or right hoop
			if (x < hoopMargin || x > canvas.width - hoopMargin) continue;
			// Animate arm wave
			const armAngle = Math.sin(t + i + row) * 0.7;
			// Animate shirt color
			const shirtColor = `hsl(${(i * 30 + row * 60 + t * 60) % 360}, 70%, 55%)`;
			// Chair
			ctx.fillStyle = '#444';
			ctx.fillRect(x - 10, yOffset + 38, 20, 10);
			ctx.strokeStyle = '#222';
			ctx.lineWidth = 2;
			ctx.strokeRect(x - 10, yOffset + 38, 20, 10);
			// Legs (draw first)
			ctx.strokeStyle = shirtColor;
			ctx.lineWidth = 7;
			ctx.beginPath();
			ctx.moveTo(x - 4, yOffset + 42);
			ctx.lineTo(x - 4, yOffset + 52);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(x + 4, yOffset + 42);
			ctx.lineTo(x + 4, yOffset + 52);
			ctx.stroke();
			// Body
			ctx.fillStyle = shirtColor;
			ctx.fillRect(x - 8, yOffset + 18, 16, 24);
			// Left arm
			ctx.save();
			ctx.translate(x - 8, yOffset + 24);
			ctx.rotate(-armAngle);
			ctx.strokeStyle = '#fcd299';
			ctx.lineWidth = 5;
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(-14, -14);
			ctx.stroke();
			ctx.restore();
			// Right arm
			ctx.save();
			ctx.translate(x + 8, yOffset + 24);
			ctx.rotate(armAngle);
			ctx.strokeStyle = '#fcd299';
			ctx.lineWidth = 5;
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(14, -14);
			ctx.stroke();
			ctx.restore();
			// Head (draw last, in front)
			ctx.beginPath();
			ctx.arc(x, yOffset + 10, 10, 0, 2 * Math.PI);
			ctx.fillStyle = '#fcd299';
			ctx.fill();
			ctx.strokeStyle = '#333';
			ctx.stroke();
		}
	}

	// ...existing code for court and gameplay...
	// Draw court (floor)
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
	// Key/paint areas (both sides, facing center)
	// Left key (open to right)
	ctx.beginPath();
	ctx.moveTo(60, canvas.height - 180);
	ctx.lineTo(120, canvas.height - 180);
	ctx.lineTo(120, canvas.height - 60);
	ctx.lineTo(60, canvas.height - 60);
	ctx.closePath();
	ctx.stroke();
	// Right key (open to left)
	ctx.beginPath();
	ctx.moveTo(canvas.width - 120, canvas.height - 180);
	ctx.lineTo(canvas.width - 60, canvas.height - 180);
	ctx.lineTo(canvas.width - 60, canvas.height - 60);
	ctx.lineTo(canvas.width - 120, canvas.height - 60);
	ctx.closePath();
	ctx.stroke();
	// Free throw arcs (facing center)
	ctx.beginPath();
	ctx.arc(120, canvas.height - 120, 30, Math.PI * 1.5, Math.PI * 0.5, false);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(canvas.width - 120, canvas.height - 120, 30, Math.PI * 0.5, Math.PI * 1.5, false);
	ctx.stroke();
	// Center circle
	ctx.beginPath();
	ctx.arc(canvas.width / 2, canvas.height - 120, 50, 0, 2 * Math.PI);
	ctx.stroke();
	// Three-point arcs (facing center)
	ctx.beginPath();
	ctx.arc(120, canvas.height - 120, 90, Math.PI * 1.2, Math.PI * 1.8, false);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(canvas.width - 120, canvas.height - 120, 90, Math.PI * -0.8, Math.PI * -0.2, false);
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
		if (gameMode === 'training' && idx === 1) return; // Hide player 2 in training
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
