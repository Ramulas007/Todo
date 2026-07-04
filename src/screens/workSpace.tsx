import { mockBoard } from "../data/mockData";
import Board from "./board_components/Board";

export default function Workspace({
	onBackToDashboard,
}: {
	onBackToDashboard: () => void
}) {
	return (
		<div className="min-h-screen bg-[#0f1117] text-slate-100">
			<div className="border-b border-white/5 bg-white/3 backdrop-blur">
				<div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
					<div>
						<p className="text-xs uppercase tracking-[0.24em] text-slate-500">
							Todo space
						</p>
						<h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
							{mockBoard.title}
						</h2>
						<p className="mt-1 text-sm text-slate-400">{mockBoard.description}</p>
					</div>
					<button
						type="button"
						onClick={onBackToDashboard}
						className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
					>
						Back to dashboard
					</button>
				</div>
			</div>

			<Board />
		</div>
	);
}
