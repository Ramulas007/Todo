import type { AppUser, DashboardWidget } from '../types/user.types'

const activityBars = [
	{ label: 'Mon', value: 42 },
	{ label: 'Tue', value: 68 },
	{ label: 'Wed', value: 55 },
	{ label: 'Thu', value: 79 },
	{ label: 'Fri', value: 64 },
	{ label: 'Sat', value: 38 },
	{ label: 'Sun', value: 22 },
]

const pipeline = [
	{ label: 'Planning', value: 84, tone: 'bg-cyan-400' },
	{ label: 'Execution', value: 72, tone: 'bg-emerald-400' },
	{ label: 'Review', value: 58, tone: 'bg-amber-400' },
	{ label: 'Blocked', value: 18, tone: 'bg-rose-400' },
]

const highlightCards = [
	{ label: 'Velocity', value: '24 pts', detail: '+12% vs last week' },
	{ label: 'SLA', value: '96%', detail: 'Average response time 1.8h' },
	{ label: 'Focus', value: '4.6h', detail: 'Deep work hours per day' },
	{ label: 'Completion', value: '83%', detail: 'Planned items done' },
]

function getWidgetSummary(widget: DashboardWidget) {
	if (widget.type === 'stat') return widget.value
	if (widget.type === 'project') return `${widget.progress}%`
	if (widget.type === 'note') return widget.body.slice(0, 58)
	return `${widget.entries.length} updates`
}

function getAccentClass(accent: AppUser['accent']) {
	switch (accent) {
		case 'amber':
			return 'from-amber-400/25 to-amber-500/5 border-amber-400/20'
		case 'emerald':
			return 'from-emerald-400/25 to-emerald-500/5 border-emerald-400/20'
		case 'rose':
			return 'from-rose-400/25 to-rose-500/5 border-rose-400/20'
		case 'violet':
			return 'from-violet-400/25 to-violet-500/5 border-violet-400/20'
		default:
			return 'from-cyan-400/25 to-cyan-500/5 border-cyan-400/20'
	}
}

function Sparkline({ accent }: { accent: AppUser['accent'] }) {
	const stroke =
		accent === 'amber'
			? '#fbbf24'
			: accent === 'emerald'
				? '#34d399'
				: accent === 'rose'
					? '#fb7185'
					: accent === 'violet'
						? '#a78bfa'
						: '#22d3ee'

	return (
		<svg viewBox="0 0 240 72" className="h-18 w-full">
			<defs>
				<linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
					<stop offset="100%" stopColor={stroke} stopOpacity="0" />
				</linearGradient>
			</defs>
			<path
				d="M0 52 C20 46, 34 18, 56 26 S96 60, 120 40 S160 18, 184 30 S212 50, 240 22"
				fill="none"
				stroke={stroke}
				strokeWidth="3"
				strokeLinecap="round"
			/>
			<path
				d="M0 52 C20 46, 34 18, 56 26 S96 60, 120 40 S160 18, 184 30 S212 50, 240 22 L240 72 L0 72 Z"
				fill="url(#sparkFill)"
			/>
		</svg>
	)
}

