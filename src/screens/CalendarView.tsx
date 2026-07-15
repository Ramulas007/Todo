import { useState, useMemo, useRef, useEffect } from "react";
import { useStore } from "../store/useStore";
import CardDetailModal from "./board_components/CardDetailModal";
import BlobBackground from "../components/BlobBackground";
import type { Card, Priority } from "../types/board.types";

interface Props {
	onBackToBoard: () => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
	{ value: "low", label: "Low", color: "text-slate-400" },
	{ value: "medium", label: "Medium", color: "text-amber-400" },
	{ value: "high", label: "High", color: "text-orange-400" },
	{ value: "urgent", label: "Urgent", color: "text-rose-400" },
];

export default function CalendarView({ onBackToBoard }: Props) {
	const board = useStore((s) => s.getBoard());
	const createCard = useStore((s) => s.createCard);
	const updateCard = useStore((s) => s.updateCard);
	const moveCard = useStore((s) => s.moveCard);
	const deleteCard = useStore((s) => s.deleteCard);

	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [editingCard, setEditingCard] = useState<Card | null>(null);

	// New todo form state
	const [newTitle, setNewTitle] = useState("");
	const [newPriority, setNewPriority] = useState<Priority>("medium");
	const [isAdding, setIsAdding] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const cards = board ? Object.values(board.cards) : [];
	const todoList = board?.lists.find((l) => l.title === "To Do") ?? board?.lists[0];

	// Precompute card map for O(1) lookups per day cell
	const cardMap = useMemo(() => {
		const map = new Map<string, Card[]>();
		cards.forEach((card) => {
			if (!card.dueDate) return;
			const key = new Date(card.dueDate).toISOString().split("T")[0];
			const list = map.get(key);
			if (list) list.push(card);
			else map.set(key, [card]);
		});
		return map;
	}, [cards]);

	// Auto-focus input when date is selected
	useEffect(() => {
		if (selectedDate) {
			const t = setTimeout(() => inputRef.current?.focus(), 100);
			return () => clearTimeout(t);
		}
	}, [selectedDate]);

	const calendarDays = useMemo(() => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const startOffset = firstDay.getDay();
		const totalDays = lastDay.getDate();

		const days: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];

		for (let i = startOffset - 1; i >= 0; i--) {
			const d = new Date(year, month, -i);
			days.push({ date: d, isCurrentMonth: false, isToday: false });
		}

		const today = new Date();
		for (let i = 1; i <= totalDays; i++) {
			const d = new Date(year, month, i);
			const isToday = d.toDateString() === today.toDateString();
			days.push({ date: d, isCurrentMonth: true, isToday });
		}

		const remaining = 42 - days.length;
		for (let i = 1; i <= remaining; i++) {
			const d = new Date(year, month + 1, i);
			days.push({ date: d, isCurrentMonth: false, isToday: false });
		}

		return days;
	}, [currentDate]);

	function getCardsForDate(date: Date): Card[] {
		return cardMap.get(date.toISOString().split("T")[0]) ?? [];
	}

	const selectedDateCards = selectedDate ? getCardsForDate(selectedDate) : [];

	function prevMonth() {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
	}

	function nextMonth() {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
	}

	function goToday() {
		setCurrentDate(new Date());
		setSelectedDate(new Date());
	}

	function handleAddTodo() {
		if (!newTitle.trim() || !selectedDate || !todoList) return;

		setIsAdding(true);
		const dueDateStr = selectedDate.toISOString().split("T")[0];

		createCard(todoList.id, {
			title: newTitle.trim(),
			description: "",
			tasks: [],
			position: todoList.cardIds.length,
			color: "#6366f1",
			priority: newPriority,
			dueDate: dueDateStr,
		});

		setNewTitle("");
		setNewPriority("medium");
		setIsAdding(false);
		inputRef.current?.focus();
	}

	function handleToggleComplete(card: Card) {
		const doneListId = board?.lists.find((l) => l.title === 'Done')?.id;
		if (!card.completedAt && doneListId) {
			moveCard(String(card.id), doneListId);
		} else {
			updateCard(card.id, { completedAt: undefined });
		}
	}

	function handleDeleteCard(cardId: string) {
		deleteCard(cardId);
	}

	function handleSelectDate(date: Date) {
		setSelectedDate(date);
		setNewTitle("");
		setNewPriority("medium");
	}

	function handleDayKeyDown(e: React.KeyboardEvent, date: Date) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			handleSelectDate(date);
		}
	}

	return (
		<div className="min-h-screen bg-[#0a0a12] text-white relative overflow-hidden">
			<BlobBackground />
			<div className="fixed top-[5%] right-[10%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-orange-500/10 to-amber-500/8 blur-[120px] pointer-events-none" />
			<div className="fixed bottom-[10%] left-[5%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/8 blur-[120px] pointer-events-none" />

			<div className="relative z-10">
				{/* Header */}
				<div className="glass border-b border-white/[0.06] rounded-none">
					<div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
					<h1 className="text-lg font-semibold text-white">
						{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
					</h1>
					<div className="flex items-center gap-2">
						<button type="button" onClick={goToday}
							className="px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs font-medium text-slate-400 hover:text-white hover:border-white/[0.12] transition-all duration-150"
						>Today</button>
						<button type="button" onClick={onBackToBoard}
							className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:border-white/[0.12] transition-all duration-150 flex items-center gap-1.5"
						>
							<svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
								<path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>
							Board
						</button>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-7xl px-6 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
					{/* Calendar Grid */}
					<div className="rounded-xl border border-white/[0.06] bg-[#161922] p-4">
						{/* Month navigation */}
						<div className="flex items-center justify-between mb-4">
							<button type="button" onClick={prevMonth}
								className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
							>
								<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
									<path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</button>
							<h3 className="text-sm font-semibold text-white">
								{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
							</h3>
							<button type="button" onClick={nextMonth}
								className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
							>
								<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
									<path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</button>
						</div>

						{/* Day headers */}
						<div className="grid grid-cols-7 gap-1 mb-2">
							{DAYS.map((day) => (
								<div key={day} className="text-center text-xs font-medium text-white/60 py-2">
									{day}
								</div>
							))}
						</div>

						{/* Calendar days */}
						<div className="grid grid-cols-7 gap-1">
							{calendarDays.map((day, i) => {
								const dayCards = getCardsForDate(day.date);
								const isSelected = selectedDate?.toDateString() === day.date.toDateString();
								const hasOverdue = dayCards.some((c) => c.dueDate && new Date(c.dueDate) < new Date() && !c.completedAt);

								return (
									<button
										key={i}
										type="button"
										onClick={() => handleSelectDate(day.date)}
										onKeyDown={(e) => handleDayKeyDown(e, day.date)}
										className={`relative h-20 sm:h-24 rounded-xl p-1.5 text-left transition-all duration-200 group
											${!day.isCurrentMonth ? "opacity-30" : ""}
											${day.isToday ? "bg-indigo-500/10 border border-indigo-500/30" : "border border-transparent"}
											${isSelected ? "ring-2 ring-indigo-500/50 bg-white/5" : "hover:bg-white/5"}
										`}
									>
										<span className={`text-xs font-medium ${day.isToday ? "text-indigo-400" : "text-white/60"}`}>
											{day.date.getDate()}
										</span>
										{hasOverdue && (
											<span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
										)}
										{dayCards.length > 0 && (
												<div className="mt-1 flex items-center gap-0.5 flex-wrap">
													{dayCards.some((c) => !c.completedAt) && (
														<span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
													)}
													{dayCards.some((c) => c.completedAt) && (
														<span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
													)}
													{dayCards.length > 2 && (
														<span className="text-[10px] text-white/40 ml-0.5">{dayCards.length}</span>
													)}
												</div>
											)}
									</button>
								);
							})}
						</div>
					</div>

					{/* Right Sidebar */}
					<div className="space-y-4">
						{/* Selected Date Header */}
						<div className="rounded-xl border border-white/[0.06] bg-[#161922] p-5">
							<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">
								{selectedDate ? "Selected Date" : "Select a date"}
							</p>
							{selectedDate ? (
								<h3 className="mt-2 text-lg font-semibold text-white">
									{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
								</h3>
							) : (
								<p className="mt-3 text-xs text-slate-500 text-center py-4">
									Click a date on the calendar to see or add cards
								</p>
							)}
						</div>

						{/* Add Todo Form */}
						{selectedDate && (
							<div className="rounded-xl border border-white/[0.06] bg-[#161922] p-5">
								<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium mb-3">Add todo</p>
								<form onSubmit={(e) => { e.preventDefault(); handleAddTodo(); }} className="space-y-3">
									<input
										ref={inputRef}
										type="text"
										value={newTitle}
										onChange={(e) => setNewTitle(e.target.value)}
										placeholder="What needs to be done?"
										className="w-full rounded-xl bg-[#22263a] border border-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
									/>
									<div className="flex items-center gap-2">
										<div className="flex gap-1.5 flex-1">
											{PRIORITY_OPTIONS.map((opt) => (
												<button
													key={opt.value}
													type="button"
													onClick={() => setNewPriority(opt.value)}
													className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all duration-150
														${newPriority === opt.value
															? "bg-white/10 border border-white/20 text-white"
															: "border border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10"
														}`}
												>
													{opt.label}
												</button>
											))}
										</div>
										<button
											type="submit"
											disabled={!newTitle.trim() || isAdding}
											className="shrink-0 w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-white transition-all duration-200 hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
										>
											<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
												<path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
											</svg>
										</button>
									</div>
								</form>
							</div>
						)}

						{/* Cards List */}
						{selectedDate && (
							<div className="rounded-xl border border-white/[0.06] bg-[#161922] p-5">
								<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium mb-3">
									Tasks · {selectedDateCards.length}
								</p>
								<div className="space-y-2">
									{selectedDateCards.length === 0 ? (
										<div className="py-8 text-center">
											<div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
												<svg className="w-5 h-5 text-slate-600" viewBox="0 0 20 20" fill="none">
													<rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/>
													<path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
												</svg>
											</div>
											<p className="text-xs text-slate-500">No tasks for this date</p>
											<p className="text-[10px] text-slate-600 mt-1">Add one above to get started</p>
										</div>
									) : (
										selectedDateCards.map((card) => (
											<div
												key={card.id}
												className={`group p-3 rounded-xl border transition-all duration-200
													${card.completedAt
														? "bg-emerald-500/5 border-emerald-500/15"
														: "bg-[#1a1d27] border-white/5 hover:border-white/10"
													}`}
											>
												<div className="flex items-start gap-3">
													<button
														type="button"
														onClick={() => handleToggleComplete(card)}
														className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200
															${card.completedAt
																? "bg-emerald-500 border-emerald-500"
																: "border-slate-600 hover:border-indigo-400"
															}`}
													>
														{card.completedAt && (
															<svg className="w-3 h-3 text-white" viewBox="0 0 10 10" fill="none">
																<path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
															</svg>
														)}
													</button>
													<div className="flex-1 min-w-0">
														<button
															type="button"
															onClick={() => setEditingCard(card)}
															className="text-left w-full"
														>
															<p className={`text-sm font-medium leading-snug ${card.completedAt ? "text-slate-500 line-through" : "text-white"}`}>
																{card.title}
															</p>
														</button>
														<div className="flex items-center gap-2 mt-1.5">
															{card.priority && (
																<span className={`text-[10px] font-medium capitalize ${card.priority === "urgent" ? "text-rose-400" : card.priority === "high" ? "text-amber-400" : card.priority === "medium" ? "text-slate-400" : "text-slate-500"}`}>
																	{card.priority}
																</span>
															)}
															{card.tasks.length > 0 && (
																<span className="text-[10px] text-slate-600">
																	{card.tasks.filter((t) => t.isCompleted).length}/{card.tasks.length} subtasks
																</span>
															)}
														</div>
													</div>
													<button
														type="button"
														onClick={() => handleDeleteCard(card.id)}
														className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-150 shrink-0"
													>
														<svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
															<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
														</svg>
													</button>
												</div>
											</div>
										))
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Card Detail Modal */}
			{editingCard && (
				<CardDetailModal card={editingCard} onClose={() => setEditingCard(null)} />
			)}
			</div>
		</div>
	);
}