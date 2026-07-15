# Workelo — Setup & Architecture

## What is Workelo?

Workelo is a collaborative Kanban-style todo board with a live per-user dashboard and an admin panel. It's built for teams who value simplicity and clarity in task management.

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Vite | ^8.1.3 | Build tool & dev server |
| React | ^19.2.7 | UI framework |
| TypeScript | ~6.0.2 | Type safety |
| Zustand | ^5.0.0 | State management |
| Tailwind CSS | ^4.3.1 | Styling |
| @dnd-kit/react | ^0.5.0 | Drag and drop |

## Architecture Overview

### State Management (Zustand)

The entire app uses a single Zustand store (`src/store/useStore.ts`) with:

- **Session slice**: `currentUserId`, `currentUser`, auth actions
- **Users slice**: `users[]`, CRUD actions
- **Board slice**: `boards{}` (keyed by `board-{userId}`), card/task actions

### Data Model

```typescript
User {
  id, name, email, password, role ('admin'|'member'),
  team, title, accent
}

Board {
  id, ownerId, title, lists[], cards{}
}

Card {
  id, title, description, tasks[], position, color,
  priority ('low'|'medium'|'high'|'urgent'),
  dueDate, assigneeId, tags[],
  createdAt, updatedAt, completedAt,
  history: CardEvent[]
}

CardEvent {
  type ('created'|'moved'|'completed'|'task_completed'|'edited'),
  fromListId, toListId, timestamp, userId, description
}
```

### Views

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | `Login` | Authentication |
| `/dashboard` | `UserDashboard` | Stats, activity, quick actions |
| `/todo` | `AuraLayout` | AuraTask workspace with sidebar, task cards, timer |
| `/admin` | `AdminPanel` | User management (admin only) |

### Derived Metrics

Dashboard metrics are computed via `useDashboardMetrics()` hook:
- Completion rate, velocity, on-time rate
- Weekly activity, trend line, pipeline health
- Recent activity feed, quick action tips

All values derive from the Zustand store — no hardcoded numbers.

## How to Run Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## User Roles

### Member
- Can view/edit their own board
- Can see their own dashboard

### Admin
- Can manage all users (add/edit/delete)
- Can view any user's board and dashboard
- Can edit any user's cards/tasks
- Access via `/admin` route

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@workelo.test | Admin#2026 |
| Member | ava@workelo.test | Ava#2026 |
| Member | noah@workelo.test | Noah#2026 |
| Member | mia@workelo.test | Mia#2026 |

## Deployment

The app is configured for deployment on Vercel (or any static host with SPA fallback).

```bash
# Build
npm run build

# The dist/ folder is ready for deployment
```

**Important**: Configure SPA fallback (rewrite all routes to `index.html`) to prevent 404 on hard refresh.

## Environment Variables

None required for local development. All data is persisted in localStorage via Zustand's `persist` middleware.

## Key Files

```
src/
├── store/useStore.ts          # Zustand store (single source of truth)
├── hooks/useDashboardMetrics.ts  # Derived dashboard metrics
├── types/board.types.ts       # TypeScript interfaces
├── screens/
│   ├── Login.tsx              # Authentication
│   ├── UserDashboard.tsx      # Dashboard view
│   ├── AdminPanel.tsx         # Admin user management
│   ├── workSpace.tsx          # Board wrapper
│   ├── dashboardWidgets.tsx   # Dashboard widget components
│   └── board_components/
│       ├── Board.tsx          # Main board container
│       ├── List.tsx           # Column component
│       ├── Card.tsx           # Card component
│       ├── TaskItem.tsx       # Checklist item
│       └── *Modal.tsx         # Modal dialogs
├── components/
│   ├── Modal.tsx              # Reusable modal shell
│   └── ThemeToggle.tsx        # Light/dark toggle
└── index.css                  # Global styles & animations
```