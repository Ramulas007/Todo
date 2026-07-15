import type { SketchLayer } from "../../../types/board.types";

interface Props {
	layers: SketchLayer[];
	activeLayerId: string;
	floating?: boolean;
	onActiveLayerChange: (id: string) => void;
	onToggleVisibility: (id: string) => void;
	onToggleLock: (id: string) => void;
	onAddLayer: () => void;
	onRemoveLayer: (id: string) => void;
	onRenameLayer: (id: string, name: string) => void;
	onReorder: (fromIndex: number, toIndex: number) => void;
}

export default function CanvasLayerPanel({
	layers, activeLayerId, floating,
	onActiveLayerChange,
	onToggleVisibility, onToggleLock, onAddLayer,
	onRemoveLayer, onRenameLayer, onReorder,
}: Props) {
	return (
		<div className={`${floating
			? "absolute top-2 right-2 z-20 w-[180px] rounded-xl bg-[#161922]/95 backdrop-blur-sm border border-white/[0.06] p-3 max-h-[300px] flex flex-col"
			: "w-[180px] shrink-0 rounded-xl bg-[#161922] border border-white/[0.06] p-3 flex flex-col"
		}`}>
			<div className="flex items-center justify-between mb-2">
				<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium">Layers</p>
				<button
					type="button"
					onClick={onAddLayer}
					className="w-5 h-5 rounded flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors text-xs"
				>
					+
				</button>
			</div>

			<div className="flex-1 overflow-y-auto space-y-1">
				{[...layers].reverse().map((layer, ri) => {
					const i = layers.length - 1 - ri;
					return (
						<div
							key={layer.id}
							onClick={() => onActiveLayerChange(layer.id)}
							className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all
								${activeLayerId === layer.id
									? "bg-white/[0.08] border border-white/[0.1]"
									: "border border-transparent hover:bg-white/[0.03]"
								}`}
						>
							{/* Visibility */}
							<button
								type="button"
								onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}
								className={`w-4 h-4 flex items-center justify-center text-[10px] transition-colors
									${layer.visible ? "text-white/50" : "text-white/15"}`}
							>
								{layer.visible ? "👁" : "○"}
							</button>

							{/* Lock */}
							<button
								type="button"
								onClick={(e) => { e.stopPropagation(); onToggleLock(layer.id); }}
								className={`w-4 h-4 flex items-center justify-center text-[10px] transition-colors
									${layer.locked ? "text-amber-400/60" : "text-white/15"}`}
							>
								{layer.locked ? "🔒" : "○"}
							</button>

							{/* Name */}
							<input
								type="text"
								value={layer.name}
								onChange={(e) => onRenameLayer(layer.id, e.target.value)}
								onClick={(e) => e.stopPropagation()}
								className="flex-1 min-w-0 bg-transparent text-[11px] text-white/60 outline-none truncate"
							/>

							{/* Reorder */}
							{ri > 0 && (
								<button
									type="button"
									onClick={(e) => { e.stopPropagation(); onReorder(i, i + 1); }}
									className="text-[8px] text-white/20 hover:text-white/50"
								>
									▲
								</button>
							)}
							{ri < layers.length - 1 && (
								<button
									type="button"
									onClick={(e) => { e.stopPropagation(); onReorder(i, i - 1); }}
									className="text-[8px] text-white/20 hover:text-white/50"
								>
									▼
								</button>
							)}

							{/* Delete */}
							{layers.length > 1 && (
								<button
									type="button"
									onClick={(e) => { e.stopPropagation(); onRemoveLayer(layer.id); }}
									className="text-[10px] text-white/0 hover:text-red-400 transition-colors"
								>
									×
								</button>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}