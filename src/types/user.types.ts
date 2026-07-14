import type { WidgetTone, UserRole, DashboardWidget } from './board.types'

// Re-export for backward compatibility
export type { WidgetTone, UserRole, DashboardWidget }

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
