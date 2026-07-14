import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import type { User, UserRole } from '../types/board.types'

function formatCount(value: number) {
	return value.toString().padStart(2, '0')
}

export default function AdminPanel({
	adminUser,
	users,
	onUsersChange,
	onLogout,
}: {
	adminUser: User
	users: User[]
	onUsersChange: (users: User[]) => void
	onLogout: () => void
}) {
	const addUser = useStore((s) => s.addUser)
	const updateUser = useStore((s) => s.updateUser)
	const removeUser = useStore((s) => s.removeUser)
	const boards = useStore((s) => s.boards)

	const [selectedUserId, setSelectedUserId] = useState<string>(adminUser.id)
	const [draft, setDraft] = useState({
		name: '', email: '', password: '', role: 'member' as UserRole,
		title: '', team: '', accent: 'cyan' as string,
	})

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
		if (userId === adminUser.id) return // Can't delete self
		removeUser(userId)
		setSelectedUserId(users[0]?.id ?? 'new')
	}

	function startCreating() {
		setSelectedUserId('new')
		setDraft({ name: '', email: '', password: '', role: 'member', title: '', team: '', accent: 'cyan' })
	}

	const previewUser = selectedUser ?? {
		name: draft.name || 'New user', email: draft.email || 'email@example.com',
		role: draft.role, team: draft.team || '—', title: draft.title || '—',
	}

	return (
		<div className="min-h-screen bg-[#0f1117] text-slate-100">
			<header className="border-b border-white/5 bg-gradient-to-r from-[#1a1d27]/80 to-[#0f1117] backdrop-blur-xl">
				<div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 md:flex-row md:items-end md:justify-between">
					<div className="animate-page-enter">
						<p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">Admin panel</p>
						<h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">User management</h1>
						<p className="mt-1 max-w-2xl text-sm text-slate-400">Create, edit, and manage user accounts.</p>
					</div>
					<div className="flex items-center gap-3">
						<div className="rounded-xl border border-white/5 bg-white/3 px-4 py-2.5 text-right">
							<p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Signed in as</p>
							<p className="mt-1 text-xs font-medium text-white">{adminUser.email}</p>
						</div>
						<button type="button" onClick={onLogout}
							className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
						>Log out</button>
					</div>
				</div>
			</header>

			<main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 xl:grid-cols-[300px_minmax(0,1fr)]">
				<aside className="space-y-4">
					<div className="rounded-2xl border border-white/5 bg-[#151924] p-4 shadow-lg shadow-black/20">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">Users</p>
								<p className="mt-1 text-2xl font-bold text-white">{formatCount(users.length)}</p>
							</div>
							<button type="button" onClick={startCreating}
								className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/20"
							>+ New</button>
						</div>
					</div>

					<div className="space-y-2">
						{users.map((user) => {
							const isActive = user.id === selectedUserId
							const board = boards[`board-${user.id}`]
							const cardCount = board ? Object.keys(board.cards).length : 0
							return (
								<button key={user.id} type="button" onClick={() => setSelectedUserId(user.id)}
									className={`w-full rounded-xl border-l-[3px] border border-white/5 p-4 text-left transition-all duration-200 ${
										isActive ? 'border-l-indigo-500 bg-indigo-500/10 border-indigo-500/30'
											: 'border-l-transparent bg-[#151924] hover:border-white/10 hover:bg-white/3'
									}`}
								>
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
											{user.name.split(' ').map(n => n[0]).join('')}
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-medium text-white text-sm truncate">{user.name}</p>
											<p className="text-[11px] text-slate-500 truncate">{user.email}</p>
										</div>
										<div className="text-right shrink-0">
											<span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${
												user.role === 'admin' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-white/5 text-slate-500'
											}`}>{user.role}</span>
											<p className="text-[10px] text-slate-600 mt-1">{cardCount} cards</p>
										</div>
									</div>
								</button>
							)
						})}
					</div>
				</aside>

				<section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
					<div className="space-y-6 rounded-2xl border border-white/5 bg-[#151924] p-6 shadow-lg shadow-black/20">
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">
									{isCreating ? 'Create user' : 'Edit user'}
								</p>
								<h2 className="mt-1.5 text-xl font-semibold text-white">
									{selectedUser ? selectedUser.name : 'New account'}
								</h2>
							</div>
							{selectedUser && selectedUser.id !== adminUser.id && (
								<button type="button" onClick={() => handleDeleteUser(selectedUser.id)}
									className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-300 transition-all duration-200 hover:bg-rose-500/20"
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
									<span className="mb-2 block text-xs font-medium text-slate-400">{label}</span>
									<input type={type} value={(draft as any)[key]}
										onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
										className="w-full rounded-xl border border-white/5 bg-[#22263a] px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
									/>
								</label>
							))}
							<label className="block">
								<span className="mb-2 block text-xs font-medium text-slate-400">Role</span>
								<select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as UserRole })}
									className="w-full rounded-xl border border-white/5 bg-[#22263a] px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
								>
									<option value="member">Member</option>
									<option value="admin">Admin</option>
								</select>
							</label>
							<label className="block">
								<span className="mb-2 block text-xs font-medium text-slate-400">Accent</span>
								<select value={draft.accent} onChange={(e) => setDraft({ ...draft, accent: e.target.value })}
									className="w-full rounded-xl border border-white/5 bg-[#22263a] px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
								>
									<option value="cyan">Cyan</option>
									<option value="amber">Amber</option>
									<option value="emerald">Emerald</option>
									<option value="rose">Rose</option>
									<option value="violet">Violet</option>
								</select>
							</label>
							<div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
								{selectedUser && selectedUser.id !== adminUser.id && (
									<button type="button" onClick={() => handleDeleteUser(selectedUser.id)}
										className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-300 transition-all duration-200 hover:bg-rose-500/20"
									>Delete</button>
								)}
								<button type="submit"
									className="rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/20"
								>{isCreating ? 'Create user' : 'Save changes'}</button>
							</div>
						</form>
					</div>

					<aside className="space-y-6">
						<section className="rounded-2xl border border-white/5 bg-[#151924] p-5 shadow-lg shadow-black/20">
							<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">Account preview</p>
							<div className="mt-4 flex items-center gap-3 mb-4">
								<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white">
									{previewUser.name.split(' ').map((n: string) => n[0]).join('')}
								</div>
								<div>
									<p className="font-medium text-white">{previewUser.name}</p>
									<p className="text-xs text-slate-500">{previewUser.email}</p>
								</div>
							</div>
							<div className="space-y-2 text-sm">
								{[
									{ label: 'Role', value: previewUser.role },
									{ label: 'Team', value: previewUser.team },
									{ label: 'Title', value: previewUser.title },
								].map(({ label, value }) => (
									<div key={label} className="flex justify-between p-2 rounded-lg bg-black/20">
										<span className="text-slate-500">{label}</span>
										<span className="text-white capitalize">{value}</span>
									</div>
								))}
							</div>
						</section>

						{selectedUser && (
							<section className="rounded-2xl border border-white/5 bg-[#151924] p-5 shadow-lg shadow-black/20">
								<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">User's board</p>
								<div className="mt-4 space-y-2">
									{boards[`board-${selectedUser.id}`]?.lists.map((list) => {
										const count = list.cardIds.length
										return (
											<div key={list.id} className="flex items-center justify-between p-2 rounded-lg bg-black/20">
												<div className="flex items-center gap-2">
													<span className="w-2 h-2 rounded-full" style={{ backgroundColor: list.color }} />
													<span className="text-xs text-slate-300">{list.title}</span>
												</div>
												<span className="text-xs text-slate-500">{count}</span>
											</div>
										)
									})}
								</div>
							</section>
						)}
					</aside>
				</section>
			</main>
		</div>
	)
}
