import { useState, useEffect } from "react";
import { useStore } from "../../../store/useStore";

export default function JournalEditor() {
	const boards = useStore((s) => s.boards);
	const currentUserId = useStore((s) => s.currentUserId);
	const setJournalEntry = useStore((s) => s.setJournalEntry);

	const board = currentUserId ? boards[`board-${currentUserId}`] : undefined;

	const [selectedDate, setSelectedDate] = useState(() => {
		const d = new Date();
		return d.toISOString().slice(0, 10);
	});

	const [text, setText] = useState("");
	const [saved, setSaved] = useState(false);
	const [expandedPast, setExpandedPast] = useState<string | null>(null);

	useEffect(() => {
		const entry = board?.journalEntries?.[selectedDate] ?? "";
		setText(entry);
		setSaved(false);
	}, [selectedDate, board?.journalEntries]);

	function handleSave() {
		setJournalEntry(selectedDate, text);
		setSaved(true);
		setTimeout(() => setSaved(false), 1500);
	}

	function handleBlur() {
		setJournalEntry(selectedDate, text);
		setSaved(true);
		setTimeout(() => setSaved(false), 1500);
	}

	const today = new Date().toISOString().slice(0, 10);
	const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

	function formatDate(iso: string): string {
		const d = new Date(iso + "T00:00:00");
		return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
	}

	// Get past entries (last 7 days, excluding today)
	const pastEntries: { date: string; text: string }[] = [];
	for (let i = 1; i <= 7; i++) {
		const d = new Date();
		d.setDate(d.getDate() - i);
		const key = d.toISOString().slice(0, 10);
		const entry = board?.journalEntries?.[key];
		if (entry) {
			pastEntries.push({ date: key, text: entry });
		}
	}

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="flex items-center justify-between mb-3">
				<h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Journal</h3>
				<div className="flex items-center gap-2">
					{saved && (
						<span className="text-[10px] text-emerald-400 animate-pulse">Saved ✓</span>
					)}
					<button
						type="button"
						onClick={handleSave}
						className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
					>
						Save
					</button>
				</div>
			</div>

			{/* Quick date buttons */}
			<div className="flex gap-1.5 mb-3">
				{[
					{ label: "Today", date: today },
					{ label: "Yesterday", date: yesterday },
				].map((d) => (
					<button
						key={d.date}
						type="button"
						onClick={() => setSelectedDate(d.date)}
						className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all
							${selectedDate === d.date
								? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-400"
								: "bg-white/5 border border-white/10 text-white/40 hover:text-white/60"
							}`}
					>
						{d.label}
					</button>
				))}
				<input
					type="date"
					value={selectedDate}
					onChange={(e) => setSelectedDate(e.target.value)}
					max={today}
					className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/60 outline-none [color-scheme:dark]"
				/>
			</div>

			{/* Date label */}
			<p className="text-[10px] text-white/30 mb-2">{formatDate(selectedDate)}</p>

			{/* Editor */}
			<textarea
				value={text}
				onChange={(e) => setText(e.target.value)}
				onBlur={handleBlur}
				placeholder="Write about your day, thoughts, gratitude..."
				className="flex-1 w-full rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 text-sm text-white/70 placeholder:text-white/15 outline-none resize-none focus:border-white/[0.12] transition-colors leading-relaxed min-h-[120px]"
			/>

			{/* Character count */}
			<div className="flex justify-end mt-1">
				<span className="text-[9px] text-white/15">{text.length} chars</span>
			</div>

			{/* Past entries */}
			{pastEntries.length > 0 && (
				<div className="mt-3 pt-3 border-t border-white/[0.04]">
					<p className="text-[10px] text-white/30 uppercase tracking-wider font-medium mb-2">Past Entries</p>
					<div className="space-y-1.5 max-h-[180px] overflow-y-auto">
						{pastEntries.map((e) => (
							<button
								key={e.date}
								type="button"
								onClick={() => {
									setSelectedDate(e.date);
									setExpandedPast(expandedPast === e.date ? null : e.date);
								}}
								className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
									expandedPast === e.date
										? "bg-white/[0.05] border border-white/[0.08]"
										: "hover:bg-white/[0.02]"
								}`}
							>
								<div className="flex items-center justify-between">
									<span className="text-[10px] text-white/40">{formatDate(e.date)}</span>
									<span className="text-[9px] text-white/20">{e.text.length} chars</span>
								</div>
								{expandedPast === e.date && (
									<p className="text-xs text-white/50 mt-1.5 leading-relaxed whitespace-pre-wrap">
										{e.text}
									</p>
								)}
								{expandedPast !== e.date && (
									<p className="text-[11px] text-white/30 mt-0.5 truncate">
										{e.text.slice(0, 60)}{e.text.length > 60 ? "..." : ""}
									</p>
								)}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}