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
			className={`flex items-start gap-2 w-full text-left rounded-md px-2 py-1.5
				transition-all duration-150 group
				${task.isCompleted
					? "opacity-50 cursor-not-allowed"
					: "hover:bg-white/[0.03] cursor-pointer"
				}`}
		>
			<div
				className={`mt-0.5 w-3.5 h-3.5 flex-shrink-0 rounded
					flex items-center justify-center border transition-all duration-150
					${task.isCompleted
						? "bg-emerald-500 border-emerald-500"
						: "border-slate-600 group-hover:border-indigo-400"
					}`}
			>
				{task.isCompleted && (
					<svg className="w-2 h-2 text-white" viewBox="0 0 10 10" fill="none">
						<path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				)}
			</div>

			<div className="flex flex-col min-w-0 flex-1">
				<span
					className={`text-xs font-medium leading-tight transition-all duration-150
						${task.isCompleted
							? "line-through text-slate-600"
							: "text-slate-300"
						}`}
				>
					{task.title}
				</span>
				{task.description && (
					<span className="text-[11px] leading-tight truncate mt-0.5 text-slate-600">
						{task.description}
					</span>
				)}
			</div>
		</button>
	);
}