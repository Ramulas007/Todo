import { useState, useMemo } from "react";
import { useStore } from "../../store/useStore";
import CardDetailModal from "./CardDetailModal";
import type { Card } from "../../types/board.types";

interface Props {
	onBackToBoard: () => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CalendarView({ onBackToBoard }: Props) {
	const board = useStore((s) => s.getBoard());
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [editingCard, setEditingCard] = useState<Card | null>(null);

	const cards = board ? Object.values(board.cards) : [];

	// Get calendar days
	const calendarDays = useMemo(() => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const startOffset = firstDay.getDay();
		const totalDays = lastDay.getDate();

		const days: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];

		// Previous month days
		for (let i = startOffset - 1; i >= 0; i--) {
			const d = new Date(year, month, -i);
			days.push({ date: d, isCurrentMonth: false, isToday: false });
		}

		// Current month days
		const today = new Date();
		for (let i = 1; i <= totalDays; i++) {
			const d = new Date(year, month, i);
			const isToday = d.toDateString() === today.toDateString();
			days.push({ date: d, isCurrentMonth: true, isToday });
		}

		// Next month days
		const remaining = 42 - days.length;
		for (let i = 1; i <= remaining; i++) {
			const d = new Date(year, month + 1, i);
			days.push({ date: d, isCurrentMonth: false, isToday: false });
		}

		return days;
	}, [currentDate]);

	// Get cards for a specific date
	function getCardsForDate(date: Date): Card[] {
		const dateStr = date.toISOString().split("T")[0];
		return cards.filter((card) => {
			if (!card.dueDate) return false;
			const cardDate = new Date(card.dueDate).toISOString().split("T")[0];
			return cardDate === dateStr;
		});
	}

	// Selected date cards
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

	return (
		<div className="min-h-screen bg-[#0f1117] text-slate-100">
			{/* Header */}
			<div className="border-b border-white/5 bg-gradient-to-r from-[#1a1d27]/80 to-[#0f1117]">
				<div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
					<div className="flex items-center gap-4">
						<div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
							<svg className="w-5 h-5 text-indigo-400" viewBox="0 0 20 20" fill="none">
								<rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
								<path d="M3 8h14" stroke="currentColor" strokeWidth="1.5"/>
								<path d="M7 2v4M13 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
							</svg>
						</div>
						<div>
							<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">Calendar</p>
							<h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
								{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
							</h2>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<button type="button" onClick={goToday}
							className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-medium text-slate-300 hover:bg-white/10 transition-colors"
						>Today</button>
						<button type="button" onClick={onBackToBoard}
							className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white flex items-center gap-2"
						>
							<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
								<path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>
							Board
						</button>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-7xl px-6 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
					{/* Calendar Grid */}
					<div className="rounded-2xl border border-white/5 bg-[#151924] p-4 shadow-lg shadow-black/20">
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
								<div key={day} className="text-center text-[10px] font-medium text-slate-500 py-2">
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
										onClick={() => setSelectedDate(day.date)}
										className={`relative h-20 sm:h-24 rounded-xl p-1.5 text-left transition-all duration-200
											${!day.isCurrentMonth ? "opacity-30" : ""}
											${day.isToday ? "bg-indigo-500/10 border border-indigo-500/30" : "border border-transparent"}
											${isSelected ? "ring-2 ring-indigo-500/50 bg-white/5" : "hover:bg-white/5"}
										`}
									>
										<span className={`text-xs font-medium ${day.isToday ? "text-indigo-400" : "text-slate-400"}`}>
											{day.date.getDate()}
										</span>
										{hasOverdue && (
											<span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
										)}
										<div className="mt-1 space-y-0.5">
											{dayCards.slice(0, 2).map((card) => (
												<div
													key={card.id}
													onClick={(e) => { e.stopPropagation(); setEditingCard(card); }}
													className={`text-[9px] truncate px-1 py-0.5 rounded cursor-pointer transition-colors
														${card.completedAt ? "bg-emerald-500/15 text-emerald-400 line-through" : "bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25"}`}
												>
													{card.title}
												</div>
											))}
											{dayCards.length > 2 && (
												<span className="text-[9px] text-slate-500">+{dayCards.length - 2} more</span>
											)}
										</div>
									</button>
								);
							})}
						</div>
					</div>

					{/* Selected Date Panel */}
					<div className="rounded-2xl border border-white/5 bg-[#151924] p-5 shadow-lg shadow-black/20">
						<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">
							{selectedDate ? "Selected Date" : "Select a date"}
						</p>
						{selectedDate ? (
							<>
								<h3 className="mt-2 text-lg font-semibold text-white">
									{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
								</h3>
								<div className="mt-4 space-y-2">
									{selectedDateCards.length === 0 ? (
										<p className="text-xs text-slate-500 text-center py-6">No cards due on this date</p>
									) : (
										selectedDateCards.map((card) => (
											<div
												key={card.id}
												onClick={() => setEditingCard(card)}
												className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5
													${card.completedAt
														? "bg-emerald-500/5 border-emerald-500/20"
														: "bg-[#1a1d27] border-white/5 hover:border-white/10"
													}`}
											>
												<div className="flex items-center gap-2">
													{card.completedAt && (
														<svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 16 16" fill="none">
															<circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
															<path d="M5.5 8l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
														</svg>
													)}
													<div className="flex-1 min-w-0">
														<p className={`text-sm font-medium truncate ${card.completedAt ? "text-slate-400 line-through" : "text-white"}`}>
															{card.title}
														</p>
														{card.priority && (
															<span className={`text-[10px] capitalize ${card.priority === "urgent" ? "text-rose-400" : card.priority === "high" ? "text-amber-400" : "text-slate-500"}`}>
																{card.priority}
															</span>
														)}
													</div>
												</div>
											</div>
										))
									)}
								</div>
							</>
						) : (
							<p className="mt-4 text-xs text-slate-500 text-center py-8">
								Click a date on the calendar to see cards
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Card Detail Modal */}
			{editingCard && (
				<CardDetailModal card={editingCard} onClose={() => setEditingCard(null)} />
			)}
		</div>
	);
}
