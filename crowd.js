// Crowd rendering functions
function drawCrowd(ctx, canvas, hoops) {
	const courtY = 320 + 64;
	const crowdSpacingX = 50;
	const crowdSpacingY = 28;
	const backboardTop = hoops[0].y;
	const crowdRows = Math.floor((backboardTop - 40) / crowdSpacingY);
	const crowdPerRow = Math.floor(canvas.width / crowdSpacingX);
	const t = Date.now() / 400;
	const hoopMargin = 0;
	for (let row = 0; row < crowdRows; row++) {
		const yOffset = 40 + row * crowdSpacingY;
		for (let i = 0; i < crowdPerRow; i++) {
			const x = i * crowdSpacingX + 32 + (row % 2) * (crowdSpacingX / 2);
			if (x < hoopMargin || x > canvas.width - hoopMargin) continue;
			const move = ((i * 3 + row * 7) % 3 === 0);
			const armAngle = move ? Math.sin(t + i + row) * 0.7 : 0;
			const shirtColors = ['#1976d2', '#c62828', '#388e3c', '#fbc02d', '#6d4c41', '#7b1fa2', '#ff9800', '#0097a7', '#e91e63', '#8bc34a'];
			const shirtColor = shirtColors[(i * 7 + row * 13) % shirtColors.length];
			const skinColors = ['#fcd299', '#e0ac69', '#c68642', '#8d5524', '#a0522d', '#d2b48c'];
			const skinColor = skinColors[(i * 5 + row * 11) % skinColors.length];
			ctx.fillStyle = '#444';
			ctx.fillRect(x - 10, yOffset + 38, 20, 10);
			ctx.strokeStyle = '#222';
			ctx.lineWidth = 2;
			ctx.strokeRect(x - 10, yOffset + 38, 20, 10);
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
			ctx.fillStyle = shirtColor;
			ctx.fillRect(x - 8, yOffset + 18, 16, 24);
			ctx.save();
			ctx.translate(x - 8, yOffset + 24);
			ctx.rotate(-armAngle);
			ctx.strokeStyle = skinColor;
			ctx.lineWidth = 5;
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(-14, -14);
			ctx.stroke();
			ctx.restore();
			ctx.save();
			ctx.translate(x + 8, yOffset + 24);
			ctx.rotate(armAngle);
			ctx.strokeStyle = skinColor;
			ctx.lineWidth = 5;
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(14, -14);
			ctx.stroke();
			ctx.restore();
			const headY = yOffset + 10 + (move ? Math.sin(Date.now() / 400 + i + row) * 2 : 0);
			ctx.beginPath();
			ctx.arc(x, headY, 10, 0, 2 * Math.PI);
			ctx.fillStyle = skinColor;
			ctx.fill();
			ctx.save();
			ctx.beginPath();
			ctx.arc(x - 4, headY - 2, 1.2, 0, 2 * Math.PI);
			ctx.arc(x + 4, headY - 2, 1.2, 0, 2 * Math.PI);
			ctx.fillStyle = '#222';
			ctx.fill();
			ctx.beginPath();
			ctx.arc(x, headY + 2, 4, Math.PI * 0.15, Math.PI * 0.85);
			ctx.strokeStyle = '#222';
			ctx.lineWidth = 1.2;
			ctx.stroke();
			ctx.restore();
		}
	}
}
