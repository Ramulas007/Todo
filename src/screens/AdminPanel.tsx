import { useEffect, useState } from 'react'
import type { AppUser, UserDraft } from '../types/user.types'
import { blankUserDraft, buildUser } from '../data/mockUsers'
import { DashboardWidgetGrid } from './dashboardWidgets'

function formatCount(value: number) {
	return value.toString().padStart(2, '0')
}

export default function AdminPanel({
	adminUser,
	users,
	onUsersChange,
	onLogout,
}: {
	adminUser: AppUser
	users: AppUser[]
	onUsersChange: (users: AppUser[]) => void
	onLogout: () => void
}) {
	const [selectedUserId, setSelectedUserId] = useState<string>(adminUser.id)
	const [draft, setDraft] = useState<UserDraft>(blankUserDraft())

	const isCreating = selectedUserId === 'new'
	const selectedUser = isCreating
		? null
		: users.find((user) => user.id === selectedUserId) ?? null
	const previewUser = selectedUser ?? buildUser(draft)

	useEffect(() => {
		if (selectedUser) {
			setDraft({
				name: selectedUser.name,
				email: selectedUser.email,
				password: selectedUser.password,
				role: selectedUser.role,
				title: selectedUser.title,
				team: selectedUser.team,
				accent: selectedUser.accent,
			})
		}
	}, [selectedUserId])

	function syncSelection(nextUsers: AppUser[]) {
		onUsersChange(nextUsers)

		if (!nextUsers.length) {
			setSelectedUserId('')
			setDraft(blankUserDraft())
			return
		}

		const stillSelected = nextUsers.find((user) => user.id === selectedUserId)
		if (stillSelected) {
			return
		}

		setSelectedUserId(nextUsers[0].id)
	}

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()

		if (!draft.name.trim() || !draft.email.trim() || !draft.password.trim()) {
			return
		}

		if (selectedUser) {
			const nextUsers = users.map((user) =>
				user.id === selectedUser.id
					? {
						...user,
						name: draft.name.trim(),
						email: draft.email.trim().toLowerCase(),
						password: draft.password,
						role: draft.role,
						title: draft.title.trim(),
						team: draft.team.trim(),
						accent: draft.accent,
					}
					: user,
			)
			syncSelection(nextUsers)
			return
		}

		const createdUser = buildUser(draft)
		onUsersChange([...users, createdUser])
		setSelectedUserId(createdUser.id)
	}

	function handleDeleteUser(userId: string) {
		const nextUsers = users.filter((user) => user.id !== userId)
		syncSelection(nextUsers)
	}

	function startCreating() {
		setSelectedUserId('new')
		setDraft(blankUserDraft())
	}

	return (
		<div className="min-h-screen bg-[#0f1117] text-slate-100">
			<header className="border-b border-white/5 bg-white/3 backdrop-blur">
				<div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 md:flex-row md:items-end md:justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.24em] text-slate-500">
							Admin panel
						</p>
						<h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
							User management console
						</h1>
						<p className="mt-2 max-w-2xl text-sm text-slate-400">
							Create, edit, inspect, and remove accounts. The preview updates from the
							same mock data model the app uses at login.
						</p>
					</div>
					<div className="flex items-center gap-3">
						<div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
							<p className="text-xs uppercase tracking-[0.2em] text-slate-500">
								Signed in as
							</p>
							<p className="mt-1 text-sm font-medium text-white">{adminUser.email}</p>
						</div>
						<button
							type="button"
							onClick={onLogout}
							className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
						>
							Log out
						</button>
					</div>
				</div>
			</header>

			<main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 xl:grid-cols-[300px_minmax(0,1fr)]">
				<aside className="space-y-4">
					<div className="rounded-3xl border border-white/5 bg-[#151924] p-4 shadow-xl shadow-black/20">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
									Users
								</p>
								<p className="mt-1 text-2xl font-semibold text-white">{formatCount(users.length)}</p>
							</div>
							<button
								type="button"
								onClick={startCreating}
								className="rounded-xl bg-indigo-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
							>
								New user
							</button>
						</div>
					</div>

					<div className="space-y-3">
						{users.map((user) => {
							const isActive = user.id === selectedUserId
							return (
								<button
									key={user.id}
									type="button"
									onClick={() => setSelectedUserId(user.id)}
									className={`w-full rounded-2xl border p-4 text-left transition ${
										isActive
											? 'border-indigo-400/40 bg-indigo-500/10'
											: 'border-white/5 bg-[#151924] hover:border-white/10 hover:bg-white/3'
									}`}
								>
									<div className="flex items-center justify-between gap-3">
										<div>
											<p className="font-medium text-white">{user.name}</p>
											<p className="mt-1 text-xs text-slate-500">{user.email}</p>
										</div>
										<span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
											{user.role}
										</span>
									</div>
									<p className="mt-3 text-sm text-slate-400">{user.title}</p>
									<p className="mt-1 text-xs text-slate-500">{user.team}</p>
								</button>
							)
						})}
					</div>
				</aside>

				<section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
					<div className="space-y-6 rounded-3xl border border-white/5 bg-[#151924] p-6 shadow-xl shadow-black/20">
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
									{selectedUserId === 'new' || !selectedUser ? 'Create user' : 'Edit user'}
								</p>
								<h2 className="mt-2 text-2xl font-semibold text-white">
									{selectedUser ? selectedUser.name : 'New account'}
								</h2>
							</div>
							{selectedUser && selectedUser.id !== adminUser.id && (
								<button
									type="button"
									onClick={() => handleDeleteUser(selectedUser.id)}
									className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
								>
									Delete user
								</button>
							)}
						</div>

						<form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
							<label className="block">
								<span className="mb-1.5 block text-xs font-medium text-slate-400">Name</span>
								<input
									value={draft.name}
									onChange={(event) => setDraft({ ...draft, name: event.target.value })}
									className="w-full rounded-xl border border-white/5 bg-[#0f1117] px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-400/40"
								/>
							</label>

							<label className="block">
								<span className="mb-1.5 block text-xs font-medium text-slate-400">Email</span>
								<input
									value={draft.email}
									onChange={(event) => setDraft({ ...draft, email: event.target.value })}
									className="w-full rounded-xl border border-white/5 bg-[#0f1117] px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-400/40"
								/>
							</label>

							<label className="block">
								<span className="mb-1.5 block text-xs font-medium text-slate-400">Password</span>
								<input
									value={draft.password}
									onChange={(event) => setDraft({ ...draft, password: event.target.value })}
									className="w-full rounded-xl border border-white/5 bg-[#0f1117] px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-400/40"
								/>
							</label>

							<label className="block">
								<span className="mb-1.5 block text-xs font-medium text-slate-400">Role</span>
								<select
									value={draft.role}
									onChange={(event) =>
										setDraft({ ...draft, role: event.target.value === 'admin' ? 'admin' : 'user' })
									}
									className="w-full rounded-xl border border-white/5 bg-[#0f1117] px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-400/40"
								>
									<option value="user">user</option>
									<option value="admin">admin</option>
								</select>
							</label>

							<label className="block">
								<span className="mb-1.5 block text-xs font-medium text-slate-400">Title</span>
								<input
									value={draft.title}
									onChange={(event) => setDraft({ ...draft, title: event.target.value })}
									className="w-full rounded-xl border border-white/5 bg-[#0f1117] px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-400/40"
								/>
							</label>

							<label className="block">
								<span className="mb-1.5 block text-xs font-medium text-slate-400">Team</span>
								<input
									value={draft.team}
									onChange={(event) => setDraft({ ...draft, team: event.target.value })}
									className="w-full rounded-xl border border-white/5 bg-[#0f1117] px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-400/40"
								/>
							</label>

							<label className="block">
								<span className="mb-1.5 block text-xs font-medium text-slate-400">Accent</span>
								<select
									value={draft.accent}
									onChange={(event) =>
										setDraft({
											...draft,
											accent: event.target.value as UserDraft['accent'],
										})
									}
									className="w-full rounded-xl border border-white/5 bg-[#0f1117] px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-400/40"
								>
									<option value="cyan">cyan</option>
									<option value="amber">amber</option>
									<option value="emerald">emerald</option>
									<option value="rose">rose</option>
									<option value="violet">violet</option>
								</select>
							</label>

							<div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
								{selectedUser && selectedUser.id !== adminUser.id && (
									<button
										type="button"
										onClick={() => handleDeleteUser(selectedUser.id)}
										className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
									>
										Delete
									</button>
								)}
								<button
									type="submit"
									className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
								>
									{selectedUserId === 'new' || !selectedUser ? 'Create user' : 'Save changes'}
								</button>
							</div>
						</form>
					</div>

					<aside className="space-y-6">
						<section className="rounded-3xl border border-white/5 bg-[#151924] p-5 shadow-xl shadow-black/20">
							<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
								Selected account
							</p>
							<div className="mt-4 space-y-3 text-sm text-slate-300">
								<p><span className="text-slate-500">Name:</span> {previewUser.name}</p>
								<p><span className="text-slate-500">Email:</span> {previewUser.email}</p>
								<p><span className="text-slate-500">Role:</span> {previewUser.role}</p>
								<p><span className="text-slate-500">Team:</span> {previewUser.team}</p>
								<p><span className="text-slate-500">Title:</span> {previewUser.title}</p>
							</div>
						</section>

						<section className="rounded-3xl border border-white/5 bg-[#151924] p-5 shadow-xl shadow-black/20">
							<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
								Dashboard preview
							</p>
							<div className="mt-4">
								<DashboardWidgetGrid widgets={previewUser.widgets} compact />
							</div>
						</section>
					</aside>
				</section>
			</main>
		</div>
	)
}
