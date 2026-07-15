import { useState, useRef, useCallback, useEffect } from "react";
import type { SketchData, SketchLayer, SketchElement } from "../../../types/board.types";
import CanvasToolbar, { type Tool } from "./CanvasToolbar";
import CanvasLayerPanel from "./CanvasLayerPanel";

interface Props {
	data?: SketchData;
	onSave: (data: SketchData) => void;
}

function uid() {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createDefaultLayer(): SketchLayer {
	return { id: uid(), name: "Layer 1", visible: true, locked: false, elements: [] };
}

export default function SketchCanvas({ data, onSave }: Props) {
	const [sketch, setSketch] = useState<SketchData>(data ?? { width: 800, height: 500, layers: [createDefaultLayer()] });
	const [tool, setTool] = useState<Tool>("pen");
	const [color, setColor] = useState("#ffffff");
	const [strokeWidth, setStrokeWidth] = useState(4);
	const [fontSize, setFontSize] = useState(24);
	const [activeLayerId, setActiveLayerId] = useState(sketch.layers[0]?.id ?? "");
	const [history, setHistory] = useState<SketchData[]>([sketch]);
	const [historyIdx, setHistoryIdx] = useState(0);
	const [fullscreen, setFullscreen] = useState(false);
	const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });

	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [drawing, setDrawing] = useState(false);
	const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
	const [currentPoints, setCurrentPoints] = useState<number[][]>([]);
	const [previewElement, setPreviewElement] = useState<SketchElement | null>(null);

	// ResizeObserver for responsive canvas
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				if (width > 0 && height > 0) {
					setCanvasSize({ width: Math.floor(width), height: Math.floor(height) });
				}
			}
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, [fullscreen]);

	// Push to history
	const pushHistory = useCallback((newSketch: SketchData) => {
		setHistory((prev) => {
			const trimmed = prev.slice(0, historyIdx + 1);
			return [...trimmed, newSketch];
		});
		setHistoryIdx((prev) => prev + 1);
	}, [historyIdx]);

	const undo = useCallback(() => {
		if (historyIdx <= 0) return;
		setHistoryIdx((prev) => prev - 1);
		setSketch(history[historyIdx - 1]);
	}, [historyIdx, history]);

	const redo = useCallback(() => {
		if (historyIdx >= history.length - 1) return;
		setHistoryIdx((prev) => prev + 1);
		setSketch(history[historyIdx + 1]);
	}, [historyIdx, history]);

	// Draw all layers to canvas
	const renderCanvas = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Update canvas internal resolution to match display
		if (canvas.width !== canvasSize.width || canvas.height !== canvasSize.height) {
			canvas.width = canvasSize.width;
			canvas.height = canvasSize.height;
		}

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Draw checkerboard background
		const size = 10;
		for (let y = 0; y < canvas.height; y += size) {
			for (let x = 0; x < canvas.width; x += size) {
				ctx.fillStyle = (Math.floor(x / size) + Math.floor(y / size)) % 2 === 0 ? "#1a1d2e" : "#1e2235";
				ctx.fillRect(x, y, size, size);
			}
		}

		sketch.layers.forEach((layer) => {
			if (!layer.visible) return;
			layer.elements.forEach((el) => drawElement(ctx, el));
		});

		if (previewElement) {
			drawElement(ctx, previewElement);
		}
	}, [sketch, previewElement, canvasSize]);

	useEffect(() => {
		renderCanvas();
	}, [renderCanvas]);

	// Auto-save on sketch change
	useEffect(() => {
		if (historyIdx === history.length - 1) {
			onSave(sketch);
		}
	}, [sketch, historyIdx, history.length, onSave]);

	function drawElement(ctx: CanvasRenderingContext2D, el: SketchElement) {
		ctx.strokeStyle = el.stroke ?? color;
		ctx.fillStyle = el.fill ?? "transparent";
		ctx.lineWidth = el.strokeWidth ?? strokeWidth;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		switch (el.type) {
			case "pen":
				if (el.points && el.points.length > 1) {
					ctx.beginPath();
					ctx.moveTo(el.points[0][0], el.points[0][1]);
					for (let i = 1; i < el.points.length; i++) {
						ctx.lineTo(el.points[i][0], el.points[i][1]);
					}
					ctx.stroke();
				}
				break;
			case "rect":
				if (el.x != null && el.y != null && el.width != null && el.height != null) {
					if (el.fill && el.fill !== "transparent") ctx.fillRect(el.x, el.y, el.width, el.height);
					ctx.strokeRect(el.x, el.y, el.width, el.height);
				}
				break;
			case "circle":
				if (el.x != null && el.y != null && el.width != null && el.height != null) {
					ctx.beginPath();
					ctx.ellipse(el.x + el.width / 2, el.y + el.height / 2, Math.abs(el.width / 2), Math.abs(el.height / 2), 0, 0, Math.PI * 2);
					if (el.fill && el.fill !== "transparent") ctx.fill();
					ctx.stroke();
				}
				break;
			case "line":
				if (el.x != null && el.y != null && el.x2 != null && el.y2 != null) {
					ctx.beginPath();
					ctx.moveTo(el.x, el.y);
					ctx.lineTo(el.x2, el.y2);
					ctx.stroke();
				}
				break;
			case "arrow":
				if (el.x != null && el.y != null && el.x2 != null && el.y2 != null) {
					const angle = Math.atan2(el.y2 - el.y, el.x2 - el.x);
					const headLen = 12;
					ctx.beginPath();
					ctx.moveTo(el.x, el.y);
					ctx.lineTo(el.x2, el.y2);
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(el.x2, el.y2);
					ctx.lineTo(el.x2 - headLen * Math.cos(angle - Math.PI / 6), el.y2 - headLen * Math.sin(angle - Math.PI / 6));
					ctx.moveTo(el.x2, el.y2);
					ctx.lineTo(el.x2 - headLen * Math.cos(angle + Math.PI / 6), el.y2 - headLen * Math.sin(angle + Math.PI / 6));
					ctx.stroke();
				}
				break;
			case "text":
				if (el.text && el.x != null && el.y != null) {
					ctx.fillStyle = el.stroke ?? color;
					ctx.font = `${el.fontSize ?? 24}px sans-serif`;
					ctx.fillText(el.text, el.x, el.y);
				}
				break;
			case "fill":
				if (el.points && el.points.length > 0) {
					ctx.fillStyle = el.fill ?? color;
					ctx.beginPath();
					ctx.arc(el.points[0][0], el.points[0][1], el.strokeWidth ?? 4, 0, Math.PI * 2);
					ctx.fill();
				}
				break;
		}
	}

	function getPos(e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } {
		const rect = canvasRef.current!.getBoundingClientRect();
		return { x: e.clientX - rect.left, y: e.clientY - rect.top };
	}

	function getActiveLayer(): SketchLayer | undefined {
		return sketch.layers.find((l) => l.id === activeLayerId);
	}

	function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
		const layer = getActiveLayer();
		if (!layer || layer.locked) return;
		const pos = getPos(e);
		setDrawing(true);
		setStartPos(pos);

		if (tool === "pen" || tool === "eraser") {
			setCurrentPoints([[pos.x, pos.y]]);
		} else if (tool === "text") {
			const text = prompt("Enter text:");
			if (text) {
				const el: SketchElement = { id: uid(), type: "text", x: pos.x, y: pos.y, text, stroke: color, fontSize };
				const newSketch = { ...sketch, layers: sketch.layers.map((l) => l.id === activeLayerId ? { ...l, elements: [...l.elements, el] } : l) };
				setSketch(newSketch);
				pushHistory(newSketch);
			}
			setDrawing(false);
		} else if (tool === "fill") {
			const el: SketchElement = { id: uid(), type: "fill", points: [[pos.x, pos.y]], fill: color, strokeWidth: 20 };
			const newSketch = { ...sketch, layers: sketch.layers.map((l) => l.id === activeLayerId ? { ...l, elements: [...l.elements, el] } : l) };
			setSketch(newSketch);
			pushHistory(newSketch);
			setDrawing(false);
		}
	}

	function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
		if (!drawing || !startPos) return;
		const pos = getPos(e);

		if (tool === "pen" || tool === "eraser") {
			setCurrentPoints((prev) => [...prev, [pos.x, pos.y]]);
			setPreviewElement({
				id: "preview", type: "pen", points: [...currentPoints, [pos.x, pos.y]],
				stroke: tool === "eraser" ? "#1a1d2e" : color,
				strokeWidth: tool === "eraser" ? strokeWidth * 3 : strokeWidth,
			});
		} else if (["rect", "circle"].includes(tool)) {
			setPreviewElement({
				id: "preview", type: tool as "rect" | "circle",
				x: Math.min(startPos.x, pos.x), y: Math.min(startPos.y, pos.y),
				width: Math.abs(pos.x - startPos.x), height: Math.abs(pos.y - startPos.y),
				stroke: color, strokeWidth,
			});
		} else if (tool === "line" || tool === "arrow") {
			setPreviewElement({
				id: "preview", type: tool as "line" | "arrow",
				x: startPos.x, y: startPos.y, x2: pos.x, y2: pos.y,
				stroke: color, strokeWidth,
			});
		}
	}

	function handleMouseUp() {
		if (!drawing || !startPos) return;
		setDrawing(false);
		setPreviewElement(null);

		const layer = getActiveLayer();
		if (!layer || layer.locked) return;

		let el: SketchElement | null = null;

		if (tool === "pen" || tool === "eraser") {
			if (currentPoints.length > 1) {
				el = {
					id: uid(), type: "pen", points: currentPoints,
					stroke: tool === "eraser" ? "#1a1d2e" : color,
					strokeWidth: tool === "eraser" ? strokeWidth * 3 : strokeWidth,
				};
			}
			setCurrentPoints([]);
		} else if (["rect", "circle"].includes(tool)) {
			const preview = previewElement;
			if (preview && preview.width && preview.height) el = { ...preview, id: uid() };
		} else if (tool === "line" || tool === "arrow") {
			const preview = previewElement;
			if (preview && preview.x2 != null && preview.y2 != null) el = { ...preview, id: uid() };
		}

		if (el) {
			const newSketch = { ...sketch, layers: sketch.layers.map((l) => l.id === activeLayerId ? { ...l, elements: [...l.elements, el!] } : l) };
			setSketch(newSketch);
			pushHistory(newSketch);
		}
		setStartPos(null);
	}

	// Layer operations
	function addLayer() {
		const newLayer = createDefaultLayer();
		const newSketch = { ...sketch, layers: [...sketch.layers, newLayer] };
		setSketch(newSketch);
		setActiveLayerId(newLayer.id);
		pushHistory(newSketch);
	}

	function removeLayer(id: string) {
		if (sketch.layers.length <= 1) return;
		const newSketch = { ...sketch, layers: sketch.layers.filter((l) => l.id !== id) };
		setSketch(newSketch);
		if (activeLayerId === id) setActiveLayerId(newSketch.layers[0].id);
		pushHistory(newSketch);
	}

	function toggleVisibility(id: string) {
		setSketch({ ...sketch, layers: sketch.layers.map((l) => l.id === id ? { ...l, visible: !l.visible } : l) });
	}

	function toggleLock(id: string) {
		setSketch({ ...sketch, layers: sketch.layers.map((l) => l.id === id ? { ...l, locked: !l.locked } : l) });
	}

	function renameLayer(id: string, name: string) {
		setSketch({ ...sketch, layers: sketch.layers.map((l) => l.id === id ? { ...l, name } : l) });
	}

	function reorderLayer(from: number, to: number) {
		if (to < 0 || to >= sketch.layers.length) return;
		const newLayers = [...sketch.layers];
		const [moved] = newLayers.splice(from, 1);
		newLayers.splice(to, 0, moved);
		const newSketch = { ...sketch, layers: newLayers };
		setSketch(newSketch);
		pushHistory(newSketch);
	}

	function handleExport() {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const link = document.createElement("a");
		link.download = "sketch.png";
		link.href = canvas.toDataURL("image/png");
		link.click();
	}

	function handleClear() {
		const cleared: SketchData = {
			width: canvasSize.width,
			height: canvasSize.height,
			layers: [{ id: uid(), name: "Layer 1", visible: true, locked: false, elements: [] }],
		};
		setSketch(cleared);
		setActiveLayerId(cleared.layers[0].id);
		pushHistory(cleared);
	}

	if (fullscreen) {
		return (
			<div className="fixed inset-0 z-50 bg-[#0f1117] flex flex-col">
				{/* Toolbar */}
				<CanvasToolbar
					tool={tool} onToolChange={setTool}
					color={color} onColorChange={setColor}
					strokeWidth={strokeWidth} onStrokeWidthChange={setStrokeWidth}
					fontSize={fontSize} onFontSizeChange={setFontSize}
					onUndo={undo} onRedo={redo}
					canUndo={historyIdx > 0} canRedo={historyIdx < history.length - 1}
					onExport={handleExport}
					onClear={handleClear}
				/>

				{/* Canvas — fills remaining space */}
				<div ref={containerRef} className="flex-1 relative m-2 rounded-xl overflow-hidden">
					<canvas
						ref={canvasRef}
						width={canvasSize.width}
						height={canvasSize.height}
						className="cursor-crosshair w-full h-full"
						onMouseDown={handleMouseDown}
						onMouseMove={handleMouseMove}
						onMouseUp={handleMouseUp}
						onMouseLeave={handleMouseUp}
					/>
					{/* Floating layers panel */}
					<CanvasLayerPanel
						layers={sketch.layers}
						activeLayerId={activeLayerId}
						floating
						onActiveLayerChange={setActiveLayerId}
						onToggleVisibility={toggleVisibility}
						onToggleLock={toggleLock}
						onAddLayer={addLayer}
						onRemoveLayer={removeLayer}
						onRenameLayer={renameLayer}
						onReorder={reorderLayer}
					/>
				</div>

				{/* Exit fullscreen */}
				<div className="p-2 flex justify-center">
					<button
						type="button"
						onClick={() => setFullscreen(false)}
						className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white/80 transition-colors"
					>
						Exit Fullscreen (Esc)
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full gap-2">
			{/* Toolbar */}
			<CanvasToolbar
				tool={tool} onToolChange={setTool}
				color={color} onColorChange={setColor}
				strokeWidth={strokeWidth} onStrokeWidthChange={setStrokeWidth}
				fontSize={fontSize} onFontSizeChange={setFontSize}
				onUndo={undo} onRedo={redo}
				canUndo={historyIdx > 0} canRedo={historyIdx < history.length - 1}
				onExport={handleExport}
				onClear={handleClear}
			/>

			{/* Canvas + Layers */}
			<div className="flex-1 flex gap-2 min-h-0">
				{/* Canvas — fills available space */}
				<div ref={containerRef} className="flex-1 rounded-xl bg-[#1a1d2e] border border-white/[0.06] overflow-hidden relative">
					<canvas
						ref={canvasRef}
						width={canvasSize.width}
						height={canvasSize.height}
						className="cursor-crosshair w-full h-full"
						onMouseDown={handleMouseDown}
						onMouseMove={handleMouseMove}
						onMouseUp={handleMouseUp}
						onMouseLeave={handleMouseUp}
					/>
					{/* Fullscreen button */}
					<button
						type="button"
						onClick={() => setFullscreen(true)}
						className="absolute top-2 right-2 z-10 w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.1] transition-all"
						title="Fullscreen"
					>
						<svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
							<path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
					</button>
				</div>

				{/* Layers panel */}
				<CanvasLayerPanel
					layers={sketch.layers}
					activeLayerId={activeLayerId}
					onActiveLayerChange={setActiveLayerId}
					onToggleVisibility={toggleVisibility}
					onToggleLock={toggleLock}
					onAddLayer={addLayer}
					onRemoveLayer={removeLayer}
					onRenameLayer={renameLayer}
					onReorder={reorderLayer}
				/>
			</div>
		</div>
	);
}