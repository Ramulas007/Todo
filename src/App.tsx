import { useEffect, useState } from 'react'
import './output.css'
import AdminPanel from './screens/AdminPanel'
import Login from './screens/Login'
import Workspace from './screens/workSpace'
import UserDashboard from './screens/UserDashboard'
import { authenticateUser, seedUsers } from './data/mockUsers'
import type { AppUser } from './types/user.types'

const USERS_STORAGE_KEY = 'workelo-users'
const SESSION_STORAGE_KEY = 'workelo-session-user-id'

type AppRoute = 'login' | 'admin' | 'dashboard' | 'todo'

function getRouteFromPath(pathname: string): AppRoute {
  if (pathname.startsWith('/admin')) {
    return 'admin'
  }

  if (pathname.startsWith('/todo')) {
    return 'todo'
  }

  if (pathname.startsWith('/dashboard')) {
    return 'dashboard'
  }

  return 'login'
}

function routeToPath(route: AppRoute) {
  switch (route) {
    case 'admin':
      return '/admin'
    case 'dashboard':
      return '/dashboard'
    case 'todo':
      return '/todo'
    default:
      return '/login'
  }
}

function loadUsers(): AppUser[] {
  const storedUsers = localStorage.getItem(USERS_STORAGE_KEY)

  if (!storedUsers) {
    return seedUsers
  }

  try {
    const parsedUsers = JSON.parse(storedUsers) as AppUser[]
    return Array.isArray(parsedUsers) && parsedUsers.length ? parsedUsers : seedUsers
  } catch {
    return seedUsers
  }
}

function loadSessionUserId() {
  return localStorage.getItem(SESSION_STORAGE_KEY)
}

export default function App() {
  const [users, setUsers] = useState<AppUser[]>(loadUsers)
  const [sessionUserId, setSessionUserId] = useState<string | null>(loadSessionUserId)
  const [route, setRoute] = useState<AppRoute>(() => getRouteFromPath(window.location.pathname))

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  }, [users])

  useEffect(() => {
    if (sessionUserId) {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionUserId)
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY)
    }
  }, [sessionUserId])

  useEffect(() => {
    function handlePopState() {
      setRoute(getRouteFromPath(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function handleLogin(email: string, password: string) {
    const authenticatedUser = authenticateUser(users, email, password)

    if (authenticatedUser) {
      setSessionUserId(authenticatedUser.id)
      const nextRoute = authenticatedUser.role === 'admin' ? 'admin' : 'dashboard'
      window.history.pushState({}, '', routeToPath(nextRoute))
      setRoute(nextRoute)
    }
  }

  function handleLogout() {
    setSessionUserId(null)
    window.history.pushState({}, '', routeToPath('login'))
    setRoute('login')
  }

  function handleUsersChange(nextUsers: AppUser[]) {
    setUsers(nextUsers)

    if (sessionUserId && !nextUsers.some((user) => user.id === sessionUserId)) {
      setSessionUserId(null)
    }
  }

  const activeUser = sessionUserId
    ? users.find((user) => user.id === sessionUserId) ?? null
    : null

  function handleOpenTodo() {
    window.history.pushState({}, '', routeToPath('todo'))
    setRoute('todo')
  }

  function handleBackToDashboard() {
    window.history.pushState({}, '', routeToPath('dashboard'))
    setRoute('dashboard')
  }

  useEffect(() => {
    if (!activeUser) {
      if (route !== 'login') {
        window.history.replaceState({}, '', routeToPath('login'))
        setRoute('login')
      }

      return
    }

    if (route === 'login') {
      window.history.replaceState({}, '', routeToPath('dashboard'))
      setRoute('dashboard')
    }
  }, [activeUser, route])

  return (
    <div>
      {!activeUser ? (
        <Login users={users} onLogin={handleLogin} />
      ) : route === 'admin' ? (
        <AdminPanel
          adminUser={activeUser}
          users={users}
          onUsersChange={handleUsersChange}
          onLogout={handleLogout}
        />
      ) : route === 'todo' ? (
        <Workspace onBackToDashboard={handleBackToDashboard} />
      ) : (
        <UserDashboard
          user={activeUser}
          onLogout={handleLogout}
          onOpenTodo={handleOpenTodo}
        />
      )}
    </div>
  )
}