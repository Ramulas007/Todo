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

export interface TimeEntry {
	id: string
	date: string         // ISO datetime
	duration: number     // minutes
	description: string
	source: 'manual' | 'pomodoro'
}

export interface Comment {
	id: string
	authorId: string
	text: string
	createdAt: string   // ISO datetime
}

// ─── Sketch Canvas ──────────────────────────────────────────────────
export interface SketchElement {
	id: string
	type: 'pen' | 'rect' | 'circle' | 'line' | 'arrow' | 'text' | 'fill'
	points?: number[][]
	x?: number
	y?: number
	width?: number
	height?: number
	x2?: number
	y2?: number
	text?: string
	fill?: string
	stroke?: string
	strokeWidth?: number
	fontSize?: number
}

export interface SketchLayer {
	id: string
	name: string
	visible: boolean
	locked: boolean
	elements: SketchElement[]
}

export interface SketchData {
	width: number
	height: number
	layers: SketchLayer[]
}

// ─── Mind Map ───────────────────────────────────────────────────────
export interface MindMapNode {
	id: string
	x: number
	y: number
	text: string
	color?: string
}

export interface MindMapEdge {
	id: string
	from: string
	to: string
	label?: string
}

export interface MindMapData {
	nodes: MindMapNode[]
	edges: MindMapEdge[]
}

// ─── Habits ─────────────────────────────────────────────────────────
export interface Habit {
	id: string
	name: string
	icon: string
	color: string
	completedDates: string[]
	createdAt: string
}

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
	dueTime?: string // HH:mm — default 23:59 when only date is set
	assigneeId?: string
	tags?: string[]
	createdAt: string // ISO datetime
	updatedAt: string // ISO datetime
	completedAt?: string // ISO datetime — set when card fully done
	timeLimit?: number // minutes — auto-move to backlog when expired
	timeLimitStartedAt?: string // ISO datetime — when the timer started
	history: CardEvent[]
	timeEntries?: TimeEntry[]
	// Phase 7: Dependencies
	blockedBy?: string[]
	blocks?: string[]
	// Phase 8: Comments
	comments?: Comment[]
	// Ideas: Canvas + Mind Map
	sketchData?: SketchData
	mindMapData?: MindMapData
	// Personal: Journal
	journalEntry?: string
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
	// Personal: Habits + Journal
	habits?: Habit[]
	journalEntries?: Record<string, string> // keyed by date "2026-07-15"
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