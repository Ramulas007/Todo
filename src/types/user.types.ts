export type UserRole = 'admin' | 'user'
export type WidgetTone = 'cyan' | 'amber' | 'emerald' | 'rose' | 'violet'

export interface StatWidget {
	id: string
	type: 'stat'
	label: string
	value: string
	detail: string
	tone: WidgetTone
}

export interface ProjectWidget {
	id: string
	type: 'project'
	title: string
	progress: number
	status: string
	detail: string
	tone: WidgetTone
}

export interface NoteWidget {
	id: string
	type: 'note'
	title: string
	body: string
	tone: WidgetTone
}

export interface TimelineWidget {
	id: string
	type: 'timeline'
	title: string
	entries: string[]
	tone: WidgetTone
}

export type DashboardWidget = StatWidget | ProjectWidget | NoteWidget | TimelineWidget

export interface AppUser {
	id: string
	name: string
	email: string
	password: string
	role: UserRole
	title: string
	team: string
	accent: WidgetTone
	widgets: DashboardWidget[]
}

export interface UserDraft {
	name: string
	email: string
	password: string
	role: UserRole
	title: string
	team: string
	accent: WidgetTone
}
