// ─── User ────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'member'

export interface User {
	id: string
	name: string
	email: string
	password: string
	team: string
	title: string
	role: UserRole
	accent: WidgetTone
	avatarInitials?: string
}

// ─── Card events (for activity feed, velocity, trend) ────────────────
export type CardEventType =
	| 'created'
	| 'moved'
	| 'completed'
	| 'task_completed'
	| 'edited'

export interface CardEvent {
	type: CardEventType
	fromListId?: string
	toListId?: string
	timestamp: string // ISO datetime
	userId: string
	description?: string
}

// ─── Task (subtask / checklist item) ─────────────────────────────────
export interface Task {
	id: number | string
	title: string
	description: string
	isCompleted: boolean
	createdAt: string // ISO datetime
	completedAt?: string // ISO datetime
}

// ─── Card ────────────────────────────────────────────────────────────
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface Card {
	id: number | string
	title: string
	description: string
	tasks: Task[]
	position: number
	color: string
	// Extended fields (PRD 5.2)
	priority?: Priority
	dueDate?: string // ISO date
	assigneeId?: string
	tags?: string[]
	createdAt: string // ISO datetime
	updatedAt: string // ISO datetime
	completedAt?: string // ISO datetime — set when card fully done
	history: CardEvent[]
}

// ─── List (column) ───────────────────────────────────────────────────
export interface List {
	id: number | string
	title: string
	cardIds: (number | string)[]
	position: number
	color: string
	wipLimit?: number
}

// ─── Board ───────────────────────────────────────────────────────────
export interface Board {
	id: number | string
	ownerId: string
	title: string
	description: string
	lists: List[]
	cards: Record<string | number, Card>
}

// ─── Dashboard widget types (kept for admin panel preview) ───────────
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
