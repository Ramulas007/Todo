import type { AppUser, DashboardWidget, UserDraft } from '../types/user.types'

function createId(prefix: string) {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createDefaultWidgets(draft: UserDraft): DashboardWidget[] {
	return [
		{
			id: createId('stat'),
			type: 'stat',
			label: 'Open items',
			value: draft.role === 'admin' ? '8' : '4',
			detail: `${draft.name} is active in ${draft.team}.`,
			tone: draft.accent,
		},
		{
			id: createId('project'),
			type: 'project',
			title: draft.title,
			progress: draft.role === 'admin' ? 74 : 61,
			status: draft.role === 'admin' ? 'Reviewing team access' : 'On track',
			detail: `${draft.team} workstream`,
			tone: draft.accent,
		},
		{
			id: createId('note'),
			type: 'note',
			title: 'Focus note',
			body:
				draft.role === 'admin'
					? 'Review pending account changes and keep permissions aligned.'
					: 'Finish the current sprint items before moving to the next milestone.',
			tone: draft.accent,
		},
		{
			id: createId('timeline'),
			type: 'timeline',
			title: 'Recent activity',
			entries:
				draft.role === 'admin'
					? ['Checked user access', 'Reviewed dashboards', 'Queued new approvals']
					: ['Checked inbox', 'Updated work items', 'Prepared daily summary'],
			tone: draft.accent,
		},
	]
}

export function buildUser(draft: UserDraft, existing?: AppUser): AppUser {
	return {
		id: existing?.id ?? createId('user'),
		name: draft.name.trim(),
		email: draft.email.trim().toLowerCase(),
		password: draft.password,
		role: draft.role,
		title: draft.title.trim(),
		team: draft.team.trim(),
		accent: draft.accent,
		widgets: existing?.widgets ?? createDefaultWidgets(draft),
	}
}

export function blankUserDraft(): UserDraft {
	return {
		name: '',
		email: '',
		password: '',
		role: 'user',
		title: 'Team member',
		team: 'General',
		accent: 'cyan',
	}
}

export const seedUsers: AppUser[] = [
	buildUser(
		{
			name: 'Maya Chen',
			email: 'admin@workelo.test',
			password: 'Admin#2026',
			role: 'admin',
			title: 'Workspace administrator',
			team: 'Operations',
			accent: 'violet',
		},
		{
			id: 'user-admin-1',
			name: 'Maya Chen',
			email: 'admin@workelo.test',
			password: 'Admin#2026',
			role: 'admin',
			title: 'Workspace administrator',
			team: 'Operations',
			accent: 'violet',
			widgets: createDefaultWidgets({
				name: 'Maya Chen',
				email: 'admin@workelo.test',
				password: 'Admin#2026',
				role: 'admin',
				title: 'Workspace administrator',
				team: 'Operations',
				accent: 'violet',
			}),
		},
	),
	buildUser(
		{
			name: 'Ava Patel',
			email: 'ava@workelo.test',
			password: 'Ava#2026',
			role: 'user',
			title: 'Product designer',
			team: 'Design',
			accent: 'cyan',
		},
		{
			id: 'user-ava-1',
			name: 'Ava Patel',
			email: 'ava@workelo.test',
			password: 'Ava#2026',
			role: 'user',
			title: 'Product designer',
			team: 'Design',
			accent: 'cyan',
			widgets: createDefaultWidgets({
				name: 'Ava Patel',
				email: 'ava@workelo.test',
				password: 'Ava#2026',
				role: 'user',
				title: 'Product designer',
				team: 'Design',
				accent: 'cyan',
			}),
		},
	),
	buildUser(
		{
			name: 'Noah Reed',
			email: 'noah@workelo.test',
			password: 'Noah#2026',
			role: 'user',
			title: 'Frontend engineer',
			team: 'Engineering',
			accent: 'emerald',
		},
		{
			id: 'user-noah-1',
			name: 'Noah Reed',
			email: 'noah@workelo.test',
			password: 'Noah#2026',
			role: 'user',
			title: 'Frontend engineer',
			team: 'Engineering',
			accent: 'emerald',
			widgets: createDefaultWidgets({
				name: 'Noah Reed',
				email: 'noah@workelo.test',
				password: 'Noah#2026',
				role: 'user',
				title: 'Frontend engineer',
				team: 'Engineering',
				accent: 'emerald',
			}),
		},
	),
	buildUser(
		{
			name: 'Mia Gomez',
			email: 'mia@workelo.test',
			password: 'Mia#2026',
			role: 'user',
			title: 'Customer success lead',
			team: 'Support',
			accent: 'amber',
		},
		{
			id: 'user-mia-1',
			name: 'Mia Gomez',
			email: 'mia@workelo.test',
			password: 'Mia#2026',
			role: 'user',
			title: 'Customer success lead',
			team: 'Support',
			accent: 'amber',
			widgets: createDefaultWidgets({
				name: 'Mia Gomez',
				email: 'mia@workelo.test',
				password: 'Mia#2026',
				role: 'user',
				title: 'Customer success lead',
				team: 'Support',
				accent: 'amber',
			}),
		},
	),
]

export function authenticateUser(users: AppUser[], email: string, password: string) {
	const normalizedEmail = email.trim().toLowerCase()
	return (
		users.find(
			(user) => user.email === normalizedEmail && user.password === password,
		) ?? null
	)
}
