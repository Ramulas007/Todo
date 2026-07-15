import { useState, useRef, useEffect } from "react";

interface Option {
	value: string;
	label: string;
	icon?: string;
	color?: string;
}

interface Props {
	value: string;
	options: Option[];
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export default function CustomSelect({ value, options, onChange, placeholder, className = "" }: Props) {
	const [open, setOpen] = useState(false);
	const [hoveredIdx, setHoveredIdx] = useState(-1);
	const containerRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	const selected = options.find((o) => o.value === value);

	// Close on outside click
	useEffect(() => {
		if (!open) return;
		function handleClick(e: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") setOpen(false);
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setHoveredIdx((prev) => Math.min(prev + 1, options.length - 1));
			}
			if (e.key === "ArrowUp") {
				e.preventDefault();
				setHoveredIdx((prev) => Math.max(prev - 1, 0));
			}
			if (e.key === "Enter" && hoveredIdx >= 0) {
				e.preventDefault();
				onChange(options[hoveredIdx].value);
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClick);
		document.addEventListener("keydown", handleKey);
		return () => {
			document.removeEventListener("mousedown", handleClick);
			document.removeEventListener("keydown", handleKey);
		};
	}, [open, hoveredIdx, options, onChange]);

	// Scroll hovered into view
	useEffect(() => {
		if (hoveredIdx >= 0 && listRef.current) {
			const item = listRef.current.children[hoveredIdx] as HTMLElement;
			item?.scrollIntoView({ block: "nearest" });
		}
	}, [hoveredIdx]);

	return (
		<div ref={containerRef} className={`relative ${className}`}>
			{/* Trigger */}
			<button
				type="button"
				onClick={() => { setOpen(!open); setHoveredIdx(-1); }}
				className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.05] focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-left flex items-center justify-between gap-2"
			>
				<div className="flex items-center gap-2.5 min-w-0">
					{selected?.icon && <span className="text-sm shrink-0">{selected.icon}</span>}
					{selected?.color && (
						<span
							className="w-3 h-3 rounded-full shrink-0 border border-white/10"
							style={{ backgroundColor: selected.color }}
						/>
					)}
					<span className="truncate">{selected?.label ?? placeholder ?? "Select..."}</span>
				</div>
				<svg
					className={`w-4 h-4 text-white/30 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
					viewBox="0 0 16 16"
					fill="none"
				>
					<path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</button>

			{/* Dropdown */}
			{open && (
				<div className="absolute z-50 mt-2 w-full min-w-[160px]">
					<div
						ref={listRef}
						className="rounded-xl border border-white/[0.08] bg-[#1a1d2e]/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden py-1.5 animate-fade-in"
					>
						{options.map((option, idx) => {
							const isSelected = option.value === value;
							const isHovered = idx === hoveredIdx;
							return (
								<button
									key={option.value}
									type="button"
									onClick={() => { onChange(option.value); setOpen(false); }}
									onMouseEnter={() => setHoveredIdx(idx)}
									className={`w-full px-3 py-2 text-left flex items-center gap-2.5 text-sm transition-colors duration-100
										${isSelected
											? "bg-indigo-500/15 text-indigo-400"
											: isHovered
											? "bg-white/[0.06] text-white"
											: "text-white/60 hover:text-white"
										}`}
								>
									{option.icon && <span className="text-sm shrink-0">{option.icon}</span>}
									{option.color && (
										<span
											className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/10"
											style={{ backgroundColor: option.color }}
										/>
									)}
									<span className="truncate">{option.label}</span>
									{isSelected && (
										<svg className="w-3.5 h-3.5 ml-auto text-indigo-400 shrink-0" viewBox="0 0 16 16" fill="none">
											<path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									)}
								</button>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}