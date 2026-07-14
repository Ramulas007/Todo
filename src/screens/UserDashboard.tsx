import { useStore } from '../store/useStore'
import { useDashboardMetrics } from '../hooks/useDashboardMetrics'

export default function UserDashboard({
	user,
	onLogout,
	onOpenTodo,
	onOpenCalendar,
}: {
	user: { id: string; name: string; email: string; team: string; title: string; role: string; accent: string }
	onLogout: () => void
	onOpenTodo: () => void
	onOpenCalendar?: () => void
}) {
	const metrics = useDashboardMetrics()

	const accentBorder = {
		amber: 'border-l-amber-400/50',
		emerald: 'border-l-emerald-400/50',
		rose: 'border-l-rose-400/50',
		violet: 'border-l-violet-400/50',
		cyan: 'border-l-cyan-400/50',
	}[user.accent] ?? 'border-l-cyan-400/50'

	return (
		<div className="min-h-screen bg-[#0f1117] text-slate-100">
			{/* Header */}
			<div className="border-b border-white/5 bg-gradient-to-r from-[#1a1d27]/80 to-[#0f1117] backdrop-blur-xl">
				<div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
					<div className="max-w-3xl animate-page-enter">
						<p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">Dashboard</p>
						<h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
							Welcome back, <span className="gradient-text">{user.name}</span>
						</h1>
						<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
							Your workload overview at a glance. Jump into the board when you're ready.
						</p>
					</div>
					<div className="flex items-center gap-3">
						<button type="button" onClick={onOpenTodo}
							className="group rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2"
						>
							Open Board <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
						</button>
						<button type="button" onClick={onLogout}
							className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
						>Log out</button>
					</div>
				</div>
			</div>

			<div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 xl:grid-cols-[1.25fr_0.95fr]">
				<div className="space-y-6">
					{/* Stats */}
					<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
						{[
							{ label: 'Completed', value: `${metrics.velocity}`, detail: `Last 7 days · ${metrics.velocityDelta >= 0 ? '+' : ''}${metrics.velocityDelta}% vs prior`, icon: '📈' },
							{ label: 'On-time', value: `${metrics.onTimeRate}%`, detail: `Avg ${metrics.avgTimeToComplete} to complete`, icon: '⏱️' },
							{ label: 'In Progress', value: `${metrics.inProgressCards}`, detail: `of ${metrics.totalCards} total cards`, icon: '⚡' },
							{ label: 'Completion', value: `${metrics.completionRate}%`, detail: `${metrics.doneCards} of ${metrics.totalCards} cards done`, icon: '✅' },
						].map((card, index) => (
							<div key={card.label}
								className={`rounded-2xl border border-l-[3px] ${accentBorder} bg-[#151924] p-5 shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl animate-fade-in`}
								style={{ animationDelay: `${index * 80}ms` }}
							>
								<div className="flex items-center justify-between mb-3">
									<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">{card.label}</p>
									<span className="text-lg">{card.icon}</span>
								</div>
								<div className="text-2xl font-bold text-white">{metrics.isEmpty ? '—' : card.value}</div>
								<p className="mt-1.5 text-xs text-slate-400">{metrics.isEmpty ? 'No data yet' : card.detail}</p>
							</div>
						))}
					</section>

					{/* Charts */}
					<section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
						<div className="rounded-2xl border border-white/5 bg-[#151924] p-6 shadow-lg shadow-black/20">
							<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
								<div>
									<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">Weekly activity</p>
									<h2 className="mt-2 text-xl font-semibold text-white">Your momentum</h2>
								</div>
								<div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-400">
									Peak {Math.max(...metrics.weeklyActivity.map(d => d.value), 0)}
								</div>
							</div>
							<div className="mt-6 grid h-48 grid-cols-7 items-end gap-2">
								{metrics.weeklyActivity.map((item) => (
									<div key={item.label} className="flex h-full flex-col justify-end gap-2">
										<div className="flex flex-1 items-end">
											<div className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600/40 to-indigo-400/80 transition-all duration-500 hover:from-indigo-600/60 hover:to-indigo-400"
												style={{ height: metrics.isEmpty ? '5%' : `${Math.max((item.value / Math.max(...metrics.weeklyActivity.map(d => d.value), 1)) * 100, 5)}%` }}
											/>
										</div>
										<p className="text-center text-[10px] text-slate-500">{item.label}</p>
									</div>
								))}
							</div>
							<div className="mt-6 grid gap-4 md:grid-cols-2">
								<div className="rounded-xl border border-white/5 bg-black/20 p-4">
									<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">Trend (14 days)</p>
									<div className="mt-2 flex items-end gap-0.5 h-8">
										{metrics.trendLine.map((v, i) => (
											<div key={i} className="flex-1 rounded-t bg-indigo-400/60 transition-all duration-300"
												style={{ height: `${Math.max((v / Math.max(...metrics.trendLine, 1)) * 100, 8)}%` }}
											/>
										))}
									</div>
								</div>
								<div className="rounded-xl border border-white/5 bg-black/20 p-4">
									<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">Pipeline health</p>
									<div className="mt-3 space-y-3">
										{metrics.pipelineHealth.map((item) => (
											<div key={item.label}>
												<div className="mb-1 flex items-center justify-between text-xs">
													<span className="text-slate-300">{item.label}</span>
													<span className="text-slate-500">{item.value}%</span>
												</div>
												<div className="h-1.5 rounded-full bg-white/5">
													<div className={`h-1.5 rounded-full ${item.tone} transition-all duration-500`} style={{ width: `${item.value}%` }} />
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Profile */}
						<div className="rounded-2xl border border-white/5 bg-[#151924] p-6 shadow-lg shadow-black/20">
							<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">Profile</p>
							<div className="mt-4 flex items-center gap-4">
								<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-indigo-500/20">
									{user.name.split(' ').map((n: string) => n[0]).join('')}
								</div>
								<div>
									<h2 className="text-lg font-semibold text-white">{user.name}</h2>
									<p className="text-xs text-slate-400 capitalize">{user.role}</p>
								</div>
							</div>
							<div className="mt-5 space-y-3">
								<div className="rounded-xl bg-black/20 p-3">
									<p className="text-[10px] text-slate-500 uppercase tracking-wider">Email</p>
									<p className="mt-1 text-sm text-white">{user.email}</p>
								</div>
								<div className="rounded-xl bg-black/20 p-3">
									<p className="text-[10px] text-slate-500 uppercase tracking-wider">Team</p>
									<p className="mt-1 text-sm text-white">{user.team}</p>
								</div>
								<div className="rounded-xl bg-black/20 p-3">
									<p className="text-[10px] text-slate-500 uppercase tracking-wider">Title</p>
									<p className="mt-1 text-sm text-white">{user.title}</p>
								</div>
							</div>
						</div>
					</section>
				</div>

				{/* Sidebar */}
				<aside className="space-y-6">
					<section className="rounded-2xl border border-white/5 bg-[#151924] p-5 shadow-lg shadow-black/20">
						<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">Quick actions</p>
						<div className="mt-4 space-y-3">
							<button type="button" onClick={onOpenTodo}
								className="w-full flex items-center justify-between rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-4 py-3 text-left text-sm font-medium text-indigo-300 transition-all duration-200 hover:bg-indigo-500/15 hover:-translate-y-0.5"
							>
								<span>Open todo board</span>
								<span className="text-indigo-400">→</span>
							</button>
							{onOpenCalendar && (
								<button type="button" onClick={onOpenCalendar}
									className="w-full flex items-center justify-between rounded-xl bg-violet-500/10 border border-violet-500/20 px-4 py-3 text-left text-sm font-medium text-violet-300 transition-all duration-200 hover:bg-violet-500/15 hover:-translate-y-0.5"
								>
									<span>Open calendar</span>
									<span className="text-violet-400">→</span>
								</button>
							)}
							</button>
							<div className="rounded-xl border border-white/5 bg-black/20 p-4">
								<p className="text-[10px] text-slate-500 uppercase tracking-wider">Today's focus</p>
								<p className="mt-2 text-sm text-slate-300 leading-relaxed">
									{metrics.isEmpty ? 'Create your first card to get started.' : metrics.quickActionTip}
								</p>
							</div>
						</div>
					</section>

					<section className="rounded-2xl border border-white/5 bg-[#151924] p-5 shadow-lg shadow-black/20">
						<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">Recent activity</p>
						<div className="mt-4 space-y-3">
							{metrics.recentActivity.length === 0 ? (
								<p className="text-xs text-slate-500 text-center py-4">No activity yet</p>
							) : (
								metrics.recentActivity.map((activity, i) => (
									<div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/3 transition-colors">
										<span className={`mt-1.5 w-2 h-2 rounded-full ${activity.color} shrink-0`} />
										<div className="flex-1 min-w-0">
											<p className="text-xs text-slate-300 truncate">{activity.text}</p>
											<p className="text-[10px] text-slate-500 mt-0.5">{activity.time}</p>
										</div>
									</div>
								))
							)}
						</div>
					</section>
				</aside>
			</div>
		</div>
	)
}
