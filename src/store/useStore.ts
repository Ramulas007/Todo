import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Board, Card, List, User, TimeEntry } from '../types/board.types'

// ─── Helpers ─────────────────────────────────────────────────────────
function createId(prefix: string) {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function now() {
	return new Date().toISOString()
}

function daysAgo(n: number) {
	return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()
}

const MAX_HISTORY = 50

// ─── Store interface ─────────────────────────────────────────────────
export interface AppState {
	// Current user session
	currentUserId: string | null
	currentUser: User | null

	// Users
	users: User[]

	// Board (per-user — keyed by ownerId in production; single for now)
	boards: Record<string, Board>

	// Undo/Redo history
	history: Record<string, Board[]> // keyed by board owner ID
	historyIndex: Record<string, number>

	// ─── Auth actions ───────────────────────────────────────────────
	login: (email: string, password: string) => boolean
	googleLogin: (email: string, name: string, picture?: string) => boolean
	logout: () => void

	// ─── User management (admin) ────────────────────────────────────
	addUser: (user: User) => void
	updateUser: (id: string, updates: Partial<User>) => void
	removeUser: (id: string) => void

	// ─── Board actions ──────────────────────────────────────────────
	createCard: (listId: string, card: Omit<Card, 'history' | 'createdAt' | 'updatedAt'>) => void
	moveCard: (cardId: string, targetListId: string) => void
	completeTask: (cardId: string, taskId: string) => void
	updateCard: (cardId: string, updates: Partial<Card>) => void
	deleteCard: (cardId: string) => void

	// ─── List management ────────────────────────────────────────────
	addList: (title: string, color: string) => void
	updateList: (listId: string, updates: Partial<Pick<List, 'title' | 'color' | 'wipLimit'>>) => void
	deleteList: (listId: string) => void
	reorderLists: (sourceIndex: number, destIndex: number) => void

	// ─── Time tracking ─────────────────────────────────────────────
	logTime: (cardId: string, entry: Omit<TimeEntry, 'id'>) => void
	deleteTimeEntry: (cardId: string, entryId: string) => void

	// ─── Dependencies ──────────────────────────────────────────────
	linkCards: (cardId: string, dependsOnId: string) => void
	unlinkCards: (cardId: string, dependsOnId: string) => void

	// ─── Comments ──────────────────────────────────────────────────
	addComment: (cardId: string, text: string) => void
	deleteComment: (cardId: string, commentId: string) => void

	// ─── UI State (AuraTask) ──────────────────────────────────────
	selectedCardId: string | null
	activeView: string
	setActiveView: (view: string) => void
	openPanel: (cardId: string) => void
	closePanel: () => void

	// ─── Pomodoro (simplified) ────────────────────────────────────
	pomodoroSeconds: number
	pomodoroRunning: boolean
	pomodoroCardId: string | null
	startPomodoro: (cardId?: string) => void
	stopPomodoro: () => void

	// ─── Flat accessors (for AuraTask) ────────────────────────────
	addCard: (listId: string, title: string, priority?: string) => void
	toggleComplete: (cardId: string) => void

	// ─── History management ──────────────────────────────────────
	clearHistory: () => void
	deleteCards: (cardIds: string[]) => void

	// ─── Project: Work (Time Dashboard) ────────────────────────
	// (reads from card.timeEntries, no new actions needed)

	// ─── Project: Personal (Journal + Habits) ──────────────────
	setJournalEntry: (date: string, text: string) => void
	addHabit: (name: string, icon: string, color: string) => void
	removeHabit: (habitId: string) => void
	toggleHabitDay: (habitId: string, date: string) => void

	// ─── Project: Ideas (Sketch + Mind Map) ────────────────────
	saveSketch: (cardId: string, data: import('../types/board.types').SketchData) => void
	saveMindMap: (cardId: string, data: import('../types/board.types').MindMapData) => void

	// ─── Gamification ──────────────────────────────────────────────
	xp: number
	level: number
	streak: number
	lastCompletionDate: string | null
	totalCompleted: number
	addXp: (amount: number) => void
	updateStreak: () => void

	// ─── Undo/Redo ──────────────────────────────────────────────────
	undo: () => void
	redo: () => void
	canUndo: () => boolean
	canRedo: () => boolean

	// ─── Auto-backlog ────────────────────────────────────────────────
	moveExpiredToBacklog: () => void

	// ─── Selectors (derived) ────────────────────────────────────────
	getBoard: (ownerId?: string) => Board | undefined
	getCards: (ownerId?: string) => Card[]
	getCardsInList: (listId: string, ownerId?: string) => Card[]
}

// ─── Default board for a new user ────────────────────────────────────
function createDefaultBoard(userId: string): Board {
	const boardId = createId('board')
	return {
		id: boardId,
		ownerId: userId,
		title: 'My Board',
		description: 'A collaborative Kanban workspace.',
		lists: [
			{ id: 'list-1', title: 'To Do', color: '#e8f4fd', position: 0, cardIds: [], wipLimit: 10 },
			{ id: 'list-2', title: 'In Progress', color: '#fff8e6', position: 1, cardIds: [], wipLimit: 5 },
			{ id: 'list-3', title: 'Done', color: '#edf7ed', position: 2, cardIds: [] },
			{ id: 'list-4', title: 'Backlog', color: '#f3eefe', position: 3, cardIds: [] },
		],
		cards: {},
	}
}

// ─── Seed data ───────────────────────────────────────────────────────
const SEED_USERS: User[] = [
	{
		id: 'user-admin-1',
		name: 'Maya Chen',
		email: 'admin@workelo.test',
		password: 'Admin#2026',
		role: 'admin',
		title: 'Workspace administrator',
		team: 'Operations',
		accent: 'violet',
	},
	{
		id: 'user-ava-1',
		name: 'Ava Patel',
		email: 'ava@workelo.test',
		password: 'Ava#2026',
		role: 'member',
		title: 'Product designer',
		team: 'Design',
		accent: 'cyan',
	},
	{
		id: 'user-noah-1',
		name: 'Noah Reed',
		email: 'noah@workelo.test',
		password: 'Noah#2026',
		role: 'member',
		title: 'Frontend engineer',
		team: 'Engineering',
		accent: 'emerald',
	},
	{
		id: 'user-mia-1',
		name: 'Mia Gomez',
		email: 'mia@workelo.test',
		password: 'Mia#2026',
		role: 'member',
		title: 'Customer success lead',
		team: 'Support',
		accent: 'amber',
	},
]

function createSeedBoard(userId: string): Board {
	const boardId = `board-${userId}`

	const cards: Record<string, Card> = {
		'card-1': {
			id: 'card-1', title: 'Design system setup', description: 'Define color tokens, typography scale, and spacing units.',
			color: '#3b82f6', position: 0, priority: 'high', dueDate: daysAgo(-3), assigneeId: userId, tags: ['design'],
			tasks: [
				{ id: 'task-1', title: 'Pick primary font', description: 'Choose between Inter and Geist', isCompleted: true, createdAt: daysAgo(5), completedAt: daysAgo(4) },
				{ id: 'task-2', title: 'Define color palette', description: '5 neutrals + 2 accent colors', isCompleted: false, createdAt: daysAgo(5) },
			],
			createdAt: daysAgo(7), updatedAt: daysAgo(1), history: [
				{ type: 'created', timestamp: daysAgo(7), userId },
				{ type: 'moved', toListId: 'list-1', timestamp: daysAgo(7), userId },
				{ type: 'task_completed', timestamp: daysAgo(4), userId, description: 'Completed "Pick primary font"' },
			],
		},
		'card-2': {
			id: 'card-2', title: 'Set up Vite + React', description: 'Scaffold the project, install dependencies.',
			color: '#10b981', position: 1, priority: 'medium', dueDate: daysAgo(-1), assigneeId: userId,
			tasks: [
				{ id: 'task-3', title: 'Run create vite', description: 'Use react-ts template', isCompleted: true, createdAt: daysAgo(6), completedAt: daysAgo(5) },
				{ id: 'task-4', title: 'Install Zustand', description: 'npm install zustand', isCompleted: true, createdAt: daysAgo(6), completedAt: daysAgo(5) },
			],
			createdAt: daysAgo(8), updatedAt: daysAgo(5), completedAt: daysAgo(5),
			history: [
				{ type: 'created', timestamp: daysAgo(8), userId },
				{ type: 'moved', toListId: 'list-1', timestamp: daysAgo(8), userId },
				{ type: 'completed', toListId: 'list-3', timestamp: daysAgo(5), userId },
			],
		},
		'card-3': {
			id: 'card-3', title: 'Write TypeScript interfaces', description: 'Board, List, Card, Task interfaces.',
			color: '#14b8a6', position: 2, priority: 'medium',
			tasks: [
				{ id: 'task-5', title: 'Board interface', description: 'Includes lists array', isCompleted: true, createdAt: daysAgo(4), completedAt: daysAgo(3) },
				{ id: 'task-6', title: 'Card interface', description: 'Includes tasks and color', isCompleted: false, createdAt: daysAgo(4) },
			],
			createdAt: daysAgo(6), updatedAt: daysAgo(2),
			history: [
				{ type: 'created', timestamp: daysAgo(6), userId },
				{ type: 'moved', toListId: 'list-1', timestamp: daysAgo(6), userId },
			],
		},
		'card-4': {
			id: 'card-4', title: 'Build Zustand board store', description: 'Create the global store slice.',
			color: '#ef4444', position: 0, priority: 'high', dueDate: daysAgo(2), assigneeId: userId,
			tasks: [
				{ id: 'task-7', title: 'Create store file', description: 'src/store/index.ts', isCompleted: false, createdAt: daysAgo(10) },
				{ id: 'task-8', title: 'Load mock data', description: 'Seed store from mockData.ts', isCompleted: false, createdAt: daysAgo(10) },
			],
			createdAt: daysAgo(12), updatedAt: daysAgo(3),
			history: [
				{ type: 'created', timestamp: daysAgo(12), userId },
				{ type: 'moved', toListId: 'list-2', timestamp: daysAgo(3), userId },
			],
		},
		'card-5': {
			id: 'card-5', title: 'Render List columns', description: 'Map over lists, render each as a column.',
			color: '#6366f1', position: 1, priority: 'low',
			tasks: [
				{ id: 'task-9', title: 'List component', description: 'Takes list as prop', isCompleted: false, createdAt: daysAgo(2) },
				{ id: 'task-10', title: 'Board layout', description: 'Horizontal flex container', isCompleted: false, createdAt: daysAgo(2) },
			],
			createdAt: daysAgo(5), updatedAt: daysAgo(1),
			history: [
				{ type: 'created', timestamp: daysAgo(5), userId },
				{ type: 'moved', toListId: 'list-2', timestamp: daysAgo(1), userId },
			],
		},
		'card-6': {
			id: 'card-6', title: 'Render Cards inside Lists', description: 'Look up cards by cardIds, render vertically.',
			color: '#f59e0b', position: 2, priority: 'medium',
			tasks: [
				{ id: 'task-11', title: 'Card component', description: 'Title, description, task count', isCompleted: false, createdAt: daysAgo(9) },
			],
			createdAt: daysAgo(11), updatedAt: daysAgo(4),
			history: [
				{ type: 'created', timestamp: daysAgo(11), userId },
				{ type: 'moved', toListId: 'list-2', timestamp: daysAgo(4), userId },
			],
		},
		'card-7': {
			id: 'card-7', title: 'Inline editing', description: 'Click any text to edit. Blur or Enter saves.',
			color: '#10b981', position: 0, priority: 'low', completedAt: daysAgo(0),
			tasks: [
				{ id: 'task-12', title: 'useInlineEdit hook', description: 'Handles value, editing state', isCompleted: true, createdAt: daysAgo(1), completedAt: daysAgo(0) },
				{ id: 'task-13', title: 'Apply to card title', description: 'Click title → input', isCompleted: true, createdAt: daysAgo(1), completedAt: daysAgo(0) },
				{ id: 'task-14', title: 'Apply to list title', description: 'Same hook, list context', isCompleted: true, createdAt: daysAgo(1), completedAt: daysAgo(0) },
			],
			createdAt: daysAgo(3), updatedAt: daysAgo(0),
			history: [
				{ type: 'created', timestamp: daysAgo(3), userId },
				{ type: 'completed', toListId: 'list-3', timestamp: daysAgo(0), userId },
			],
		},
		'card-8': {
			id: 'card-8', title: 'Drag and drop cards', description: 'Reorder within list, move across lists.',
			color: '#10b981', position: 1, priority: 'medium', completedAt: daysAgo(1),
			tasks: [
				{ id: 'task-15', title: 'Install dnd-kit', description: 'npm install @dnd-kit/core', isCompleted: true, createdAt: daysAgo(2), completedAt: daysAgo(1) },
				{ id: 'task-16', title: 'Within-list reorder', description: 'SortableContext per list', isCompleted: true, createdAt: daysAgo(2), completedAt: daysAgo(1) },
				{ id: 'task-17', title: 'Cross-list move', description: 'DragOverlay + droppable', isCompleted: true, createdAt: daysAgo(2), completedAt: daysAgo(1) },
			],
			createdAt: daysAgo(4), updatedAt: daysAgo(1),
			history: [
				{ type: 'created', timestamp: daysAgo(4), userId },
				{ type: 'completed', toListId: 'list-3', timestamp: daysAgo(1), userId },
			],
		},
		'card-9': {
			id: 'card-9', title: 'Undo / Redo stack', description: 'Ctrl+Z restores, Ctrl+Y re-applies.',
			color: '#8b5cf6', position: 0, priority: 'low',
			tasks: [
				{ id: 'task-18', title: 'History slice', description: 'past[] and future[] arrays', isCompleted: false, createdAt: daysAgo(1) },
				{ id: 'task-19', title: 'pushSnapshot on mutations', description: 'Deep clone before change', isCompleted: false, createdAt: daysAgo(1) },
				{ id: 'task-20', title: 'Global keyboard listener', description: 'useEffect on keydown', isCompleted: false, createdAt: daysAgo(1) },
			],
			createdAt: daysAgo(2), updatedAt: daysAgo(1),
			history: [
				{ type: 'created', timestamp: daysAgo(2), userId },
				{ type: 'moved', toListId: 'list-4', timestamp: daysAgo(1), userId },
			],
		},
		'card-10': {
			id: 'card-10', title: 'Canvas mode', description: 'Toggle to free-form infinite canvas.',
			color: '#f43f5e', position: 1, priority: 'low',
			tasks: [
				{ id: 'task-21', title: 'Pan with spacebar + drag', description: 'Track viewport offset', isCompleted: false, createdAt: daysAgo(1) },
				{ id: 'task-22', title: 'Zoom with scroll wheel', description: 'Scale transform, clamped', isCompleted: false, createdAt: daysAgo(1) },
				{ id: 'task-23', title: 'CanvasCard component', description: 'Absolutely positioned', isCompleted: false, createdAt: daysAgo(1) },
			],
			createdAt: daysAgo(2), updatedAt: daysAgo(1),
			history: [
				{ type: 'created', timestamp: daysAgo(2), userId },
				{ type: 'moved', toListId: 'list-4', timestamp: daysAgo(1), userId },
			],
		},
	}

	return {
		id: boardId,
		ownerId: userId,
		title: 'Workello',
		description: 'A collaborative Kanban + Canvas workspace.',
		lists: [
			{ id: 'list-1', title: 'To Do', color: '#e8f4fd', position: 0, cardIds: ['card-1', 'card-3'], wipLimit: 10 },
			{ id: 'list-2', title: 'In Progress', color: '#fff8e6', position: 1, cardIds: ['card-4', 'card-5', 'card-6'], wipLimit: 5 },
			{ id: 'list-3', title: 'Done', color: '#edf7ed', position: 2, cardIds: ['card-2', 'card-7', 'card-8'] },
			{ id: 'list-4', title: 'Backlog', color: '#f3eefe', position: 3, cardIds: ['card-9', 'card-10'] },
		],
		cards,
	}
}

// ─── Initial state ───────────────────────────────────────────────────
const initialBoards: Record<string, Board> = {}
SEED_USERS.forEach((u) => {
	initialBoards[`board-${u.id}`] = createSeedBoard(u.id)
})

// ─── Store ───────────────────────────────────────────────────────────
export const useStore = create<AppState>()(
	persist(
		(set, get) => ({
			// Session
			currentUserId: null,
			currentUser: null,
			users: SEED_USERS,
			boards: initialBoards,

			// Undo/Redo history
			history: {},
			historyIndex: {},

			// Gamification
			xp: 0,
			level: 1,
			streak: 0,
			lastCompletionDate: null,
			totalCompleted: 0,

			// UI State (AuraTask)
			selectedCardId: null,
			activeView: "all",
			pomodoroSeconds: 25 * 60,
			pomodoroRunning: false,
			pomodoroCardId: null,

			// ─── Auth ─────────────────────────────────────────────────
			login: (email, password) => {
				const user = get().users.find(
					(u) => u.email === email.toLowerCase().trim() && u.password === password,
				)
				if (!user) return false
				set({ currentUserId: user.id, currentUser: user })
				return true
			},

			googleLogin: (email, name) => {
				const normalizedEmail = email.toLowerCase().trim()
				let user = get().users.find((u) => u.email === normalizedEmail)

				if (!user) {
					const newUser: User = {
						id: createId('user-google'),
						name,
						email: normalizedEmail,
						role: 'member',
						title: 'Team member',
						team: 'General',
						accent: 'cyan',
					}
					get().addUser(newUser)
					user = get().users.find((u) => u.email === normalizedEmail)!
				}

				set({ currentUserId: user.id, currentUser: user })
				return true
			},

			logout: () => {
				set({ currentUserId: null, currentUser: null })
			},

			// ─── User management ─────────────────────────────────────
			addUser: (user) => {
				set((s) => ({
					users: [...s.users, user],
					boards: { ...s.boards, [`board-${user.id}`]: createDefaultBoard(user.id) },
				}))
			},

			updateUser: (id, updates) => {
				set((s) => {
					const users = s.users.map((u) => (u.id === id ? { ...u, ...updates } : u))
					const currentUser = s.currentUserId === id ? users.find((u) => u.id === id) ?? null : s.currentUser
					return { users, currentUser }
				})
			},

			removeUser: (id) => {
				set((s) => {
					const users = s.users.filter((u) => u.id !== id)
					const boards = { ...s.boards }
					delete boards[`board-${id}`]
					const currentUser = s.currentUserId === id ? null : s.currentUser
					const currentUserId = s.currentUserId === id ? null : s.currentUserId
					return { users, boards, currentUser, currentUserId }
				})
			},

			// ─── Board actions ───────────────────────────────────────
			createCard: (listId, cardData) => {
				const { currentUserId } = get()
				if (!currentUserId) return

				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return

				// Push to history before mutation
				const history = get().history
				const historyIndex = get().historyIndex
				const boardHistory = history[currentUserId] ?? []
				const currentIndex = historyIndex[currentUserId] ?? -1
				const newHistory = [...boardHistory.slice(0, currentIndex + 1), board].slice(-MAX_HISTORY)

				const cardId = createId('card')
				const ts = now()
				const card: Card = {
					...cardData,
					id: cardId,
					createdAt: ts,
					updatedAt: ts,
					history: [{ type: 'created', timestamp: ts, userId: currentUserId }],
				}

				const lists = board.lists.map((l) =>
					l.id === listId ? { ...l, cardIds: [...l.cardIds, cardId] } : l,
				)

				set({
					boards: {
						...get().boards,
						[boardKey]: { ...board, lists, cards: { ...board.cards, [cardId]: card } },
					},
					history: { ...history, [currentUserId]: newHistory },
					historyIndex: { ...historyIndex, [currentUserId]: newHistory.length - 1 },
				})
			},

			moveCard: (cardId, targetListId) => {
				const { currentUserId } = get()
				if (!currentUserId) return

				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return

				// Push to history before mutation
				const history = get().history
				const historyIndex = get().historyIndex
				const boardHistory = history[currentUserId] ?? []
				const currentIndex = historyIndex[currentUserId] ?? -1
				const newHistory = [...boardHistory.slice(0, currentIndex + 1), board].slice(-MAX_HISTORY)

				// Dynamic lookup — no hardcoded IDs
				const doneListId = board.lists.find((l) => l.title === 'Done')?.id
				const isMovingToDone = doneListId && targetListId === doneListId

				const ts = now()
				const lists = board.lists.map((l) => {
					if (l.cardIds.includes(cardId)) {
						return { ...l, cardIds: l.cardIds.filter((id) => id !== cardId) }
					}
					if (l.id === targetListId) {
						return { ...l, cardIds: [...l.cardIds, cardId] }
					}
					return l
				})

				const card = board.cards[cardId]
				if (card) {
					const fromListId = board.lists.find((l) => l.cardIds.includes(cardId))?.id as string | undefined
					const updatedCard: Card = {
						...card,
						updatedAt: ts,
						completedAt: isMovingToDone ? ts : card.completedAt,
						history: [
							...card.history,
							{
								type: isMovingToDone ? 'completed' : 'moved',
								fromListId,
								toListId: targetListId,
								timestamp: ts,
								userId: currentUserId,
							},
						],
					}

					set({
						boards: {
							...get().boards,
							[boardKey]: { ...board, lists, cards: { ...board.cards, [cardId]: updatedCard } },
						},
						history: { ...history, [currentUserId]: newHistory },
						historyIndex: { ...historyIndex, [currentUserId]: newHistory.length - 1 },
					})
				}
			},

			completeTask: (cardId, taskId) => {
				const { currentUserId } = get()
				if (!currentUserId) return

				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return

				const card = board.cards[cardId]
				if (!card) return

				// Push to history before mutation
				const history = get().history
				const historyIndex = get().historyIndex
				const boardHistory = history[currentUserId] ?? []
				const currentIndex = historyIndex[currentUserId] ?? -1
				const newHistory = [...boardHistory.slice(0, currentIndex + 1), board].slice(-MAX_HISTORY)

				// Dynamic lookup
				const doneListId = board.lists.find((l) => l.title === 'Done')?.id

				const ts = now()
				const task = card.tasks.find((t) => t.id === taskId)
				if (!task || task.isCompleted) return

				const tasks = card.tasks.map((t) =>
					t.id === taskId ? { ...t, isCompleted: true, completedAt: ts } : t,
				)

				const allDone = tasks.length > 0 && tasks.every((t) => t.isCompleted)
				const updatedCard: Card = {
					...card,
					tasks,
					updatedAt: ts,
					completedAt: allDone ? ts : undefined,
					history: [
						...card.history,
						{ type: 'task_completed', timestamp: ts, userId: currentUserId, description: `Completed "${task.title}"` },
						...(allDone && doneListId ? [{ type: 'completed' as const, toListId: doneListId, timestamp: ts, userId: currentUserId }] : []),
					],
				}

				// If all tasks done, move card to Done list
				let lists = board.lists
				if (allDone && doneListId) {
					lists = board.lists.map((l) => {
						if (l.cardIds.includes(cardId)) {
							return { ...l, cardIds: l.cardIds.filter((id) => id !== cardId) }
						}
						if (l.id === doneListId) {
							return { ...l, cardIds: [...l.cardIds, cardId] }
						}
						return l
					})
				}

				set({
					boards: {
						...get().boards,
						[boardKey]: { ...board, lists, cards: { ...board.cards, [cardId]: updatedCard } },
					},
					history: { ...history, [currentUserId]: newHistory },
					historyIndex: { ...historyIndex, [currentUserId]: newHistory.length - 1 },
				})
			},

			updateCard: (cardId, updates) => {
				const { currentUserId } = get()
				if (!currentUserId) return

				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return

				const card = board.cards[cardId]
				if (!card) return

				// Push to history before mutation
				const history = get().history
				const historyIndex = get().historyIndex
				const boardHistory = history[currentUserId] ?? []
				const currentIndex = historyIndex[currentUserId] ?? -1
				const newHistory = [...boardHistory.slice(0, currentIndex + 1), board].slice(-MAX_HISTORY)

				const ts = now()
				const updatedCard: Card = {
					...card,
					...updates,
					updatedAt: ts,
					history: [
						...card.history,
						{ type: 'edited', timestamp: ts, userId: currentUserId },
					],
				}

				set({
					boards: {
						...get().boards,
						[boardKey]: { ...board, cards: { ...board.cards, [cardId]: updatedCard } },
					},
					history: { ...history, [currentUserId]: newHistory },
					historyIndex: { ...historyIndex, [currentUserId]: newHistory.length - 1 },
				})
			},

			deleteCard: (cardId) => {
				const { currentUserId } = get()
				if (!currentUserId) return

				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return

				// Push to history before mutation
				const history = get().history
				const historyIndex = get().historyIndex
				const boardHistory = history[currentUserId] ?? []
				const currentIndex = historyIndex[currentUserId] ?? -1
				const newHistory = [...boardHistory.slice(0, currentIndex + 1), board].slice(-MAX_HISTORY)

				const lists = board.lists.map((l) => ({
					...l,
					cardIds: l.cardIds.filter((id) => id !== cardId),
				}))

				const cards = { ...board.cards }
				delete cards[cardId]

				// Clean up dangling dependency references on other cards
				Object.values(cards).forEach((c) => {
					if (c.blockedBy) c.blockedBy = c.blockedBy.filter((id) => id !== cardId)
					if (c.blocks) c.blocks = c.blocks.filter((id) => id !== cardId)
				})

				set({
					boards: { ...get().boards, [boardKey]: { ...board, lists, cards } },
					history: { ...history, [currentUserId]: newHistory },
					historyIndex: { ...historyIndex, [currentUserId]: newHistory.length - 1 },
				})
			},

			// ─── List management ─────────────────────────────────────
			addList: (title, color) => {
				const { currentUserId } = get()
				if (!currentUserId) return

				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return

				const history = get().history
				const historyIndex = get().historyIndex
				const boardHistory = history[currentUserId] ?? []
				const currentIndex = historyIndex[currentUserId] ?? -1
				const newHistory = [...boardHistory.slice(0, currentIndex + 1), board].slice(-MAX_HISTORY)

				const newList: List = {
					id: createId('list'),
					title,
					color,
					cardIds: [],
					position: board.lists.length,
				}

				set({
					boards: {
						...get().boards,
						[boardKey]: { ...board, lists: [...board.lists, newList] },
					},
					history: { ...history, [currentUserId]: newHistory },
					historyIndex: { ...historyIndex, [currentUserId]: newHistory.length - 1 },
				})
			},

			updateList: (listId, updates) => {
				const { currentUserId } = get()
				if (!currentUserId) return

				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return

				const history = get().history
				const historyIndex = get().historyIndex
				const boardHistory = history[currentUserId] ?? []
				const currentIndex = historyIndex[currentUserId] ?? -1
				const newHistory = [...boardHistory.slice(0, currentIndex + 1), board].slice(-MAX_HISTORY)

				const lists = board.lists.map((l) =>
					l.id === listId ? { ...l, ...updates } : l,
				)

				set({
					boards: { ...get().boards, [boardKey]: { ...board, lists } },
					history: { ...history, [currentUserId]: newHistory },
					historyIndex: { ...historyIndex, [currentUserId]: newHistory.length - 1 },
				})
			},

			deleteList: (listId) => {
				const { currentUserId } = get()
				if (!currentUserId) return

				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board || board.lists.length <= 1) return

				const history = get().history
				const historyIndex = get().historyIndex
				const boardHistory = history[currentUserId] ?? []
				const currentIndex = historyIndex[currentUserId] ?? -1
				const newHistory = [...boardHistory.slice(0, currentIndex + 1), board].slice(-MAX_HISTORY)

				const deletedIdx = board.lists.findIndex((l) => l.id === listId)
				const deletedList = board.lists[deletedIdx]
				// Target the next list, or previous if deleting the last one
				const targetIdx = deletedIdx < board.lists.length - 1 ? deletedIdx + 1 : deletedIdx - 1
				const targetListId = board.lists[targetIdx]?.id

				const lists = board.lists
					.filter((l) => l.id !== listId)
					.map((l, i) => {
						if (l.id === targetListId && deletedList) {
							return { ...l, cardIds: [...l.cardIds, ...deletedList.cardIds], position: i }
						}
						return { ...l, position: i }
					})

				set({
					boards: { ...get().boards, [boardKey]: { ...board, lists } },
					history: { ...history, [currentUserId]: newHistory },
					historyIndex: { ...historyIndex, [currentUserId]: newHistory.length - 1 },
				})
			},

			reorderLists: (sourceIndex, destIndex) => {
				const { currentUserId } = get()
				if (!currentUserId) return

				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return

				const history = get().history
				const historyIndex = get().historyIndex
				const boardHistory = history[currentUserId] ?? []
				const currentIndex = historyIndex[currentUserId] ?? -1
				const newHistory = [...boardHistory.slice(0, currentIndex + 1), board].slice(-MAX_HISTORY)

				const lists = [...board.lists]
				const [moved] = lists.splice(sourceIndex, 1)
				lists.splice(destIndex, 0, moved)
				const reordered = lists.map((l, i) => ({ ...l, position: i }))

				set({
					boards: { ...get().boards, [boardKey]: { ...board, lists: reordered } },
					history: { ...history, [currentUserId]: newHistory },
					historyIndex: { ...historyIndex, [currentUserId]: newHistory.length - 1 },
				})
			},

			// ─── Time tracking ─────────────────────────────────────────
			logTime: (cardId, entry) => {
				const { currentUserId } = get()
				if (!currentUserId) return

				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return

				const card = board.cards[cardId]
				if (!card) return

				// Push to history before mutation
				const history = get().history
				const historyIndex = get().historyIndex
				const boardHistory = history[currentUserId] ?? []
				const currentIndex = historyIndex[currentUserId] ?? -1
				const newHistory = [...boardHistory.slice(0, currentIndex + 1), board].slice(-MAX_HISTORY)

				const newEntry: TimeEntry = {
					...entry,
					id: createId('time'),
				}

				const updatedCard: Card = {
					...card,
					timeEntries: [...(card.timeEntries ?? []), newEntry],
					updatedAt: now(),
				}

				set({
					boards: {
						...get().boards,
						[boardKey]: { ...board, cards: { ...board.cards, [cardId]: updatedCard } },
					},
					history: { ...history, [currentUserId]: newHistory },
					historyIndex: { ...historyIndex, [currentUserId]: newHistory.length - 1 },
				})
			},

			deleteTimeEntry: (cardId, entryId) => {
				const { currentUserId } = get()
				if (!currentUserId) return

				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return

				const card = board.cards[cardId]
				if (!card) return

				// Push to history before mutation
				const history = get().history
				const historyIndex = get().historyIndex
				const boardHistory = history[currentUserId] ?? []
				const currentIndex = historyIndex[currentUserId] ?? -1
				const newHistory = [...boardHistory.slice(0, currentIndex + 1), board].slice(-MAX_HISTORY)

				const updatedCard: Card = {
					...card,
					timeEntries: (card.timeEntries ?? []).filter((e) => e.id !== entryId),
					updatedAt: now(),
				}

				set({
					boards: {
						...get().boards,
						[boardKey]: { ...board, cards: { ...board.cards, [cardId]: updatedCard } },
					},
					history: { ...history, [currentUserId]: newHistory },
					historyIndex: { ...historyIndex, [currentUserId]: newHistory.length - 1 },
				})
			},

			// ─── Dependencies ─────────────────────────────────────────
			linkCards: (cardId, dependsOnId) => {
				const { currentUserId } = get()
				if (!currentUserId) return

				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return

				const card = board.cards[cardId]
				const blocker = board.cards[dependsOnId]
				if (!card || !blocker) return
				if (cardId === dependsOnId) return
				if ((card.blockedBy ?? []).includes(dependsOnId)) return

				// Push to history before mutation
				const history = get().history
				const historyIndex = get().historyIndex
				const boardHistory = history[currentUserId] ?? []
				const currentIndex = historyIndex[currentUserId] ?? -1
				const newHistory = [...boardHistory.slice(0, currentIndex + 1), board].slice(-MAX_HISTORY)

				const updatedCard: Card = {
					...card,
					blockedBy: [...(card.blockedBy ?? []), dependsOnId],
					updatedAt: now(),
				}
				const updatedBlocker: Card = {
					...blocker,
					blocks: [...(blocker.blocks ?? []), cardId],
					updatedAt: now(),
				}

				set({
					boards: {
						...get().boards,
						[boardKey]: {
							...board,
							cards: {
								...board.cards,
								[cardId]: updatedCard,
								[dependsOnId]: updatedBlocker,
							},
						},
					},
					history: { ...history, [currentUserId]: newHistory },
					historyIndex: { ...historyIndex, [currentUserId]: newHistory.length - 1 },
				})
			},

			unlinkCards: (cardId, dependsOnId) => {
				const { currentUserId } = get()
				if (!currentUserId) return

				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return

				const card = board.cards[cardId]
				const blocker = board.cards[dependsOnId]
				if (!card || !blocker) return

				// Push to history before mutation
				const history = get().history
				const historyIndex = get().historyIndex
				const boardHistory = history[currentUserId] ?? []
				const currentIndex = historyIndex[currentUserId] ?? -1
				const newHistory = [...boardHistory.slice(0, currentIndex + 1), board].slice(-MAX_HISTORY)

				const updatedCard: Card = {
					...card,
					blockedBy: (card.blockedBy ?? []).filter((id) => id !== dependsOnId),
					updatedAt: now(),
				}
				const updatedBlocker: Card = {
					...blocker,
					blocks: (blocker.blocks ?? []).filter((id) => id !== cardId),
					updatedAt: now(),
				}

				set({
					boards: {
						...get().boards,
						[boardKey]: {
							...board,
							cards: {
								...board.cards,
								[cardId]: updatedCard,
								[dependsOnId]: updatedBlocker,
							},
						},
					},
					history: { ...history, [currentUserId]: newHistory },
					historyIndex: { ...historyIndex, [currentUserId]: newHistory.length - 1 },
				})
			},

			// ─── Comments ─────────────────────────────────────────────
			addComment: (cardId, text) => {
				const { currentUserId } = get()
				if (!currentUserId) return

				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return

				const card = board.cards[cardId]
				if (!card) return

				// Push to history before mutation
				const history = get().history
				const historyIndex = get().historyIndex
				const boardHistory = history[currentUserId] ?? []
				const currentIndex = historyIndex[currentUserId] ?? -1
				const newHistory = [...boardHistory.slice(0, currentIndex + 1), board].slice(-MAX_HISTORY)

				const newComment = {
					id: createId('comment'),
					authorId: currentUserId,
					text,
					createdAt: now(),
				}

				const updatedCard: Card = {
					...card,
					comments: [...(card.comments ?? []), newComment],
					updatedAt: now(),
				}

				set({
					boards: {
						...get().boards,
						[boardKey]: { ...board, cards: { ...board.cards, [cardId]: updatedCard } },
					},
					history: { ...history, [currentUserId]: newHistory },
					historyIndex: { ...historyIndex, [currentUserId]: newHistory.length - 1 },
				})
			},

			deleteComment: (cardId, commentId) => {
				const { currentUserId } = get()
				if (!currentUserId) return

				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return

				const card = board.cards[cardId]
				if (!card) return

				// Push to history before mutation
				const history = get().history
				const historyIndex = get().historyIndex
				const boardHistory = history[currentUserId] ?? []
				const currentIndex = historyIndex[currentUserId] ?? -1
				const newHistory = [...boardHistory.slice(0, currentIndex + 1), board].slice(-MAX_HISTORY)

				const updatedCard: Card = {
					...card,
					comments: (card.comments ?? []).filter((c) => c.id !== commentId),
					updatedAt: now(),
				}

				set({
					boards: {
						...get().boards,
						[boardKey]: { ...board, cards: { ...board.cards, [cardId]: updatedCard } },
					},
					history: { ...history, [currentUserId]: newHistory },
					historyIndex: { ...historyIndex, [currentUserId]: newHistory.length - 1 },
				})
			},

			// ─── Gamification ─────────────────────────────────────────
			addXp: (amount) => {
				set((s) => {
					const newXp = s.xp + amount
					const newLevel = Math.floor(Math.sqrt(newXp / 50)) + 1
					return { xp: newXp, level: newLevel }
				})
			},

			updateStreak: () => {
				set((s) => {
					const today = new Date().toDateString()
					const last = s.lastCompletionDate
					if (last === today) return {} // already counted today

					const yesterday = new Date(Date.now() - 86400000).toDateString()
					const newStreak = last === yesterday ? s.streak + 1 : 1
					return {
						streak: newStreak,
						lastCompletionDate: today,
						totalCompleted: s.totalCompleted + 1,
					}
				})
			},

			// ─── UI State (AuraTask) ────────────────────────────────
			setActiveView: (view) => set({ activeView: view }),
			openPanel: (cardId) => set({ selectedCardId: cardId }),
			closePanel: () => set({ selectedCardId: null }),

			// ─── Pomodoro (simplified) ────────────────────────────
			startPomodoro: (cardId) => set({ pomodoroRunning: true, pomodoroCardId: cardId ?? null }),
			stopPomodoro: () => set({ pomodoroRunning: false, pomodoroCardId: null, pomodoroSeconds: 25 * 60 }),

			// ─── Flat accessors (for AuraTask) ────────────────────
			addCard: (listId, title, priority) => {
				const { currentUserId } = get()
				if (!currentUserId) return
				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return

				const history = get().history
				const historyIndex = get().historyIndex
				const boardHistory = history[currentUserId] ?? []
				const currentIndex = historyIndex[currentUserId] ?? -1
				const newHistory = [...boardHistory.slice(0, currentIndex + 1), board].slice(-MAX_HISTORY)

				const cardId = createId('card')
				const ts = now()
				const card: Card = {
					id: cardId,
					title,
					description: '',
					tasks: [],
					position: 0,
					color: '#6366f1',
					priority: (priority as any) ?? 'medium',
					createdAt: ts,
					updatedAt: ts,
					history: [{ type: 'created', timestamp: ts, userId: currentUserId }],
				}

				const lists = board.lists.map((l) =>
					l.id === listId ? { ...l, cardIds: [...l.cardIds, cardId] } : l,
				)

				set({
					boards: {
						...get().boards,
						[boardKey]: { ...board, lists, cards: { ...board.cards, [cardId]: card } },
					},
					history: { ...history, [currentUserId]: newHistory },
					historyIndex: { ...historyIndex, [currentUserId]: newHistory.length - 1 },
				})
			},
			toggleComplete: (cardId) => {
				const { currentUserId } = get()
				if (!currentUserId) return
				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return
				const card = board.cards[cardId]
				if (!card) return

				const doneListId = board.lists.find((l) => l.title === 'Done')?.id
				if (!card.completedAt && doneListId) {
					// Move to Done
					const ts = now()
					const lists = board.lists.map((l) => {
						if (l.cardIds.includes(cardId)) return { ...l, cardIds: l.cardIds.filter((id) => id !== cardId) }
						if (l.id === doneListId) return { ...l, cardIds: [...l.cardIds, cardId] }
						return l
					})
					const updatedCard = {
						...card,
						completedAt: ts,
						updatedAt: ts,
						history: [...card.history, { type: 'completed' as const, timestamp: ts, userId: currentUserId, toListId: doneListId }],
					}

					const history = get().history
					const historyIndex = get().historyIndex
					const boardHistory = history[currentUserId] ?? []
					const currentIndex = historyIndex[currentUserId] ?? -1
					const newHistory = [...boardHistory.slice(0, currentIndex + 1), board].slice(-MAX_HISTORY)

					set({
						boards: { ...get().boards, [boardKey]: { ...board, lists, cards: { ...board.cards, [cardId]: updatedCard } } },
						history: { ...history, [currentUserId]: newHistory },
						historyIndex: { ...historyIndex, [currentUserId]: newHistory.length - 1 },
					})
					get().addXp(10)
					get().updateStreak()
				} else if (card.completedAt) {
					// Uncomplete
					const ts = now()
					const updatedCard = {
						...card,
						completedAt: undefined,
						updatedAt: ts,
						history: [...card.history, { type: 'edited' as const, timestamp: ts, userId: currentUserId, description: 'Uncompleted' }],
					}

					const history = get().history
					const historyIndex = get().historyIndex
					const boardHistory = history[currentUserId] ?? []
					const currentIndex = historyIndex[currentUserId] ?? -1
					const newHistory = [...boardHistory.slice(0, currentIndex + 1), board].slice(-MAX_HISTORY)

					set({
						boards: { ...get().boards, [boardKey]: { ...board, cards: { ...board.cards, [cardId]: updatedCard } } },
						history: { ...history, [currentUserId]: newHistory },
						historyIndex: { ...historyIndex, [currentUserId]: newHistory.length - 1 },
					})
				}
			},

			// ─── History management ──────────────────────────────────
			clearHistory: () => {
				const { currentUserId } = get()
				if (!currentUserId) return
				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return

				// Push to history before mutation
				const history = get().history
				const historyIndex = get().historyIndex
				const boardHistory = history[currentUserId] ?? []
				const currentIndex = historyIndex[currentUserId] ?? -1
				const newHistory = [...boardHistory.slice(0, currentIndex + 1), board].slice(-MAX_HISTORY)

				// Delete all completed cards
				const cards = { ...board.cards }
				const completedIds = Object.keys(cards).filter((id) => cards[id].completedAt)
				completedIds.forEach((id) => {
					delete cards[id]
				})

				// Remove completed card IDs from all lists
				const lists = board.lists.map((l) => ({
					...l,
					cardIds: l.cardIds.filter((id) => !completedIds.includes(String(id))),
				}))

				// Reset gamification stats
				set({
					boards: { ...get().boards, [boardKey]: { ...board, lists, cards } },
					history: { ...history, [currentUserId]: newHistory },
					historyIndex: { ...historyIndex, [currentUserId]: newHistory.length - 1 },
					xp: 0,
					level: 1,
					streak: 0,
					lastCompletionDate: null,
					totalCompleted: 0,
				})
			},

			deleteCards: (cardIds) => {
				const { currentUserId } = get()
				if (!currentUserId) return
				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return

				// Push to history before mutation
				const history = get().history
				const historyIndex = get().historyIndex
				const boardHistory = history[currentUserId] ?? []
				const currentIndex = historyIndex[currentUserId] ?? -1
				const newHistory = [...boardHistory.slice(0, currentIndex + 1), board].slice(-MAX_HISTORY)

				const idsSet = new Set(cardIds.map(String))

				// Delete cards
				const cards = { ...board.cards }
				idsSet.forEach((id) => { delete cards[id] })

				// Remove from lists
				const lists = board.lists.map((l) => ({
					...l,
					cardIds: l.cardIds.filter((id) => !idsSet.has(String(id))),
				}))

				// Clean up dangling dependency references
				Object.values(cards).forEach((c) => {
					if (c.blockedBy) c.blockedBy = c.blockedBy.filter((id) => !idsSet.has(String(id)))
					if (c.blocks) c.blocks = c.blocks.filter((id) => !idsSet.has(String(id)))
				})

				// Adjust gamification: subtract deleted completed count
				const deletedCompleted = cardIds.filter((id) => board.cards[id]?.completedAt).length

				set({
					boards: { ...get().boards, [boardKey]: { ...board, lists, cards } },
					history: { ...history, [currentUserId]: newHistory },
					historyIndex: { ...historyIndex, [currentUserId]: newHistory.length - 1 },
					totalCompleted: Math.max(0, get().totalCompleted - deletedCompleted),
				})
			},

			// ─── Personal: Journal + Habits ──────────────────────────
			setJournalEntry: (date, text) => {
				const { currentUserId } = get()
				if (!currentUserId) return
				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return

				const journalEntries = { ...(board.journalEntries ?? {}), [date]: text }
				set({
					boards: { ...get().boards, [boardKey]: { ...board, journalEntries } },
				})
			},

			addHabit: (name, icon, color) => {
				const { currentUserId } = get()
				if (!currentUserId) return
				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return

				const newHabit = {
					id: `habit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
					name,
					icon,
					color,
					completedDates: [],
					createdAt: new Date().toISOString(),
				}
				const habits = [...(board.habits ?? []), newHabit]
				set({
					boards: { ...get().boards, [boardKey]: { ...board, habits } },
				})
			},

			removeHabit: (habitId) => {
				const { currentUserId } = get()
				if (!currentUserId) return
				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return

				const habits = (board.habits ?? []).filter((h) => h.id !== habitId)
				set({
					boards: { ...get().boards, [boardKey]: { ...board, habits } },
				})
			},

			toggleHabitDay: (habitId, date) => {
				const { currentUserId } = get()
				if (!currentUserId) return
				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return

				const habits = (board.habits ?? []).map((h) => {
					if (h.id !== habitId) return h
					const has = h.completedDates.includes(date)
					return {
						...h,
						completedDates: has
							? h.completedDates.filter((d) => d !== date)
							: [...h.completedDates, date],
					}
				})
				set({
					boards: { ...get().boards, [boardKey]: { ...board, habits } },
				})
			},

			// ─── Ideas: Sketch + Mind Map ────────────────────────────
			saveSketch: (cardId, data) => {
				const { currentUserId } = get()
				if (!currentUserId) return
				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return
				const card = board.cards[cardId]
				if (!card) return

				set({
					boards: {
						...get().boards,
						[boardKey]: {
							...board,
							cards: {
								...board.cards,
								[cardId]: { ...card, sketchData: data, updatedAt: new Date().toISOString() },
							},
						},
					},
				})
			},

			saveMindMap: (cardId, data) => {
				const { currentUserId } = get()
				if (!currentUserId) return
				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return
				const card = board.cards[cardId]
				if (!card) return

				set({
					boards: {
						...get().boards,
						[boardKey]: {
							...board,
							cards: {
								...board.cards,
								[cardId]: { ...card, mindMapData: data, updatedAt: new Date().toISOString() },
							},
						},
					},
				})
			},

			// ─── Auto-backlog ────────────────────────────────────────
			moveExpiredToBacklog: () => {
				const { currentUserId } = get()
				if (!currentUserId) return
				const boardKey = `board-${currentUserId}`
				const board = get().boards[boardKey]
				if (!board) return

				const backlogListId = board.lists.find((l) => l.title === 'Backlog')?.id
				if (!backlogListId) return

				const nowTs = Date.now()
				let changed = false
				let lists = board.lists
				const updatedCards = { ...board.cards }

				Object.values(board.cards).forEach((card) => {
					if (card.completedAt) return
					if (!card.timeLimit || !card.timeLimitStartedAt) return
					const alreadyInBacklog = board.lists.find((l) => l.id === backlogListId)?.cardIds.includes(card.id)
					if (alreadyInBacklog) return

					const elapsed = nowTs - new Date(card.timeLimitStartedAt).getTime()
					const limitMs = card.timeLimit * 60 * 1000
					if (elapsed < limitMs) return

					// Move to backlog
					changed = true
					lists = lists.map((l) => {
						if (l.cardIds.includes(card.id)) {
							return { ...l, cardIds: l.cardIds.filter((id) => id !== card.id) }
						}
						if (l.id === backlogListId) {
							return { ...l, cardIds: [...l.cardIds, card.id] }
						}
						return l
					})

					const ts = now()
					updatedCards[card.id] = {
						...card,
						updatedAt: ts,
						timeLimitStartedAt: undefined,
						history: [
							...card.history,
							{
								type: 'moved',
								toListId: backlogListId,
								timestamp: ts,
								userId: currentUserId,
								description: 'Auto-moved to backlog (time limit expired)',
							},
						],
					}
				})

				if (changed) {
					// Push to history before mutation
					const history = get().history
					const historyIndex = get().historyIndex
					const boardHistory = history[currentUserId] ?? []
					const currentIndex = historyIndex[currentUserId] ?? -1
					const newHistory = [...boardHistory.slice(0, currentIndex + 1), board].slice(-MAX_HISTORY)

					set({
						boards: { ...get().boards, [boardKey]: { ...board, lists, cards: updatedCards } },
						history: { ...history, [currentUserId]: newHistory },
						historyIndex: { ...historyIndex, [currentUserId]: newHistory.length - 1 },
					})
				}
			},

			// ─── Undo/Redo ──────────────────────────────────────────
			undo: () => {
				const { currentUserId } = get()
				if (!currentUserId) return

				const history = get().history
				const historyIndex = get().historyIndex
				const boardHistory = history[currentUserId] ?? []
				const currentIndex = historyIndex[currentUserId] ?? -1

				// Can't undo past the first snapshot
				if (currentIndex <= 0) return

				const restoredBoard = boardHistory[currentIndex - 1]
				const boardKey = `board-${currentUserId}`

				set({
					boards: { ...get().boards, [boardKey]: restoredBoard },
					historyIndex: { ...historyIndex, [currentUserId]: currentIndex - 1 },
				})
			},

			redo: () => {
				const { currentUserId } = get()
				if (!currentUserId) return

				const history = get().history
				const historyIndex = get().historyIndex
				const boardHistory = history[currentUserId] ?? []
				const currentIndex = historyIndex[currentUserId] ?? -1

				// Can't redo past the last snapshot
				if (currentIndex >= boardHistory.length - 1) return

				const restoredBoard = boardHistory[currentIndex + 1]
				const boardKey = `board-${currentUserId}`

				set({
					boards: { ...get().boards, [boardKey]: restoredBoard },
					historyIndex: { ...historyIndex, [currentUserId]: currentIndex + 1 },
				})
			},

			canUndo: () => {
				const { currentUserId } = get()
				if (!currentUserId) return false
				const historyIndex = get().historyIndex
				return (historyIndex[currentUserId] ?? -1) >= 0
			},

			canRedo: () => {
				const { currentUserId } = get()
				if (!currentUserId) return false
				const history = get().history
				const historyIndex = get().historyIndex
				const boardHistory = history[currentUserId] ?? []
				const currentIndex = historyIndex[currentUserId] ?? -1
				return currentIndex < boardHistory.length - 1
			},

			// ─── Selectors ───────────────────────────────────────────
			getBoard: (ownerId) => {
				const id = ownerId ?? get().currentUserId
				if (!id) return undefined
				return get().boards[`board-${id}`]
			},

			getCards: (ownerId) => {
				const board = get().getBoard(ownerId)
				return board ? Object.values(board.cards) : []
			},

			getCardsInList: (listId, ownerId) => {
				const board = get().getBoard(ownerId)
				if (!board) return []
				const list = board.lists.find((l) => l.id === listId)
				if (!list) return []
				return list.cardIds.map((id) => board.cards[id]).filter(Boolean)
			},
		}),
		{
			name: 'workelo-store',
			partialize: (state) => ({
				currentUserId: state.currentUserId,
				users: state.users,
				boards: state.boards,
				history: state.history,
				historyIndex: state.historyIndex,
			}),
			onRehydrateStorage: () => (state) => {
				if (state) {
					const user = state.users.find((u) => u.id === state.currentUserId) ?? null
					state.currentUser = user
				}
			},
		},
	),
)