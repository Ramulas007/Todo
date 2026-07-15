import { useDroppable } from "@dnd-kit/react";
import type { Card, List } from "../../types/board.types";
import CardItem from "./Card";

interface Props {
	list: List;
	cards: Card[];
	totalDone: number;
	openCardId: string | number | null;
	onToggleCard: (cardId: string | number) => void;
}

const LIST_CONFIG: Record<string, { icon: string; accent: string; gradient: string; headerBg: string }> = {
	"list-1": { icon: "📋", accent: "border-t-blue-500", gradient: "from-blue-500/5 to-transparent", headerBg: "bg-blue-500/8" },
	"list-2": { icon: "⚡", accent: "border-t-amber-500", gradient: "from-amber-500/5 to-transparent", headerBg: "bg-amber-500/8" },
	"list-3": { icon: "✅", accent: "border-t-emerald-500", gradient: "from-emerald-500/5 to-transparent", headerBg: "bg-emerald-500/8" },
	"list-4": { icon: "📦", accent: "border-t-violet-500", gradient: "from-violet-500/5 to-transparent", headerBg: "bg-violet-500/8" },
};

const DEFAULT_CONFIG = { icon: "📋", accent: "border-t-slate-500", gradient: "from-slate-500/5 to-transparent", headerBg: "bg-slate-500/8" };

export default function List({ list, cards, totalDone, openCardId, onToggleCard }: Props) {
	const { ref, isDropTarget } = useDroppable({ id: list.id });
	const config = LIST_CONFIG[list.id as string] ?? DEFAULT_CONFIG;

	return (
		<div
			ref={ref}
			className={`shrink-0 w-72 max-h-[80vh] rounded-2xl border border-t-2 ${config.accent}
				bg-gradient-to-b ${config.gradient} bg-[#1a1d27]
				flex flex-col overflow-hidden transition-all duration-200
				${isDropTarget ? "ring-2 ring-indigo-500/40 border-indigo-500/50 scale-[1.01]" : "border-white/5 hover:border-white/10"}
			`}
		>
			{/* Header */}
			<div className={`flex items-center justify-between px-4 py-3.5 border-b border-white/5 shrink-0 ${config.headerBg}`}>
				<div className="flex items-center gap-2.5">
					<span className="text-base">{config.icon}</span>
					<h3 className="text-sm font-semibold text-slate-100 tracking-wide">{list.title}</h3>
				</div>
				<div className="flex items-center gap-2">
					{totalDone > 0 && (
						<span className="text-[10px] text-emerald-400 font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full">
							{totalDone} done
						</span>
					)}
					<span className="text-xs font-semibold text-slate-400 bg-white/8 rounded-full w-6 h-6 flex items-center justify-center">
						{cards.length}
					</span>
				</div>
			</div>

			{/* Cards */}
			<div className="flex flex-col gap-2.5 p-3 overflow-y-auto flex-1 min-h-0">
				{cards.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 text-slate-500">
						<span className="text-2xl mb-2 opacity-40">{config.icon}</span>
						<span className="text-xs">No cards yet</span>
					</div>
				) : (
					cards.map((card, index) => (
						<div key={card.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
							<CardItem
								card={card}
								isOpen={openCardId === card.id}
								onToggle={() => onToggleCard(card.id)}
							/>
						</div>
					))
				)}
			</div>
		</div>
	);
}
