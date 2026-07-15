export type Tool = "pen" | "rect" | "circle" | "line" | "arrow" | "text" | "fill" | "eraser";

interface Props {
	tool: Tool;
	onToolChange: (tool: Tool) => void;
	color: string;
	onColorChange: (color: string) => void;
	strokeWidth: number;
	onStrokeWidthChange: (width: number) => void;
	fontSize: number;
	onFontSizeChange: (size: number) => void;
	onUndo: () => void;
	onRedo: () => void;
	canUndo: boolean;
	canRedo: boolean;
	onExport: () => void;
	onClear: () => void;
}

const TOOLS: { id: Tool; label: string; icon: string }[] = [
	{ id: "pen", label: "Pen", icon: "✏️" },
	{ id: "rect", label: "Rect", icon: "▭" },
	{ id: "circle", label: "Circle", icon: "○" },
	{ id: "line", label: "Line", icon: "╱" },
	{ id: "arrow", label: "Arrow", icon: "→" },
	{ id: "text", label: "Text", icon: "T" },
	{ id: "fill", label: "Fill", icon: "🪣" },
	{ id: "eraser", label: "Eraser", icon: "⌫" },
];

const COLORS = [
	"#ffffff", "#ef4444", "#f59e0b", "#10b981",
	"#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4",
	"#000000", "#6b7280",
];

const STROKE_WIDTHS = [2, 4, 6, 8, 12];
const FONT_SIZES = [14, 18, 24, 32, 48];

export default function CanvasToolbar({
	tool, onToolChange,
	color, onColorChange,
	strokeWidth, onStrokeWidthChange,
	fontSize, onFontSizeChange,
	onUndo, onRedo, canUndo, canRedo,
	onExport, onClear,
}: Props) {
	return (
		<div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#161922] border border-white/[0.06] flex-wrap">
			{/* Tools */}
			<div className="flex gap-1">
				{TOOLS.map((t) => (
					<button
						key={t.id}
						type="button"
						onClick={() => onToolChange(t.id)}
						title={t.label}
						className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all
							${tool === t.id
								? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-400"
								: "bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
							}`}
					>
						{t.icon}
					</button>
				))}
			</div>

			<div className="w-px h-6 bg-white/[0.06]" />

			{/* Colors */}
			<div className="flex gap-1">
				{COLORS.map((c) => (
					<button
						key={c}
						type="button"
						onClick={() => onColorChange(c)}
						className={`w-5 h-5 rounded-full transition-all
							${color === c ? "ring-2 ring-white/40 scale-110" : "hover:scale-110"}`}
						style={{ backgroundColor: c, border: c === "#000000" ? "1px solid rgba(255,255,255,0.1)" : undefined }}
					/>
				))}
			</div>

			<div className="w-px h-6 bg-white/[0.06]" />

			{/* Stroke width */}
			<div className="flex items-center gap-1">
				<span className="text-[9px] text-white/20">Size</span>
				{STROKE_WIDTHS.map((w) => (
					<button
						key={w}
						type="button"
						onClick={() => onStrokeWidthChange(w)}
						className={`w-6 h-6 rounded flex items-center justify-center transition-all
							${strokeWidth === w ? "bg-white/10" : "hover:bg-white/5"}`}
					>
						<div className="rounded-full bg-white/60" style={{ width: w, height: w }} />
					</button>
				))}
			</div>

			{/* Font size (only for text tool) */}
			{tool === "text" && (
				<>
					<div className="w-px h-6 bg-white/[0.06]" />
					<div className="flex items-center gap-1">
						<span className="text-[9px] text-white/20">Font</span>
						{FONT_SIZES.map((s) => (
							<button
								key={s}
								type="button"
								onClick={() => onFontSizeChange(s)}
								className={`px-1.5 py-0.5 rounded text-[10px] transition-all
									${fontSize === s ? "bg-white/10 text-white/70" : "text-white/30 hover:text-white/50"}`}
							>
								{s}
							</button>
						))}
					</div>
				</>
			)}

			<div className="flex-1" />

			{/* Undo / Redo */}
			<div className="flex gap-1">
				<button
					type="button"
					onClick={onUndo}
					disabled={!canUndo}
					className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/70 disabled:opacity-30 transition-all"
					title="Undo"
				>
					<svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
						<path d="M3 7h7a3 3 0 010 6H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
						<path d="M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</button>
				<button
					type="button"
					onClick={onRedo}
					disabled={!canRedo}
					className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/70 disabled:opacity-30 transition-all"
					title="Redo"
				>
					<svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
						<path d="M13 7H6a3 3 0 000 6h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
						<path d="M10 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</button>
			</div>

			{/* Export */}
			<button
				type="button"
				onClick={onExport}
				className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10px] text-white/40 hover:text-white/70 transition-all"
			>
				Export PNG
			</button>

			{/* Clear */}
			<button
				type="button"
				onClick={onClear}
				className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-400/70 hover:text-red-400 hover:bg-red-500/20 transition-all"
			>
				Clear
			</button>
		</div>
	);
}