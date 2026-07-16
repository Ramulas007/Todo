import { useEffect, useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import type { User, UserRole, WidgetTone, Card } from '../types/board.types'
import BlobBackground from '../components/BlobBackground'
import CustomSelect from '../components/CustomSelect'
import BackButton from '../components/BackButton'
import Modal from '../components/Modal'
import TaskCard from './aura/TaskCard'

function formatCount(value: number) {
	return value.toString().padStart(2, '0')
}

function timeAgo(iso: string): string {
	const ms = Date.now() - new Date(iso).getTime()
	const mins = Math.floor(ms / 60000)
	if (mins < 1) return 'Just now'
	if (mins < 60) return `${mins}m ago`
	const hours = Math.floor(mins / 60)
	if (hours < 24) return `${hours}h ago`
	const days = Math.floor(hours / 24)
	return `${days}d ago`
}

type AdminTab = 'users' | 'boards' | 'activity'

export default function AdminPanel({
	adminUser,
	users,
	onLogout,
}: {
	adminUser: User
	users: User[]
	onLogout: () => void
}) {
	const addUser = useStore((s) => s.addUser)
	const updateUser = useStore((s) => s.updateUser)
	const removeUser = useStore((s) => s.removeUser)
	const boards = useStore((s) => s.boards)
	const setAdminImpersonate = useStore((s) => s.setAdminImpersonate)
	const addCard = useStore((s) => s.addCard)

	const [activeTab, setActiveTab] = useState<AdminTab>('boards')
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
	const [viewingBoardUserId, setViewingBoardUserId] = useState<string | null>(null)
	const [draft, setDraft] = useState({
		name: '', email: '', password: '', role: 'member' as UserRole,
		title: '', team: '', accent: 'cyan' as WidgetTone,
	})
	const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
	const [showAddCardModal, setShowAddCardModal] = useState(false)
	const [newCardListId, setNewCardListId] = useState<string>('')
	const [sortBy, setSortBy] = useState<'name' | 'overdue' | 'active'>('name')

	// Set impersonation when viewing another user's board
	useEffect(() => {
		if (viewingBoardUserId && viewingBoardUserId !== adminUser.id) {
			setAdminImpersonate(viewingBoardUserId)
		} else {
			setAdminImpersonate(null)
		}
		return () => setAdminImpersonate(null)
	}, [viewingBoardUserId, adminUser.id, setAdminImpersonate])

	const isCreating = selectedUserId === 'new'
	const selectedUser = isCreating ? null : users.find((u) => u.id === selectedUserId) ?? null

	useEffect(() => {
		if (selectedUser) {
			setDraft({
				name: selectedUser.name, email: selectedUser.email, password: selectedUser.password,
				role: selectedUser.role, title: selectedUser.title, team: selectedUser.team, accent: selectedUser.accent,
			})
		}
	}, [selectedUserId])

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (!draft.name.trim() || !draft.email.trim() || !draft.password.trim()) return

		if (selectedUser) {
			updateUser(selectedUser.id, {
				name: draft.name.trim(), email: draft.email.trim().toLowerCase(),
				password: draft.password, role: draft.role, title: draft.title.trim(),
				team: draft.team.trim(), accent: draft.accent,
			})
		} else {
			const newUser: User = {
				id: `user-${Date.now()}`, name: draft.name.trim(),
				email: draft.email.trim().toLowerCase(), password: draft.password,
				role: draft.role, title: draft.title.trim(), team: draft.team.trim(),
				accent: draft.accent,
			}
			addUser(newUser)
			setSelectedUserId(newUser.id)
		}
	}

	function handleDeleteUser(userId: string) {
		if (userId === adminUser.id) return
		removeUser(userId)
		setSelectedUserId(null)
		setViewingBoardUserId(null)
		setShowDeleteConfirm(null)
	}

	function startCreating() {
		setSelectedUserId('new')
		setDraft({ name: '', email: '', password: '', role: 'member', title: '', team: '', accent: 'cyan' })
	}

	// Workload data per user
	const workloadData = useMemo(() => {
		return users.map((user) => {
			const board = boards[`board-${user.id}`]
			if (!board) return { user, active: 0, overdue: 0, total: 0, done: 0 }
			const allCards = Object.values(board.cards)
			const active = allCards.filter((c) => !c.completedAt).length
			const today = new Date()
			today.setHours(0, 0, 0, 0)
			const overdue = allCards.filter((c) => !c.completedAt && c.dueDate && new Date(c.dueDate) < today).length
			const done = allCards.filter((c) => !!c.completedAt).length
			return { user, active, overdue, total: allCards.length, done }
		})
	}, [users, boards])

	// Sorted workload
	const sortedWorkload = useMemo(() => {
		const data = [...workloadData]
		if (sortBy === 'overdue') data.sort((a, b) => b.overdue - a.overdue)
		else if (sortBy === 'active') data.sort((a, b) => b.active - a.active)
		else data.sort((a, b) => a.user.name.localeCompare(b.user.name))
		return data
	}, [workloadData, sortBy])

	// Activity feed across all users
	const activityFeed = useMemo(() => {
		type FeedEvent = {
			userId: string
			userName: string
			type: string
			cardTitle: string
			timestamp: string
			description?: string
		}
		const events: FeedEvent[] = []
		users.forEach((user) => {
			const board = boards[`board-${user.id}`]
			if (!board) return
			Object.values(board.cards).forEach((card) => {
				card.history.forEach((event) => {
					const actor = users.find((u) => u.id === event.userId)
					events.push({
						userId: event.userId,
						userName: actor?.name ?? 'Unknown',
						type: event.type,
						cardTitle: card.title,
						timestamp: event.timestamp,
						description: event.description,
					})
				})
			})
		})
		events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
		return events.slice(0, 50)
	}, [users, boards])

	// Board view data
	const viewingBoard = viewingBoardUserId ? boards[`board-${viewingBoardUserId}`] : null
	const viewingUser = viewingBoardUserId ? users.find((u) => u.id === viewingBoardUserId) : null

	function handleOpenAddCard(listId: string) {
		setNewCardListId(listId)
		setShowAddCardModal(true)
	}

	function handleAddCard(title: string) {
		if (newCardListId && title.trim()) {
			addCard(newCardListId, title.trim())
		}
		setShowAddCardModal(false)
		setNewCardListId('')
	}

	return (
		<div className="min-h-screen bg-[#0a0a12] text-slate-100 relative overflow-x-hidden">
			<BlobBackground />
			<div className="fixed top-[5%] right-[10%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-orange-500/10 to-amber-500/8 blur-[120px] pointer-events-none" />
			<div className="fixed bottom-[10%] left-[5%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/8 blur-[120px] pointer-events-none" />

			<div className="relative z-10">
				<header className="glass border-b border-white/[0.06] rounded-none">
					<div className="mx-auto max-w-[1600px] px-6 py-5">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<BackButton onClick={() => window.location.href = '/dashboard'} />
								<div>
									<p className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-medium">Admin panel</p>
									<h1 className="mt-1 text-xl font-semibold tracking-tight text-white">
										{viewingBoard ? `${viewingUser?.name}'s Board` : 'Workspace Overview'}
									</h1>
								</div>
							</div>
							<div className="flex items-center gap-3">
								{viewingBoard && (
									<button type="button" onClick={() => setViewingBoardUserId(null)}
										className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/50 transition-all hover:text-white hover:bg-white/10">
										← Back to overview
									</button>
								)}
								<div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-right">
									<p className="text-[10px] uppercase tracking-[0.15em] text-white/30">Signed in as</p>
									<p className="mt-0.5 text-xs font-medium text-white">{adminUser.email}</p>
								</div>
								<button type="button" onClick={onLogout}
									className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/50 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
								>Log out</button>
							</div>
						</div>

						{/* Tabs */}
						{!viewingBoard && (
							<div className="flex items-center gap-1 mt-4">
								{(['boards', 'users', 'activity'] as AdminTab[]).map((tab) => (
									<button key={tab} type="button" onClick={() => setActiveTab(tab)}
										className={`px-4 py-2 rounded-xl text-xs font-medium transition-all capitalize
											${activeTab === tab
												? 'bg-white/10 text-white border border-white/10'
												: 'text-white/40 hover:text-white/60 hover:bg-white/5 border border-transparent'}`}
									>{tab}</button>
								))}
							</div>
						)}
					</div>
				</header>

				<main className="mx-auto max-w-[1600px] gap-6 px-6 py-6" style={{ display: 'grid', gridTemplateColumns: viewingBoard ? '1fr' : '280px 1fr' }}>
					{/* Left sidebar — user list */}
					{!viewingBoard && (
						<aside className="space-y-3">
							<div className="glass rounded-xl p-3">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">Users</p>
										<p className="mt-0.5 text-lg font-bold text-white">{formatCount(users.length)}</p>
									</div>
									<button type="button" onClick={startCreating}
										className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 transition-all hover:text-white hover:bg-white/10"
									>+ New</button>
								</div>
							</div>

							<div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
								{sortedWorkload.map(({ user, active, overdue }) => {
									const isSelected = user.id === selectedUserId
									return (
										<button key={user.id} type="button"
											onClick={() => { setSelectedUserId(user.id); if (activeTab === 'boards') setViewingBoardUserId(user.id) }}
											className={`w-full rounded-xl border-l-[3px] border p-3 text-left transition-all duration-200 ${
												isSelected ? 'border-l-indigo-500 bg-indigo-500/10 border-indigo-500/30'
													: 'border-l-transparent border-white/[0.06] glass hover:border-white/[0.12] hover:bg-white/[0.06]'
											}`}
										>
											<div className="flex items-center gap-2.5">
												<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
													{user.name.split(' ').map(n => n[0]).join('')}
												</div>
												<div className="flex-1 min-w-0">
													<p className="font-medium text-white text-xs truncate">{user.name}</p>
													<div className="flex items-center gap-2 mt-0.5">
														<span className="text-[10px] text-white/30">{active} active</span>
														{overdue > 0 && (
															<span className="text-[10px] text-red-400/70">{overdue} overdue</span>
														)}
													</div>
												</div>
												<span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-medium ${
													user.role === 'admin' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-white/5 text-white/30'
												}`}>{user.role}</span>
											</div>
										</button>
									)
								})}
							</div>
						</aside>
					)}

					{/* Right pane */}
					<section>
						{/* ─── BOARDS TAB: Workload Overview ───────────── */}
						{activeTab === 'boards' && !viewingBoard && (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h2 className="text-sm font-semibold text-white/70">Team Workload</h2>
									<div className="flex items-center gap-1">
										{(['name', 'overdue', 'active'] as const).map((s) => (
											<button key={s} type="button" onClick={() => setSortBy(s)}
												className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all capitalize
													${sortBy === s ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'}`}
											>{s}</button>
										))}
									</div>
								</div>

								<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
									{sortedWorkload.map(({ user, active, overdue, total, done }) => {
										const pct = total > 0 ? Math.round((done / total) * 100) : 0
										return (
											<button key={user.id} type="button" onClick={() => setViewingBoardUserId(user.id)}
												className="glass rounded-xl p-4 text-left hover:bg-white/[0.06] transition-all group"
											>
												<div className="flex items-center gap-2.5 mb-3">
													<div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
														{user.name.split(' ').map(n => n[0]).join('')}
													</div>
													<div className="min-w-0">
														<p className="font-medium text-white text-sm truncate">{user.name}</p>
														<p className="text-[10px] text-white/30 truncate">{user.title || user.team}</p>
													</div>
												</div>

												<div className="space-y-2">
													<div className="flex items-center justify-between">
														<span className="text-[10px] text-white/40">{active} active</span>
														{overdue > 0 && (
															<span className="text-[10px] text-red-400">{overdue} overdue</span>
														)}
													</div>
													<div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
														<div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
															style={{ width: `${pct}%` }} />
													</div>
													<div className="flex items-center justify-between">
														<span className="text-[10px] text-white/25">{done}/{total} done</span>
														<span className="text-[10px] text-white/25">{pct}%</span>
													</div>
												</div>

												<p className="mt-3 text-[10px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
													View board →
												</p>
											</button>
										)
									})}
								</div>
							</div>
						)}

						{/* ─── BOARDS TAB: Full Board View ─────────────── */}
						{viewingBoard && viewingUser && (
							<div className="space-y-4">
								<div className="flex items-center gap-3 mb-2">
									<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
										{viewingUser.name.split(' ').map(n => n[0]).join('')}
									</div>
									<div>
										<p className="text-sm font-medium text-white">{viewingUser.name}'s board</p>
										<p className="text-[10px] text-white/30">
											{Object.values(viewingBoard.cards).filter((c) => !c.completedAt).length} active cards
										</p>
									</div>
								</div>

								<div className="flex gap-3 overflow-x-auto pb-4">
									{viewingBoard.lists.map((list) => {
										const listCards = list.cardIds
											.map((id) => viewingBoard.cards[id])
											.filter(Boolean) as Card[]
										return (
											<div key={list.id} className="w-[260px] shrink-0">
												<div className="flex items-center justify-between mb-3">
													<div className="flex items-center gap-2">
														<div className="w-2 h-2 rounded-full" style={{ backgroundColor: list.color }} />
														<span className="text-xs font-medium text-white/70">{list.title}</span>
														<span className="text-[10px] text-white/30">{listCards.length}</span>
													</div>
													<button type="button" onClick={() => handleOpenAddCard(list.id)}
														className="text-[10px] text-white/30 hover:text-white/60 transition-colors">+</button>
												</div>
												<div className="space-y-2">
													{listCards.map((card) => (
														<TaskCard key={card.id} card={card} />
													))}
													{listCards.length === 0 && (
														<div className="rounded-xl border border-dashed border-white/10 p-4 text-center">
															<p className="text-[10px] text-white/20">No cards</p>
														</div>
													)}
												</div>
											</div>
										)
									})}
								</div>
							</div>
						)}

						{/* ─── USERS TAB ──────────────────────────────── */}
						{activeTab === 'users' && (
							<div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
								<div className="space-y-6 glass rounded-xl p-6">
									<div className="flex items-start justify-between gap-4">
										<div>
											<p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">
												{isCreating ? 'Create user' : 'Edit user'}
											</p>
											<h2 className="mt-1.5 text-xl font-semibold text-white">
												{selectedUser ? selectedUser.name : 'New account'}
											</h2>
										</div>
										{selectedUser && selectedUser.id !== adminUser.id && (
											<button type="button" onClick={() => setShowDeleteConfirm(selectedUser.id)}
												className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-300 transition-all hover:bg-rose-500/20"
											>Delete user</button>
										)}
									</div>

									<form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
										{[
											{ key: 'name', label: 'Name', type: 'text' },
											{ key: 'email', label: 'Email', type: 'email' },
											{ key: 'password', label: 'Password', type: 'text' },
											{ key: 'title', label: 'Title', type: 'text' },
											{ key: 'team', label: 'Team', type: 'text' },
										].map(({ key, label, type }) => (
											<label key={key} className="block">
												<span className="mb-2 block text-xs font-medium text-white/40">{label}</span>
												<input type={type} value={(draft as any)[key]}
													onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
													className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
												/>
											</label>
										))}
										<label className="block">
											<span className="mb-2 block text-xs font-medium text-white/40">Role</span>
											<CustomSelect
												value={draft.role}
												onChange={(v) => setDraft({ ...draft, role: v as UserRole })}
												options={[
													{ value: "member", label: "Member", icon: "👤" },
													{ value: "admin", label: "Admin", icon: "🛡️" },
												]}
											/>
										</label>
										<div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
											{selectedUser && selectedUser.id !== adminUser.id && (
												<button type="button" onClick={() => setShowDeleteConfirm(selectedUser.id)}
													className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-300 transition-all hover:bg-rose-500/20"
												>Delete</button>
											)}
											<button type="submit"
												className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-indigo-500/25"
											>{isCreating ? 'Create user' : 'Save changes'}</button>
										</div>
									</form>
								</div>

								<aside className="space-y-4">
									<section className="glass rounded-xl p-5">
										<p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">Account preview</p>
										<div className="mt-4 flex items-center gap-3 mb-4">
											<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white">
												{(selectedUser?.name || draft.name || 'N').split(' ').map((n: string) => n[0]).join('')}
											</div>
											<div>
												<p className="font-medium text-white">{selectedUser?.name || draft.name || 'New user'}</p>
												<p className="text-xs text-white/40">{selectedUser?.email || draft.email || 'email@example.com'}</p>
											</div>
										</div>
										<div className="space-y-2 text-sm">
											{[
												{ label: 'Role', value: selectedUser?.role || draft.role },
												{ label: 'Team', value: selectedUser?.team || draft.team || '—' },
												{ label: 'Title', value: selectedUser?.title || draft.title || '—' },
											].map(({ label, value }) => (
												<div key={label} className="flex justify-between p-2 rounded-lg bg-white/[0.03]">
													<span className="text-white/40">{label}</span>
													<span className="text-white capitalize">{value}</span>
												</div>
											))}
										</div>
										<div className="mt-3">
											<p className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-medium mb-2">Accent</p>
											<CustomSelect
												value={draft.accent}
												onChange={(v) => setDraft({ ...draft, accent: v as WidgetTone })}
												options={[
													{ value: "cyan", label: "Cyan", color: "#06b6d4" },
													{ value: "amber", label: "Amber", color: "#f59e0b" },
													{ value: "emerald", label: "Emerald", color: "#10b981" },
													{ value: "rose", label: "Rose", color: "#f43f5e" },
													{ value: "violet", label: "Violet", color: "#8b5cf6" },
												]}
											/>
										</div>
									</section>
								</aside>
							</div>
						)}

						{/* ─── ACTIVITY TAB ──────────────────────────── */}
						{activeTab === 'activity' && (
							<div className="glass rounded-xl p-6">
								<h2 className="text-sm font-semibold text-white/70 mb-4">Recent Activity</h2>
								{activityFeed.length === 0 ? (
									<p className="text-xs text-white/30 text-center py-8">No activity yet</p>
								) : (
									<div className="space-y-1">
										{activityFeed.map((event, idx) => {
											const eventColor: Record<string, string> = {
												completed: 'bg-emerald-400',
												moved: 'bg-amber-400',
												created: 'bg-blue-400',
												task_completed: 'bg-emerald-400',
												edited: 'bg-slate-400',
											}
											const eventLabel: Record<string, string> = {
												completed: 'completed',
												moved: 'moved',
												created: 'created',
												task_completed: 'completed a task in',
												edited: 'edited',
											}
											return (
												<div key={idx} className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors">
													<div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${eventColor[event.type] ?? 'bg-slate-400'}`} />
													<div className="flex-1 min-w-0">
														<p className="text-xs text-white/60">
															<span className="font-medium text-white/80">{event.userName}</span>
															{' '}{eventLabel[event.type] ?? event.type}{' '}
															<span className="text-white/80">"{event.cardTitle}"</span>
														</p>
														{event.description && (
															<p className="text-[10px] text-white/30 mt-0.5">{event.description}</p>
														)}
													</div>
													<span className="text-[10px] text-white/20 shrink-0">{timeAgo(event.timestamp)}</span>
												</div>
											)
										})}
									</div>
								)}
							</div>
						)}
					</section>
				</main>
			</div>

			{/* ─── Delete User Confirmation Modal ──────────────────── */}
			{showDeleteConfirm && (
				<Modal titleId="delete-user-confirm" onClose={() => setShowDeleteConfirm(null)}>
					<div className="flex items-center gap-3 mb-4">
						<div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
							<svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none">
								<path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>
						</div>
						<div>
							<h3 className="text-sm font-semibold text-white">Delete User</h3>
							<p className="text-[11px] text-white/40">This action cannot be undone</p>
						</div>
					</div>
					{(() => {
						const user = users.find((u) => u.id === showDeleteConfirm)
						const board = boards[`board-${showDeleteConfirm}`]
						const cardCount = board ? Object.keys(board.cards).length : 0
						return (
							<p className="text-xs text-white/50 mb-5 leading-relaxed">
								This will permanently delete <span className="text-white/80 font-medium">{user?.name}</span>
								{cardCount > 0 && ` and their ${cardCount} card${cardCount > 1 ? 's' : ''}`}
								.
							</p>
						)
					})()}
					<div className="flex items-center gap-2 justify-end">
						<button type="button" onClick={() => setShowDeleteConfirm(null)}
							className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all">
							Cancel
						</button>
						<button type="button" onClick={() => handleDeleteUser(showDeleteConfirm)}
							className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-all">
							Delete
						</button>
					</div>
				</Modal>
			)}

			{/* ─── Add Card Modal ──────────────────────────────────── */}
			{showAddCardModal && (
				<Modal titleId="add-card-modal" onClose={() => setShowAddCardModal(false)}>
					<h3 className="text-sm font-semibold text-white mb-3">Add Card</h3>
					<input
						type="text"
						autoFocus
						placeholder="Card title"
						onKeyDown={(e) => {
							if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
								handleAddCard((e.target as HTMLInputElement).value)
							}
							if (e.key === 'Escape') setShowAddCardModal(false)
						}}
						className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none transition-all focus:border-indigo-500/50"
					/>
					<div className="flex items-center gap-2 justify-end mt-4">
						<button type="button" onClick={() => setShowAddCardModal(false)}
							className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all">
							Cancel
						</button>
					</div>
				</Modal>
			)}
		</div>
	)
}
