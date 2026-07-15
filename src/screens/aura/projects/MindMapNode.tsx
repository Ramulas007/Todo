import { useState, useRef, useEffect, useMemo } from "react";
import type { MindMapNode as NodeType } from "../../../types/board.types";

export type HandleSide = "top" | "right" | "bottom" | "left";

interface Props {
	node: NodeType;
	selected: boolean;
	isConnecting: boolean;
	connectingFrom: string | null;
	onMove: (id: string, x: number, y: number) => void;
	onEdit: (id: string, text: string) => void;
	onDelete: (id: string) => void;
	onConnectStart: (id: string, side: HandleSide) => void;
	onConnectEnd: (id: string) => void;
	onSelect: (id: string) => void;
	onColorCycle: (id: string) => void;
}

const HANDLE_POSITIONS: { side: HandleSide; style: React.CSSProperties }[] = [
	{ side: "top", style: { top: -7, left: "50%", transform: "translateX(-50%)" } },
	{ side: "right", style: { top: "50%", right: -7, transform: "translateY(-50%)" } },
	{ side: "bottom", style: { bottom: -7, left: "50%", transform: "translateX(-50%)" } },
	{ side: "left", style: { top: "50%", left: -7, transform: "translateY(-50%)" } },
];

export default function MindMapNodeComponent({
	node, selected, isConnecting, connectingFrom,
	onMove, onEdit, onDelete, onConnectStart, onConnectEnd, onSelect, onColorCycle,
}: Props) {
	const [dragging, setDragging] = useState(false);
	const [editing, setEditing] = useState(false);
	const [text, setText] = useState(node.text);
	const [hovered, setHovered] = useState(false);
	const dragOffset = useRef({ x: 0, y: 0 });
	const inputRef = useRef<HTMLInputElement>(null);
	const textRef = useRef<HTMLSpanElement>(null);

	useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

	// Auto-size: measure text width
	const textWidth = useMemo(() => {
		if (typeof document === "undefined") return 80;
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		if (!ctx) return 80;
		ctx.font = "14px sans-serif";
		return Math.max(80, ctx.measureText(text).width + 32);
	}, [text]);

	const nodeWidth = editing ? Math.max(120, textWidth) : textWidth;

	// Delete key when selected
	useEffect(() => {
		if (!selected) return;
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Delete" || e.key === "Backspace") {
				if (!editing) { e.preventDefault(); onDelete(node.id); }
			}
		}
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [selected, editing, node.id, onDelete]);

	function handleMouseDown(e: React.MouseEvent) {
		if (editing) return;
		e.stopPropagation();
		onSelect(node.id);
		dragOffset.current = { x: e.clientX - node.x, y: e.clientY - node.y };
		setDragging(true);
	}

	useEffect(() => {
		if (!dragging) return;
		function handleMove(e: MouseEvent) {
			onMove(node.id, e.clientX - dragOffset.current.x, e.clientY - dragOffset.current.y);
		}
		function handleUp() { setDragging(false); }
		window.addEventListener("mousemove", handleMove);
		window.addEventListener("mouseup", handleUp);
		return () => {
			window.removeEventListener("mousemove", handleMove);
			window.removeEventListener("mouseup", handleUp);
		};
	}, [dragging, node.id, onMove]);

	function handleDoubleClick(e: React.MouseEvent) {
		e.stopPropagation();
		setEditing(true);
	}

	function handleBlur() {
		setEditing(false);
		if (text.trim()) onEdit(node.id, text.trim());
		else setText(node.text);
	}

	return (
		<div
			data-node
			onMouseDown={handleMouseDown}
			onDoubleClick={handleDoubleClick}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onMouseUp={() => { if (isConnecting && connectingFrom !== node.id) onConnectEnd(node.id); }}
			className={`absolute select-none rounded-xl border cursor-grab active:cursor-grabbing
				${dragging ? "z-20 opacity-90" : "z-10"}
				${selected ? "ring-2 ring-indigo-500/70" : ""}
				${isConnecting && connectingFrom !== node.id ? "ring-2 ring-indigo-500/50" : ""}
			`}
			style={{
				left: node.x,
				top: node.y,
				width: nodeWidth,
				backgroundColor: (node.color ?? "#6366f1") + "18",
				borderColor: selected ? (node.color ?? "#6366f1") : (node.color ?? "#6366f1") + "35",
				boxShadow: dragging
					? `0 8px 24px ${(node.color ?? "#6366f1")}25`
					: selected
					? `0 0 0 1px ${(node.color ?? "#6366f1")}30`
					: "0 1px 3px rgba(0,0,0,0.2)",
				transition: dragging ? "none" : "box-shadow 0.2s, border-color 0.2s",
			}}
		>
			{/* Color indicator dot */}
			<button
				type="button"
				onClick={(e) => { e.stopPropagation(); onColorCycle(node.id); }}
				className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full border border-white/20 hover:scale-150 transition-transform z-40"
				style={{ backgroundColor: node.color ?? "#6366f1" }}
				title="Change color"
			/>

			{/* Node content */}
			<div className="px-3 py-2">
				{editing ? (
					<input
						ref={inputRef}
						type="text"
						value={text}
						onChange={(e) => setText(e.target.value)}
						onBlur={handleBlur}
						onKeyDown={(e) => { if (e.key === "Enter") handleBlur(); if (e.key === "Escape") { setText(node.text); setEditing(false); } }}
						className="bg-transparent text-[13px] text-white outline-none w-full"
					/>
				) : (
					<span ref={textRef} className="text-[13px] text-white/80 whitespace-nowrap block truncate">
						{node.text}
					</span>
				)}
			</div>

			{/* Connection handles — visible on hover or when connecting */}
			{(hovered || isConnecting) && HANDLE_POSITIONS.map(({ side, style }) => (
				<button
					key={side}
					type="button"
					onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); onConnectStart(node.id, side); }}
					className={`absolute w-3 h-3 rounded-full border-2 transition-all z-30
						${isConnecting && connectingFrom !== node.id
							? "bg-indigo-400 border-indigo-300 scale-125"
							: "bg-white/30 border-white/40 hover:bg-indigo-400 hover:border-indigo-300 hover:scale-125"
						}`}
					style={style}
				/>
			))}

			{/* Delete button — X in corner when selected */}
			{selected && !editing && (
				<button
					type="button"
					onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
					className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-red-500/90 border border-red-400/50 flex items-center justify-center text-white text-[10px] hover:bg-red-500 hover:scale-110 transition-all z-40"
				>
					×
				</button>
			)}
		</div>
	);
}