export default function UserDashboard({
	user,
	onLogout,
	onOpenTodo,
}: {
	user: AppUser
	onLogout: () => void
	onOpenTodo: () => void
}) {
	const accentClass = getAccentClass(user.accent)

	return (
		<div className="min-h-screen bg-[#0f1117] text-slate-100">
			<div className="border-b border-white/5 bg-white/2 backdrop-blur">
				<div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
					<div className="max-w-3xl">
						<p className="text-xs uppercase tracking-[0.28em] text-slate-500">
							User dashboard
						</p>
						<h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
							Welcome back, {user.name}
						</h1>
						<p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
							A live overview of your workload, momentum, and current focus. Open the
							todo view when you want to jump back into tasks.
						</p>
					</div>
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={onOpenTodo}
							className="group rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-400/15"
						>
							Todo
							<span className="ml-2 inline-block transition group-hover:translate-x-0.5">→</span>
						</button>
						<button
							type="button"
							onClick={onLogout}
							className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
						>
							Log out
						</button>
					</div>
				</div>
			</div>

			<div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 xl:grid-cols-[1.25fr_0.95fr]">
				<div className="space-y-6">
					<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
						{highlightCards.map((card, index) => (
							<div
								key={card.label}
								className={`rounded-3xl border bg-[#151924] p-5 shadow-xl shadow-black/20 ${accentClass}`}
								style={{ animationDelay: `${index * 90}ms` }}
							>
								<p className="text-xs uppercase tracking-[0.24em] text-slate-500">
									{card.label}
								</p>
								<div className="mt-4 text-3xl font-semibold text-white">{card.value}</div>
								<p className="mt-2 text-sm text-slate-400">{card.detail}</p>
							</div>
						))}
					</section>

					<section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
						<div className="rounded-3xl border border-white/5 bg-[#151924] p-6 shadow-xl shadow-black/20">
							<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
								<div>
									<p className="text-xs uppercase tracking-[0.24em] text-slate-500">
										Weekly activity
									</p>
									<h2 className="mt-2 text-2xl font-semibold text-white">
										Momentum at a glance
									</h2>
								</div>
								<div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
									Peak focus 79%
								</div>
							</div>

							<div className="mt-6 grid h-60 grid-cols-7 items-end gap-3">
								{activityBars.map((item) => (
									<div key={item.label} className="flex h-full flex-col justify-end gap-3">
										<div className="flex flex-1 items-end">
											<div
												className="w-full rounded-t-2xl bg-linear-to-t from-cyan-500/20 to-cyan-300/80 shadow-[0_0_30px_rgba(34,211,238,0.18)]"
												style={{ height: `${item.value}%` }}
											/>
										</div>
										<p className="text-center text-xs text-slate-500">{item.label}</p>
									</div>
								))}
							</div>

							<div className="mt-6 grid gap-4 md:grid-cols-2">
								<div className="rounded-2xl border border-white/5 bg-black/20 p-4">
									<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
										Trend line
									</p>
									<Sparkline accent={user.accent} />
								</div>
								<div className="rounded-2xl border border-white/5 bg-black/20 p-4">
									<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
										Pipeline health
									</p>
									<div className="mt-4 space-y-4">
										{pipeline.map((item) => (
											<div key={item.label}>
												<div className="mb-2 flex items-center justify-between text-sm">
													<span className="text-slate-300">{item.label}</span>
													<span className="text-slate-500">{item.value}%</span>
												</div>
												<div className="h-2 rounded-full bg-white/8">
													<div className={`h-2 rounded-full ${item.tone}`} style={{ width: `${item.value}%` }} />
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>

						<div className="rounded-3xl border border-white/5 bg-[#151924] p-6 shadow-xl shadow-black/20">
							<p className="text-xs uppercase tracking-[0.24em] text-slate-500">
								Personal dashboard
							</p>
							<h2 className="mt-2 text-2xl font-semibold text-white">
								Your live snapshot
							</h2>
							<div className="mt-5 rounded-3xl border border-white/5 bg-linear-to-br from-white/8 to-white/3 p-5">
								<div className="flex items-center justify-between gap-4">
									<div>
										<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
											Current status
										</p>
										<h3 className="mt-2 text-xl font-semibold text-white">{user.title}</h3>
									</div>
									<div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
										<p className="text-xs uppercase tracking-[0.22em] text-slate-500">Accent</p>
										<p className="mt-1 text-sm font-medium capitalize text-white">{user.accent}</p>
									</div>
								</div>
								<div className="mt-6 grid gap-4 sm:grid-cols-2">
									<div className="rounded-2xl border border-white/5 bg-black/20 p-4">
										<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</p>
										<p className="mt-2 text-sm font-medium text-white">{user.email}</p>
									</div>
									<div className="rounded-2xl border border-white/5 bg-black/20 p-4">
										<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Team</p>
										<p className="mt-2 text-sm font-medium text-white">{user.team}</p>
									</div>
								</div>
							</div>
						</div>
					</section>

					<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
						{user.widgets.map((widget, index) => (
							<div
								key={widget.id}
								className="rounded-2xl border border-white/5 bg-[#151924] p-5 shadow-lg shadow-black/20"
								style={{ animationDelay: `${index * 70}ms` }}
							>
								<p className="text-xs uppercase tracking-[0.22em] text-slate-500">{widget.type}</p>
								<h3 className="mt-2 text-base font-semibold text-white">
									{widget.type === 'stat'
										? widget.label
										: widget.type === 'project'
											? widget.title
											: widget.type === 'note'
												? widget.title
												: widget.title}
								</h3>
								<p className="mt-3 text-sm leading-6 text-slate-400">{getWidgetSummary(widget)}</p>
							</div>
						))}
					</section>
				</div>

				<aside className="space-y-6">
					<section className="rounded-3xl border border-white/5 bg-[#151924] p-5 shadow-xl shadow-black/20">
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="text-xs uppercase tracking-[0.24em] text-slate-500">
									Profile
								</p>
								<h2 className="mt-2 text-2xl font-semibold text-white">{user.name}</h2>
							</div>
							<div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5" />
						</div>
						<div className="mt-5 space-y-4 text-sm text-slate-300">
							<div>
								<p className="text-slate-500">Role</p>
								<p className="mt-1 capitalize text-white">{user.role}</p>
							</div>
							<div>
								<p className="text-slate-500">Email</p>
								<p className="mt-1 text-white">{user.email}</p>
							</div>
							<div>
								<p className="text-slate-500">Team</p>
								<p className="mt-1 text-white">{user.team}</p>
							</div>
						</div>
					</section>

					<section className="rounded-3xl border border-white/5 bg-[#151924] p-5 shadow-xl shadow-black/20">
						<p className="text-xs uppercase tracking-[0.24em] text-slate-500">
							Quick actions
						</p>
						<div className="mt-4 space-y-3">
							<button
								type="button"
								onClick={onOpenTodo}
								className="flex w-full items-center justify-between rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-left text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/15"
							>
								<span>Open todo board</span>
								<span>→</span>
							</button>
							<div className="rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-slate-300">
								<p className="text-slate-500">Today</p>
								<p className="mt-2 leading-6">
									Focus on the highest value cards before switching to the board.
								</p>
							</div>
						</div>
					</section>
				</aside>
			</div>
		</div>
	)
}
