import type { Task } from "../../types/board.types";

interface Props {
	task: Task;
	onComplete: () => void;
}

export default function TaskItem({ task, onComplete }: Props) {
	return (
		<button
			onClick={onComplete}
			disabled={task.isCompleted}
			className={`flex items-start gap-2.5 w-full text-left rounded-lg px-2.5 py-2
				transition-all duration-150 group
				${task.isCompleted
					? "opacity-60 cursor-not-allowed"
					: "hover:bg-white/5 cursor-pointer"
				}`}
		>
			{/* Custom checkbox */}
			<div
				className={`mt-0.5 w-4 h-4 flex-shrink-0 rounded-md
					flex items-center justify-center border transition-all duration-200
					${task.isCompleted
						? "bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-500/30"
						: "border-slate-500 bg-transparent group-hover:border-indigo-400"
					}`}
			>
				{task.isCompleted && (
					<svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
						<path
							d="M1.5 5l2.5 2.5 4.5-4.5"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				)}
			</div>

			<div className="flex flex-col min-w-0 flex-1">
				<span
					className={`text-[12px] font-medium leading-tight transition-all duration-200
						${task.isCompleted
							? "line-through text-slate-500"
							: "text-slate-200 group-hover:text-white"
						}`}
				>
					{task.title}
				</span>
				{task.description && (
					<span className={`text-[11px] leading-tight truncate mt-0.5
						${task.isCompleted ? "text-slate-600" : "text-slate-500"}`}
					>
						{task.description}
					</span>
				)}
			</div>

			{task.isCompleted && (
				<span className="text-[10px] text-emerald-500/60 mt-0.5">✓</span>
			)}
		</button>
	);
}
