import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Board, Card, List, Task, CardEvent, User, UserRole } from '../types/board.types'

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

	// ─── Undo/Redo ──────────────────────────────────────────────────
	undo: () => void
	redo: () => void
	canUndo: () => boolean
	canRedo: () => boolean

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
	const timestamp = now()

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

const MAX_HISTORY = 50

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

			// ─── Auth ─────────────────────────────────────────────────
			login: (email, password) => {
				const user = get().users.find(
					(u) => u.email === email.toLowerCase().trim() && u.password === password,
				)
				if (!user) return false
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
						completedAt: targetListId === 'list-3' ? ts : card.completedAt,
						history: [
							...card.history,
							{
								type: targetListId === 'list-3' ? 'completed' : 'moved',
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
						...(allDone ? [{ type: 'completed' as const, toListId: 'list-3', timestamp: ts, userId: currentUserId }] : []),
					],
				}

				// If all tasks done, move card to Done list
				let lists = board.lists
				if (allDone) {
					lists = board.lists.map((l) => {
						if (l.cardIds.includes(cardId)) {
							return { ...l, cardIds: l.cardIds.filter((id) => id !== cardId) }
						}
						if (l.id === 'list-3') {
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

				set({
					boards: { ...get().boards, [boardKey]: { ...board, lists, cards } },
					history: { ...history, [currentUserId]: newHistory },
					historyIndex: { ...historyIndex, [currentUserId]: newHistory.length - 1 },
				})
			},

			// ─── Undo/Redo ──────────────────────────────────────────
			undo: () => {
				const { currentUserId } = get()
				if (!currentUserId) return

				const history = get().history
				const historyIndex = get().historyIndex
				const boardHistory = history[currentUserId] ?? []
				const currentIndex = historyIndex[currentUserId] ?? -1

				if (currentIndex < 0) return

				const restoredBoard = boardHistory[currentIndex]
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

				if (currentIndex >= boardHistory.length - 1) return

				const nextIndex = currentIndex + 2
				if (nextIndex >= boardHistory.length) return

				const restoredBoard = boardHistory[nextIndex]
				const boardKey = `board-${currentUserId}`

				set({
					boards: { ...get().boards, [boardKey]: restoredBoard },
					historyIndex: { ...historyIndex, [currentUserId]: nextIndex },
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
				return currentIndex < boardHistory.length - 2
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
			}),
		},
	),
)
