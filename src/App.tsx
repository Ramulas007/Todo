import { useEffect, useState } from 'react'
import { useStore } from './store/useStore'
import Login from './screens/Login'
import AdminPanel from './screens/AdminPanel'
import Workspace from './screens/workSpace'
import UserDashboard from './screens/UserDashboard'

type AppRoute = 'login' | 'admin' | 'dashboard' | 'todo'

function getRouteFromPath(pathname: string): AppRoute {
	if (pathname.startsWith('/admin')) return 'admin'
	if (pathname.startsWith('/todo')) return 'todo'
	if (pathname.startsWith('/dashboard')) return 'dashboard'
	return 'login'
}

function routeToPath(route: AppRoute) {
	switch (route) {
		case 'admin': return '/admin'
		case 'dashboard': return '/dashboard'
		case 'todo': return '/todo'
		default: return '/login'
	}
}

export default function App() {
	const currentUser = useStore((s) => s.currentUser)
	const users = useStore((s) => s.users)
	const login = useStore((s) => s.login)
	const logout = useStore((s) => s.logout)
	const updateUser = useStore((s) => s.updateUser)
	const addUser = useStore((s) => s.addUser)
	const removeUser = useStore((s) => s.removeUser)

	const [route, setRoute] = useState<AppRoute>(() => getRouteFromPath(window.location.pathname))

	useEffect(() => {
		function handlePopState() {
			setRoute(getRouteFromPath(window.location.pathname))
		}
		window.addEventListener('popstate', handlePopState)
		return () => window.removeEventListener('popstate', handlePopState)
	}, [])

	function navigate(r: AppRoute) {
		window.history.pushState({}, '', routeToPath(r))
		setRoute(r)
	}

	function handleLogin(email: string, password: string) {
		const success = login(email, password)
		if (success) {
			const user = useStore.getState().currentUser
			const nextRoute = user?.role === 'admin' ? 'admin' : 'dashboard'
			navigate(nextRoute)
		}
		return success
	}

	function handleLogout() {
		logout()
		navigate('login')
	}

	function handleOpenTodo() {
		navigate('todo')
	}

	function handleBackToDashboard() {
		navigate('dashboard')
	}

	// Redirect if not logged in
	useEffect(() => {
		if (!currentUser && route !== 'login') {
			navigate('login')
		}
		if (currentUser && route === 'login') {
			const nextRoute = currentUser.role === 'admin' ? 'admin' : 'dashboard'
			navigate(nextRoute)
		}
	}, [currentUser, route])

	if (!currentUser) {
		return <Login onLogin={handleLogin} />
	}

	if (route === 'admin' && currentUser.role === 'admin') {
		return (
			<AdminPanel
				adminUser={currentUser}
				users={users}
				onUsersChange={(nextUsers) => {
					nextUsers.forEach((u) => {
						const existing = users.find((eu) => eu.id === u.id)
						if (existing) {
							updateUser(u.id, u)
						} else {
							addUser(u)
						}
					})
					// Remove users not in the new list
					users.forEach((u) => {
						if (!nextUsers.find((nu) => nu.id === u.id)) {
							removeUser(u.id)
						}
					})
				}}
				onLogout={handleLogout}
			/>
		)
	}

	if (route === 'todo') {
		return <Workspace onBackToDashboard={handleBackToDashboard} />
	}

	return (
		<UserDashboard
			user={currentUser}
			onLogout={handleLogout}
			onOpenTodo={handleOpenTodo}
		/>
	)
}
