import { useStore } from "../store/useStore";
import Board from "./board_components/Board";

export default function Workspace({
	onBackToDashboard,
}: {
	onBackToDashboard: () => void
}) {
	const currentUser = useStore((s) => s.currentUser);
	const board = useStore((s) => s.getBoard());

	return (
		<div className="min-h-screen bg-[#0f1117] text-slate-100">
			{/* Header */}
			<div className="border-b border-white/5 bg-gradient-to-r from-[#1a1d27]/80 to-[#0f1117]">
				<div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
					<div className="flex items-center gap-4">
						<div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
							<svg className="w-5 h-5 text-indigo-400" viewBox="0 0 20 20" fill="none">
								<rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
								<rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
								<rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
								<rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
							</svg>
						</div>
						<div>
							<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">
								Todo space
							</p>
							<h2 className="mt-1 text-xl font-semibold tracking-tight text-white md:text-2xl">
								{board?.title ?? 'My Board'}
							</h2>
							<p className="mt-0.5 text-xs text-slate-500">{board?.description}</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onBackToDashboard}
						className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white flex items-center gap-2"
					>
						<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
							<path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
						Dashboard
					</button>
				</div>
			</div>

			{/* Board */}
			<Board />
		</div>
	);
}
