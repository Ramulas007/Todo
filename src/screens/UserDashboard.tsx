import { useState } from 'react'
import { useStore } from '../store/useStore'
import { useDashboardMetrics } from '../hooks/useDashboardMetrics'
import BlobBackground from '../components/BlobBackground'
import ProfilePanel from '../components/ProfilePanel'
import BackButton from '../components/BackButton'

export default function UserDashboard({
	user,
	onLogout,
	onOpenTodo,
	onOpenCalendar,
	onOpenToday,
}: {
	user: { id: string; name: string; email: string; team: string; title: string; role: string; accent: string }
	onLogout: () => void
	onOpenTodo: () => void
	onOpenCalendar?: () => void
	onOpenToday?: () => void
}) {
	const metrics = useDashboardMetrics()
	const xp = useStore((s) => s.xp)
	const level = useStore((s) => s.level)
	const streak = useStore((s) => s.streak)
	const totalCompleted = useStore((s) => s.totalCompleted)
	const [showProfile, setShowProfile] = useState(false)

	return (
		<div className="min-h-screen bg-[#0a0a12] text-white relative overflow-x-hidden">
			<BlobBackground />

			{/* Subtle GSAP blobs */}
			<div className="fixed top-[5%] right-[10%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-orange-500/10 to-amber-500/8 blur-[120px] pointer-events-none" />
			<div className="fixed bottom-[10%] left-[5%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/8 blur-[120px] pointer-events-none" />

			<div className="relative z-10">
				{/* Header */}
				<div className="glass border-b border-white/[0.06] rounded-none">
					<div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">
						<div className="flex items-center gap-3">
							<BackButton onClick={() => window.location.href = '/'} />
							<div>
								<p className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-medium">Dashboard</p>
								<h1 className="mt-1 text-2xl font-bold text-white">
									Welcome back, <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{user.name}</span>
								</h1>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<button type="button" onClick={onOpenToday}
								className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all">
								Today
							</button>
							<button type="button" onClick={onOpenTodo}
								className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-sm font-semibold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all">
								Open Board →
							</button>
							<button type="button" onClick={onLogout}
								className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all">
								Log out
							</button>
							<button type="button" onClick={() => setShowProfile(true)}
								className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all"
								title="Profile">
								{user.name.split(' ').map((n: string) => n[0]).join('')}
							</button>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="max-w-7xl mx-auto px-8 py-8">
					<div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
						{/* Main */}
						<div className="space-y-6">
							{/* Stats */}
							<div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
								{[
									{ label: 'Completed', value: `${metrics.velocity}`, detail: `Last 7 days`, color: 'text-emerald-400' },
									{ label: 'On-time', value: `${metrics.onTimeRate}%`, detail: `Avg ${metrics.avgTimeToComplete}`, color: 'text-blue-400' },
									{ label: 'In Progress', value: `${metrics.inProgressCards}`, detail: `of ${metrics.totalCards} total`, color: 'text-amber-400' },
									{ label: 'Completion', value: `${metrics.completionRate}%`, detail: `${metrics.doneCards} done`, color: 'text-purple-400' },
								].map((stat) => (
									<div key={stat.label} className="glass rounded-xl p-4 hover:bg-white/[0.06] transition-all">
										<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-2">{stat.label}</p>
										<p className={`text-2xl font-bold ${stat.color}`}>{metrics.isEmpty ? '—' : stat.value}</p>
										<p className="text-[11px] text-white/30 mt-1">{metrics.isEmpty ? 'No data' : stat.detail}</p>
									</div>
								))}
							</div>

							{/* Weekly Activity */}
							<div className="glass rounded-xl p-5">
								<div className="flex items-center justify-between mb-4">
									<div>
										<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium">Weekly Activity</p>
										<h2 className="text-lg font-semibold text-white mt-1">Your momentum</h2>
									</div>
									<div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
										Peak {Math.max(...metrics.weeklyActivity.map(d => d.value), 0)}
									</div>
								</div>
								<div className="grid h-32 grid-cols-7 items-end gap-2">
									{metrics.weeklyActivity.map((item) => (
										<div key={item.label} className="flex h-full flex-col justify-end gap-1">
											<div className="flex flex-1 items-end">
												<div className="w-full rounded-t bg-gradient-to-t from-blue-600/40 to-blue-400/60 transition-all duration-500"
													style={{ height: metrics.isEmpty ? '5%' : `${Math.max((item.value / Math.max(...metrics.weeklyActivity.map(d => d.value), 1)) * 100, 5)}%` }}
												/>
											</div>
											<p className="text-center text-[10px] text-white/30">{item.label}</p>
										</div>
									))}
								</div>
							</div>

							{/* Pipeline Health */}
							<div className="glass rounded-xl p-5">
								<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-4">Pipeline Health</p>
								<div className="space-y-3">
									{metrics.pipelineHealth.map((item) => (
										<div key={item.label}>
											<div className="flex items-center justify-between text-xs mb-1">
												<span className="text-white/60">{item.label}</span>
												<span className="text-white/30">{item.value}%</span>
											</div>
											<div className="h-1.5 rounded-full bg-white/5">
												<div className={`h-1.5 rounded-full ${item.tone} transition-all duration-500`} style={{ width: `${item.value}%` }} />
											</div>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Right Sidebar */}
						<div className="space-y-6">
							{/* Gamification */}
							{(streak > 0 || totalCompleted > 0) && (
								<div className="glass rounded-xl p-5">
									<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-3">Progress</p>
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-semibold text-white">Level {level}</span>
										{streak > 0 && <span className="text-xs text-amber-400">🔥 {streak} day streak</span>}
									</div>
									<div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
										<div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
											style={{ width: `${Math.min((xp % 3500) / 35, 100)}%` }} />
									</div>
									<p className="text-[11px] text-white/30 mt-2">{xp} XP · {totalCompleted} completed</p>
								</div>
							)}

							{/* Quick Actions */}
							<div className="glass rounded-xl p-5">
								<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-3">Quick Actions</p>
								<div className="space-y-2">
									{onOpenToday && (
										<button type="button" onClick={onOpenToday}
											className="w-full flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-all">
											<span>Today's plan</span>
											<span className="text-white/30">→</span>
										</button>
									)}
									<button type="button" onClick={onOpenTodo}
										className="w-full flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-all">
										<span>Open Board</span>
										<span className="text-white/30">→</span>
									</button>
									{onOpenCalendar && (
										<button type="button" onClick={onOpenCalendar}
											className="w-full flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-all">
											<span>Calendar</span>
											<span className="text-white/30">→</span>
										</button>
									)}
								</div>
							</div>

							{/* Recent Activity */}
							<div className="glass rounded-xl p-5">
								<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-3">Recent Activity</p>
								<div className="space-y-2">
									{metrics.recentActivity.length === 0 ? (
										<p className="text-xs text-white/30 text-center py-4">No activity yet</p>
									) : (
										metrics.recentActivity.map((activity, i) => (
											<div key={i} className="flex items-start gap-2 py-1.5">
												<span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${activity.color} shrink-0`} />
												<div className="flex-1 min-w-0">
													<p className="text-xs text-white/50 truncate">{activity.text}</p>
													<p className="text-[10px] text-white/25 mt-0.5">{activity.time}</p>
												</div>
											</div>
										))
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}
		</div>
	)
}