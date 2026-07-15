import { useState } from "react";
import { useStore } from "../../../store/useStore";
import SketchCanvas from "./SketchCanvas";
import MindMap from "./MindMap";

type Tab = "canvas" | "mindmap";

export default function IdeasView() {
	const boards = useStore((s) => s.boards);
	const currentUserId = useStore((s) => s.currentUserId);
	const addCard = useStore((s) => s.addCard);
	const openPanel = useStore((s) => s.openPanel);
	const [tab, setTab] = useState<Tab>("canvas");

	const board = currentUserId ? boards[`board-${currentUserId}`] : undefined;
	const lists = board?.lists ?? [];
	const firstListId = lists[0]?.id;

	// Get or create a default card for storing sketch/mindmap data
	const allCards = board ? Object.values(board.cards) : [];
	const ideasCards = allCards.filter((c) => c.tags?.includes("ideas") && !c.completedAt);
	const activeCard = ideasCards[0];

	function handleCreateCard() {
		if (!firstListId) return;
		addCard(firstListId, "My Sketch", undefined);
		// The card will be created and user can tag it
	}

	return (
		<div className="flex-1 flex flex-col min-h-0">
			{/* Tabs */}
			<div className="flex items-center gap-1 mb-3">
				{([
					{ id: "canvas" as Tab, label: "Sketch Canvas", icon: "🎨" },
					{ id: "mindmap" as Tab, label: "Mind Map", icon: "🧠" },
				]).map((t) => (
					<button
						key={t.id}
						type="button"
						onClick={() => setTab(t.id)}
						className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
							${tab === t.id
								? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-400"
								: "bg-white/5 border border-white/10 text-white/40 hover:text-white/60"
							}`}
					>
						<span>{t.icon}</span>
						{t.label}
					</button>
				))}

				<div className="flex-1" />

				{/* Card selector */}
				{ideasCards.length > 0 && (
					<select
						value={activeCard ? String(activeCard.id) : ""}
						onChange={(e) => openPanel(e.target.value)}
						className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-white/60 outline-none"
					>
						{ideasCards.map((c) => (
							<option key={String(c.id)} value={String(c.id)}>{c.title}</option>
						))}
					</select>
				)}

				<button
					type="button"
					onClick={handleCreateCard}
					className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/40 hover:text-white/60 transition-colors"
				>
					+ New
				</button>
			</div>

			{/* Content */}
			<div className="flex-1 min-h-0">
				{tab === "canvas" ? (
					<SketchCanvas
						data={activeCard?.sketchData}
						onSave={(data) => {
							if (activeCard) {
								useStore.getState().saveSketch(String(activeCard.id), data);
							}
						}}
					/>
				) : (
					<MindMap
						data={activeCard?.mindMapData}
						onSave={(data) => {
							if (activeCard) {
								useStore.getState().saveMindMap(String(activeCard.id), data);
							}
						}}
					/>
				)}
			</div>
		</div>
	);
}