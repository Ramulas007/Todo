import { useState, useCallback, useRef, useEffect } from "react";
import type { MindMapData, MindMapNode, MindMapEdge } from "../../../types/board.types";
import MindMapNodeComponent, { type HandleSide } from "./MindMapNode";

interface Props {
	data?: MindMapData;
	onSave: (data: MindMapData) => void;
}

function uid() {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

function createDefaultData(): MindMapData {
	return {
		nodes: [{ id: uid(), x: 400, y: 250, text: "Main Idea", color: "#6366f1" }],
		edges: [],
	};
}

// ─── Auto Layout ────────────────────────────────────────────────────
function layoutTree(nodes: MindMapNode[], edges: MindMapEdge[]): MindMapNode[] {
	if (nodes.length === 0) return nodes;
	const connCount = new Map<string, number>();
	nodes.forEach((n) => connCount.set(n.id, 0));
	edges.forEach((e) => {
		connCount.set(e.from, (connCount.get(e.from) ?? 0) + 1);
		connCount.set(e.to, (connCount.get(e.to) ?? 0) + 1);
	});
	const rootId = [...connCount.entries()].sort((a, b) => a[1] - b[1])[0][0];

	const adjacency = new Map<string, string[]>();
	edges.forEach((e) => {
		if (!adjacency.has(e.from)) adjacency.set(e.from, []);
		if (!adjacency.has(e.to)) adjacency.set(e.to, []);
		adjacency.get(e.from)!.push(e.to);
		adjacency.get(e.to)!.push(e.from);
	});

	const visited = new Set<string>();
	const layers: string[][] = [];
	const queue = [rootId];
	visited.add(rootId);

	while (queue.length > 0) {
		const layer = [...queue];
		layers.push(layer);
		const next: string[] = [];
		for (const id of layer) {
			for (const neighbor of adjacency.get(id) ?? []) {
				if (!visited.has(neighbor)) { visited.add(neighbor); next.push(neighbor); }
			}
		}
		queue.length = 0;
		queue.push(...next);
	}

	const unvisited = nodes.filter((n) => !visited.has(n.id));
	if (unvisited.length > 0) layers.push(unvisited.map((n) => n.id));

	const layerGap = 110, nodeGap = 160, startY = 60;
	return nodes.map((n) => {
		const layerIdx = layers.findIndex((l) => l.includes(n.id));
		const posInLayer = layers[layerIdx]?.indexOf(n.id) ?? 0;
		const layerSize = layers[layerIdx]?.length ?? 1;
		return { ...n, x: 400 + (posInLayer - (layerSize - 1) / 2) * nodeGap, y: startY + layerIdx * layerGap };
	});
}

function layoutCircle(nodes: MindMapNode[]): MindMapNode[] {
	if (nodes.length <= 1) return nodes;
	const cx = 450, cy = 280, radius = Math.min(220, nodes.length * 35);
	return nodes.map((n, i) => {
		const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
		return { ...n, x: cx + radius * Math.cos(angle) - 50, y: cy + radius * Math.sin(angle) - 15 };
	});
}

function layoutGrid(nodes: MindMapNode[]): MindMapNode[] {
	if (nodes.length === 0) return nodes;
	const cols = Math.ceil(Math.sqrt(nodes.length));
	const gapX = 180, gapY = 90, startX = 80, startY = 50;
	return nodes.map((n, i) => ({
		...n,
		x: startX + (i % cols) * gapX,
		y: startY + Math.floor(i / cols) * gapY,
	}));
}

function layoutForce(nodes: MindMapNode[], edges: MindMapEdge[]): MindMapNode[] {
	if (nodes.length <= 1) return nodes;
	const positions = nodes.map((n) => ({ ...n }));
	const idIndex = new Map(positions.map((n, i) => [n.id, i]));

	for (let iter = 0; iter < 60; iter++) {
		const forces = positions.map(() => ({ fx: 0, fy: 0 }));

		for (let i = 0; i < positions.length; i++) {
			for (let j = i + 1; j < positions.length; j++) {
				const dx = positions[j].x - positions[i].x;
				const dy = positions[j].y - positions[i].y;
				const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
				const f = 4000 / (dist * dist);
				const fx = (dx / dist) * f;
				const fy = (dy / dist) * f;
				forces[i].fx -= fx; forces[i].fy -= fy;
				forces[j].fx += fx; forces[j].fy += fy;
			}
		}

		edges.forEach((e) => {
			const i = idIndex.get(e.from);
			const j = idIndex.get(e.to);
			if (i === undefined || j === undefined) return;
			const dx = positions[j].x - positions[i].x;
			const dy = positions[j].y - positions[i].y;
			const f = 0.003 * Math.sqrt(dx * dx + dy * dy);
			forces[i].fx += dx * f; forces[i].fy += dy * f;
			forces[j].fx -= dx * f; forces[j].fy -= dy * f;
		});

		for (let i = 0; i < positions.length; i++) {
			positions[i].x += forces[i].fx * 0.85;
			positions[i].y += forces[i].fy * 0.85;
			positions[i].x = Math.max(30, Math.min(870, positions[i].x));
			positions[i].y = Math.max(30, Math.min(520, positions[i].y));
		}
	}
	return positions;
}

// ─── History for Undo/Redo ──────────────────────────────────────────
const MAX_HISTORY = 50;

export default function MindMap({ data, onSave }: Props) {
	const [map, setMap] = useState<MindMapData>(data ?? createDefaultData);
	const [history, setHistory] = useState<MindMapData[]>([data ?? createDefaultData]);
	const [historyIdx, setHistoryIdx] = useState(0);
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

	// Connecting
	const [isConnecting, setIsConnecting] = useState(false);
	const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
	const [connectingFromSide, setConnectingFromSide] = useState<HandleSide>("right");
	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

	// Pan + Zoom
	const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
	const [viewScale, setViewScale] = useState(1);
	const [panning, setPanning] = useState(false);
	const panStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
	const containerRef = useRef<HTMLDivElement>(null);

	// Edge label editing
	const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
	const [edgeLabel, setEdgeLabel] = useState("");

	// Save with history
	const save = useCallback((newMap: MindMapData) => {
		setMap(newMap);
		onSave(newMap);
		setHistory((prev) => {
			const trimmed = prev.slice(0, historyIdx + 1);
			const next = [...trimmed, newMap];
			if (next.length > MAX_HISTORY) next.shift();
			return next;
		});
		setHistoryIdx((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
	}, [onSave, historyIdx]);

	const undo = useCallback(() => {
		if (historyIdx <= 0) return;
		const idx = historyIdx - 1;
		setHistoryIdx(idx);
		setMap(history[idx]);
		onSave(history[idx]);
	}, [historyIdx, history, onSave]);

	const redo = useCallback(() => {
		if (historyIdx >= history.length - 1) return;
		const idx = historyIdx + 1;
		setHistoryIdx(idx);
		setMap(history[idx]);
		onSave(history[idx]);
	}, [historyIdx, history, onSave]);

	// ─── Keyboard shortcuts ────────────────────────────────────
	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			const target = e.target as HTMLElement;
			if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

			if (e.key === "Escape") {
				setSelectedNodeId(null);
				setSelectedEdgeId(null);
				if (isConnecting) { setIsConnecting(false); setConnectingFrom(null); }
			}
			if ((e.key === "Delete" || e.key === "Backspace") && selectedEdgeId) {
				e.preventDefault();
				save({ ...map, edges: map.edges.filter((ed) => ed.id !== selectedEdgeId) });
				setSelectedEdgeId(null);
			}
			if (e.ctrlKey && e.key === "z") { e.preventDefault(); undo(); }
			if (e.ctrlKey && e.key === "y") { e.preventDefault(); redo(); }
			if (e.key === "Tab") {
				e.preventDefault();
				const color = COLORS[map.nodes.length % COLORS.length];
				const newNode: MindMapNode = {
					id: uid(),
					x: 300 + Math.random() * 300,
					y: 200 + Math.random() * 200,
					text: "New idea",
					color,
				};
				save({ ...map, nodes: [...map.nodes, newNode] });
			}
		}
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [map, selectedEdgeId, isConnecting, save, undo, redo]);

	// ─── Pan ──────────────────────────────────────────────────
	function handleCanvasMouseDown(e: React.MouseEvent) {
		if (e.button !== 0) return;
		if ((e.target as HTMLElement).closest("[data-node]")) return;
		setPanning(true);
		setSelectedNodeId(null);
		setSelectedEdgeId(null);
		panStart.current = { x: e.clientX, y: e.clientY, ox: viewOffset.x, oy: viewOffset.y };
	}

	useEffect(() => {
		if (!panning) return;
		function handleMove(e: MouseEvent) {
			setViewOffset({
				x: panStart.current.ox + (e.clientX - panStart.current.x),
				y: panStart.current.oy + (e.clientY - panStart.current.y),
			});
		}
		function handleUp() { setPanning(false); }
		window.addEventListener("mousemove", handleMove);
		window.addEventListener("mouseup", handleUp);
		return () => { window.removeEventListener("mousemove", handleMove); window.removeEventListener("mouseup", handleUp); };
	}, [panning]);

	// ─── Zoom ──────────────────────────────────────────────────
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		function handleWheel(e: WheelEvent) {
			e.preventDefault();
			setViewScale((prev) => Math.min(2.5, Math.max(0.2, prev - e.deltaY * 0.001)));
		}
		el.addEventListener("wheel", handleWheel, { passive: false });
		return () => el.removeEventListener("wheel", handleWheel);
	}, []);

	// ─── Mouse tracking ───────────────────────────────────────
	useEffect(() => {
		if (!isConnecting) return;
		function handleMove(e: MouseEvent) {
			const rect = containerRef.current?.getBoundingClientRect();
			if (!rect) return;
			setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
		}
		window.addEventListener("mousemove", handleMove);
		return () => window.removeEventListener("mousemove", handleMove);
	}, [isConnecting]);

	// ─── Fit to view ──────────────────────────────────────────
	function fitToView() {
		if (map.nodes.length === 0) return;
		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect) return;
		const minX = Math.min(...map.nodes.map((n) => n.x));
		const maxX = Math.max(...map.nodes.map((n) => n.x + 120));
		const minY = Math.min(...map.nodes.map((n) => n.y));
		const maxY = Math.max(...map.nodes.map((n) => n.y + 40));
		const contentW = maxX - minX + 80;
		const contentH = maxY - minY + 80;
		const scaleX = rect.width / contentW;
		const scaleY = rect.height / contentH;
		const scale = Math.min(scaleX, scaleY, 1.5);
		setViewScale(scale);
		setViewOffset({
			x: (rect.width - contentW * scale) / 2 - minX * scale + 40,
			y: (rect.height - contentH * scale) / 2 - minY * scale + 40,
		});
	}

	// ─── Node operations ──────────────────────────────────────
	function handleDoubleClick(e: React.MouseEvent) {
		if (isConnecting || panning) return;
		if ((e.target as HTMLElement).closest("[data-node]")) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const x = (e.clientX - rect.left - viewOffset.x) / viewScale;
		const y = (e.clientY - rect.top - viewOffset.y) / viewScale;
		const color = COLORS[map.nodes.length % COLORS.length];
		save({ ...map, nodes: [...map.nodes, { id: uid(), x, y, text: "New idea", color }] });
	}

	function handleNodeMove(id: string, x: number, y: number) {
		setMap({ ...map, nodes: map.nodes.map((n) => n.id === id ? { ...n, x, y } : n) });
	}

	function handleNodeMoveCommit(id: string, x: number, y: number) {
		save({ ...map, nodes: map.nodes.map((n) => n.id === id ? { ...n, x, y } : n) });
	}

	function handleNodeEdit(id: string, text: string) {
		save({ ...map, nodes: map.nodes.map((n) => n.id === id ? { ...n, text } : n) });
	}

	function handleNodeDelete(id: string) {
		save({
			...map,
			nodes: map.nodes.filter((n) => n.id !== id),
			edges: map.edges.filter((e) => e.from !== id && e.to !== id),
		});
		if (selectedNodeId === id) setSelectedNodeId(null);
	}

	function handleNodeSelect(id: string) {
		setSelectedNodeId(id);
		setSelectedEdgeId(null);
	}

	function handleNodeColorCycle(id: string) {
		save({
			...map,
			nodes: map.nodes.map((n) => {
				if (n.id !== id) return n;
				const idx = COLORS.indexOf(n.color ?? "#6366f1");
				return { ...n, color: COLORS[(idx + 1) % COLORS.length] };
			}),
		});
	}

	// ─── Connection ────────────────────────────────────────────
	function handleConnectStart(id: string, side: HandleSide) {
		setIsConnecting(true);
		setConnectingFrom(id);
		setConnectingFromSide(side);
	}

	function handleConnectEnd(id: string) {
		if (connectingFrom && connectingFrom !== id) {
			const exists = map.edges.some(
				(e) => (e.from === connectingFrom && e.to === id) || (e.from === id && e.to === connectingFrom)
			);
			if (!exists) {
				const newEdge: MindMapEdge = { id: uid(), from: connectingFrom, to: id };
				save({ ...map, edges: [...map.edges, newEdge] });
			}
		}
		setIsConnecting(false);
		setConnectingFrom(null);
	}

	// ─── Edge operations ──────────────────────────────────────
	function handleEdgeClick(edgeId: string, e: React.MouseEvent) {
		e.stopPropagation();
		setSelectedEdgeId(edgeId);
		setSelectedNodeId(null);
	}

	function handleEdgeDoubleClick(edgeId: string) {
		const edge = map.edges.find((e) => e.id === edgeId);
		if (!edge) return;
		setEditingEdgeId(edgeId);
		setEdgeLabel(edge.label ?? "");
	}

	function saveEdgeLabel() {
		if (!editingEdgeId) return;
		save({
			...map,
			edges: map.edges.map((e) => e.id === editingEdgeId ? { ...e, label: edgeLabel || undefined } : e),
		});
		setEditingEdgeId(null);
		setEdgeLabel("");
	}

	// ─── Layout ───────────────────────────────────────────────
	function applyLayout(type: "tree" | "circle" | "grid" | "force") {
		let newNodes: MindMapNode[];
		switch (type) {
			case "tree": newNodes = layoutTree(map.nodes, map.edges); break;
			case "circle": newNodes = layoutCircle(map.nodes); break;
			case "grid": newNodes = layoutGrid(map.nodes); break;
			case "force": newNodes = layoutForce(map.nodes, map.edges); break;
		}
		save({ ...map, nodes: newNodes });
	}

	// ─── Helpers ───────────────────────────────────────────────
	function getNodeCenter(node: MindMapNode): { x: number; y: number } {
		return { x: node.x + 50, y: node.y + 18 };
	}

	function getHandlePos(node: MindMapNode, side: HandleSide): { x: number; y: number } {
		const cx = node.x + 50, cy = node.y + 18;
		switch (side) {
			case "top": return { x: cx, y: node.y };
			case "right": return { x: node.x + 100, y: cy };
			case "bottom": return { x: cx, y: node.y + 36 };
			case "left": return { x: node.x, y: cy };
		}
	}

	return (
		<div className="flex flex-col h-full gap-2">
			{/* Header */}
			<div className="flex items-center justify-between px-1">
				<div className="flex items-center gap-3">
					<p className="text-[10px] text-white/30">
						Double-click add · Drag move · Drag ○ connect · Tab new · Ctrl+Z undo
					</p>
					<span className="text-[10px] text-white/20">
						{map.nodes.length} nodes · {map.edges.length} edges
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					{isConnecting && (
						<button
							type="button"
							onClick={() => { setIsConnecting(false); setConnectingFrom(null); }}
							className="px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-[10px] text-red-400 hover:bg-red-500/30 transition-colors"
						>
							Cancel
						</button>
					)}

					{/* Undo/Redo */}
					<div className="flex gap-0.5">
						<button
							type="button"
							onClick={undo}
							disabled={historyIdx <= 0}
							className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/70 disabled:opacity-30 transition-all"
							title="Undo (Ctrl+Z)"
						>
							<svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
								<path d="M3 7h7a3 3 0 010 6H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
								<path d="M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</button>
						<button
							type="button"
							onClick={redo}
							disabled={historyIdx >= history.length - 1}
							className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/70 disabled:opacity-30 transition-all"
							title="Redo (Ctrl+Y)"
						>
							<svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
								<path d="M13 7H6a3 3 0 000 6h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
								<path d="M10 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</button>
					</div>

					{/* Layout */}
					<div className="flex gap-0.5 bg-white/[0.03] rounded-lg border border-white/[0.06] p-0.5">
						{(["tree", "circle", "grid", "force"] as const).map((type) => (
							<button
								key={type}
								type="button"
								onClick={() => applyLayout(type)}
								className="px-2 py-1 rounded-md text-[10px] text-white/40 hover:text-white/70 hover:bg-white/5 transition-all capitalize"
								title={`${type} layout`}
							>
								{type === "tree" ? "🌲" : type === "circle" ? "⭕" : type === "grid" ? "⊞" : "⚡"} {type}
							</button>
						))}
					</div>

					<button
						type="button"
						onClick={() => {
							const color = COLORS[map.nodes.length % COLORS.length];
							save({ ...map, nodes: [...map.nodes, { id: uid(), x: 300 + Math.random() * 200, y: 200 + Math.random() * 100, text: "New idea", color }] });
						}}
						className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/40 hover:text-white/60 transition-colors"
					>
						+ Node
					</button>

					<button
						type="button"
						onClick={fitToView}
						className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/40 hover:text-white/60 transition-colors"
						title="Fit to view"
					>
						⊞ Fit
					</button>

					<button
						type="button"
						onClick={() => save(createDefaultData())}
						className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/40 hover:text-white/60 transition-colors"
					>
						Clear
					</button>

					<span className="text-[10px] text-white/20 w-10 text-right">{Math.round(viewScale * 100)}%</span>
					<button
						type="button"
						onClick={() => { setViewScale(1); setViewOffset({ x: 0, y: 0 }); }}
						className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
					>
						Reset
					</button>
				</div>
			</div>

			{/* Canvas */}
			<div
				ref={containerRef}
				className="flex-1 rounded-xl overflow-hidden relative"
				style={{
					backgroundColor: "#14161f",
					backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
					backgroundSize: "20px 20px",
				}}
				onDoubleClick={handleDoubleClick}
				onMouseDown={handleCanvasMouseDown}
				onClick={() => {
					setSelectedNodeId(null);
					setSelectedEdgeId(null);
					if (isConnecting) { setIsConnecting(false); setConnectingFrom(null); }
				}}
			>
				{/* Transformed layer */}
				<div
					className="absolute inset-0"
					style={{
						transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${viewScale})`,
						transformOrigin: "0 0",
						transition: panning ? "none" : "transform 0.15s ease-out",
					}}
				>
					{/* SVG edges */}
					<svg className="absolute inset-0 w-[2000px] h-[2000px] pointer-events-none z-0">
						<defs>
							<marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
								<polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.25)" />
							</marker>
							<marker id="arrow-sel" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
								<polygon points="0 0, 8 3, 0 6" fill="#818cf8" />
							</marker>
							<marker id="arrow-hover" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
								<polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.45)" />
							</marker>
						</defs>

						{map.edges.map((edge) => {
							const fromNode = map.nodes.find((n) => n.id === edge.from);
							const toNode = map.nodes.find((n) => n.id === edge.to);
							if (!fromNode || !toNode) return null;

							const fc = getNodeCenter(fromNode);
							const tc = getNodeCenter(toNode);
							const dx = tc.x - fc.x;
							const dy = tc.y - fc.y;
							const dist = Math.sqrt(dx * dx + dy * dy);
							const tension = Math.min(dist * 0.3, 60);

							// Smart bezier: curve based on relative position
							const isHorizontal = Math.abs(dx) > Math.abs(dy);
							const cx1 = isHorizontal ? fc.x + tension * Math.sign(dx) : fc.x;
							const cy1 = isHorizontal ? fc.y : fc.y + tension * Math.sign(dy);
							const cx2 = isHorizontal ? tc.x - tension * Math.sign(dx) : tc.x;
							const cy2 = isHorizontal ? tc.y : tc.y - tension * Math.sign(dy);
							const path = `M ${fc.x} ${fc.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tc.x} ${tc.y}`;

							const isSelected = selectedEdgeId === edge.id;
							const mx = (fc.x + tc.x) / 2;
							const my = (fc.y + tc.y) / 2;

							return (
								<g key={edge.id}>
									{/* Hit area */}
									<path
										d={path}
										stroke="transparent"
										strokeWidth="14"
										fill="none"
										className="pointer-events-auto cursor-pointer"
										onClick={(e) => handleEdgeClick(edge.id, e)}
										onDoubleClick={(e) => { e.stopPropagation(); handleEdgeDoubleClick(edge.id); }}
									/>
									{/* Visible edge */}
									<path
										d={path}
										stroke={isSelected ? "#818cf8" : fromNode.color ? fromNode.color + "50" : "rgba(255,255,255,0.12)"}
										strokeWidth={isSelected ? 2.5 : 1.5}
										fill="none"
										strokeLinecap="round"
										markerEnd={isSelected ? "url(#arrow-sel)" : "url(#arrow)"}
										className="transition-colors pointer-events-auto cursor-pointer"
										onClick={(e) => handleEdgeClick(edge.id, e)}
										onDoubleClick={(e) => { e.stopPropagation(); handleEdgeDoubleClick(edge.id); }}
									/>
									{/* Label */}
									{edge.label && editingEdgeId !== edge.id && (
										<foreignObject x={mx - 40} y={my - 12} width="80" height="24" className="pointer-events-auto">
											<div
												className="text-center text-[10px] text-white/40 bg-[#14161f]/80 rounded px-1 truncate cursor-pointer hover:text-white/60"
												onClick={(e) => handleEdgeClick(edge.id, e)}
												onDoubleClick={(e) => { e.stopPropagation(); handleEdgeDoubleClick(edge.id); }}
											>
												{edge.label}
											</div>
										</foreignObject>
									)}
								</g>
							);
						})}

						{/* Temp connection line */}
						{isConnecting && connectingFrom && (
							(() => {
								const fromNode = map.nodes.find((n) => n.id === connectingFrom);
								if (!fromNode) return null;
								const start = getHandlePos(fromNode, connectingFromSide);
								const endX = (mousePos.x - viewOffset.x) / viewScale;
								const endY = (mousePos.y - viewOffset.y) / viewScale;
								return (
									<path
										d={`M ${start.x} ${start.y} L ${endX} ${endY}`}
										stroke="#818cf8"
										strokeWidth="2"
										strokeDasharray="6 4"
										fill="none"
										className="pointer-events-none opacity-80"
									/>
								);
							})()
						)}
					</svg>

					{/* Nodes */}
					{map.nodes.map((node) => (
						<MindMapNodeComponent
							key={node.id}
							node={node}
							selected={selectedNodeId === node.id}
							isConnecting={isConnecting}
							connectingFrom={connectingFrom}
							onMove={handleNodeMove}
							onEdit={handleNodeEdit}
							onDelete={handleNodeDelete}
							onConnectStart={handleConnectStart}
							onConnectEnd={handleConnectEnd}
							onSelect={handleNodeSelect}
							onColorCycle={handleNodeColorCycle}
						/>
					))}

					{/* Empty state */}
					{map.nodes.length === 0 && (
						<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
							<div className="text-center">
								<p className="text-lg text-white/15 mb-2">Your canvas is empty</p>
								<p className="text-xs text-white/10">Double-click anywhere to add your first idea</p>
								<p className="text-xs text-white/10 mt-1">or press Tab to add a node</p>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Edge label editor — inline modal */}
			{editingEdgeId && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={saveEdgeLabel} />
					<div className="relative bg-[#1a1d2e] border border-white/10 rounded-2xl p-5 shadow-2xl w-[340px]">
						<p className="text-xs text-white/40 mb-3 font-medium">Edge Label</p>
						<input
							type="text"
							value={edgeLabel}
							onChange={(e) => setEdgeLabel(e.target.value)}
							onKeyDown={(e) => { if (e.key === "Enter") saveEdgeLabel(); if (e.key === "Escape") { setEditingEdgeId(null); setEdgeLabel(""); } }}
							autoFocus
							placeholder="e.g., depends on, related to..."
							className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors"
						/>
						<div className="flex gap-2 mt-4 justify-end">
							<button
								type="button"
								onClick={() => {
									if (editingEdgeId) save({ ...map, edges: map.edges.map((e) => e.id === editingEdgeId ? { ...e, label: undefined } : e) });
									setEditingEdgeId(null);
								}}
								className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white/40 hover:text-white/60 transition-colors"
							>
								Remove
							</button>
							<button
								type="button"
								onClick={saveEdgeLabel}
								className="px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-[11px] text-indigo-400 hover:bg-indigo-500/30 transition-colors"
							>
								Save
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}