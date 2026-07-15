import { useEffect, useRef } from "react";

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	color: string;
	size: number;
	rotation: number;
	rotationSpeed: number;
	opacity: number;
	gravity: number;
}

interface Props {
	colors?: string[];
	duration?: number;
	particleCount?: number;
	onComplete?: () => void;
}

const DEFAULT_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#3b82f6"];

export default function Confetti({
	colors = DEFAULT_COLORS,
	duration = 1500,
	particleCount = 60,
	onComplete,
}: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		const particles: Particle[] = [];
		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;

		for (let i = 0; i < particleCount; i++) {
			const angle = (Math.PI * 2 * i) / particleCount;
			const speed = 4 + Math.random() * 8;
			particles.push({
				x: centerX,
				y: centerY,
				vx: Math.cos(angle) * speed * (0.5 + Math.random()),
				vy: Math.sin(angle) * speed * (0.5 + Math.random()) - 3,
				color: colors[Math.floor(Math.random() * colors.length)],
				size: 3 + Math.random() * 5,
				rotation: Math.random() * 360,
				rotationSpeed: (Math.random() - 0.5) * 10,
				opacity: 1,
				gravity: 0.15 + Math.random() * 0.1,
			});
		}

		let start = performance.now();
		let frame: number;

		function animate(now: number) {
			const elapsed = now - start;
			const progress = Math.min(elapsed / duration, 1);

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			for (const p of particles) {
				p.x += p.vx;
				p.y += p.vy;
				p.vy += p.gravity;
				p.vx *= 0.99;
				p.rotation += p.rotationSpeed;
				p.opacity = 1 - progress;

				ctx.save();
				ctx.translate(p.x, p.y);
				ctx.rotate((p.rotation * Math.PI) / 180);
				ctx.globalAlpha = p.opacity;
				ctx.fillStyle = p.color;
				ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
				ctx.restore();
			}

			if (progress < 1) {
				frame = requestAnimationFrame(animate);
			} else {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				onComplete?.();
			}
		}

		frame = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(frame);
	}, [colors, duration, particleCount, onComplete]);

	return (
		<canvas
			ref={canvasRef}
			className="fixed inset-0 z-[100] pointer-events-none"
			style={{ width: "100vw", height: "100vh" }}
		/>
	);
}