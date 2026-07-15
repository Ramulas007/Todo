import { useEffect, useState } from 'react'
import { useStore } from './store/useStore'
import { usePomodoro } from './hooks/usePomodoro'
import Homepage from './screens/Homepage'
import LoginNew from './screens/LoginNew'
import AdminPanel from './screens/AdminPanel'
import AuraLayout from './screens/aura/AuraLayout'
import UserDashboard from './screens/UserDashboard'
import CalendarView from './screens/CalendarView'
import TodayView from './screens/TodayView'
import FocusView from './screens/FocusView'
import QuickCapture from './screens/board_components/QuickCapture'
import SearchPalette from './components/SearchPalette'
import FeaturesPage from './screens/FeaturesPage'
import PricingPage from './screens/PricingPage'
import AboutPage from './screens/AboutPage'

type AppRoute = 'home' | 'login' | 'admin' | 'dashboard' | 'todo' | 'calendar' | 'today' | 'focus' | 'features' | 'pricing' | 'about'

function getRouteFromPath(pathname: string): AppRoute {
	if (pathname === '/' || pathname === '/home') return 'home'
	if (pathname.startsWith('/login')) return 'login'
	if (pathname.startsWith('/admin')) return 'admin'
	if (pathname.startsWith('/calendar')) return 'calendar'
	if (pathname.startsWith('/today')) return 'today'
	if (pathname.startsWith('/focus')) return 'focus'
	if (pathname.startsWith('/todo')) return 'todo'
	if (pathname.startsWith('/dashboard')) return 'dashboard'
	if (pathname.startsWith('/features')) return 'features'
	if (pathname.startsWith('/pricing')) return 'pricing'
	if (pathname.startsWith('/about')) return 'about'
	return 'home'
}

function routeToPath(route: AppRoute) {
	switch (route) {
		case 'home': return '/'
		case 'login': return '/login'
		case 'admin': return '/admin'
		case 'calendar': return '/calendar'
		case 'today': return '/today'
		case 'focus': return '/focus'
		case 'dashboard': return '/dashboard'
		case 'todo': return '/todo'
		case 'features': return '/features'
		case 'pricing': return '/pricing'
		case 'about': return '/about'
		default: return '/'
	}
}

export default function App() {
	const currentUser = useStore((s) => s.currentUser)
	const users = useStore((s) => s.users)
	const logout = useStore((s) => s.logout)

	const [route, setRoute] = useState<AppRoute>(() => getRouteFromPath(window.location.pathname))
	const [showQuickCapture, setShowQuickCapture] = useState(false)
	const [showSearch, setShowSearch] = useState(false)
	const pomodoro = usePomodoro()

	useEffect(() => {
		function handlePopState() {
			setRoute(getRouteFromPath(window.location.pathname))
		}
		window.addEventListener('popstate', handlePopState)
		return () => window.removeEventListener('popstate', handlePopState)
	}, [])

	// Global Ctrl+N for Quick Capture
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
				e.preventDefault()
				if (currentUser && route !== 'login' && route !== 'home') {
					setShowQuickCapture(true)
				}
			}
			if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
				e.preventDefault()
				if (currentUser && route !== 'login' && route !== 'home') {
					setShowSearch(true)
				}
			}
		}
		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [currentUser, route])

	function navigate(r: AppRoute) {
		window.history.pushState({}, '', routeToPath(r))
		setRoute(r)
	}

	function navigateTo(path: string) {
		const r = getRouteFromPath(path)
		window.history.pushState({}, '', path)
		setRoute(r)
	}

	function handleLogout() {
		logout()
		navigate('home')
	}

	function handleOpenTodo() {
		navigate('todo')
	}

	function handleOpenCalendar() {
		navigate('calendar')
	}

	function handleOpenToday() {
		navigate('today')
	}

	function handleBackToBoard() {
		navigate('todo')
	}

	function handleOpenCardFromSearch(cardId: string) {
		useStore.getState().openPanel(cardId)
		if (route !== 'todo') navigate('todo')
	}

	// Redirect if not logged in (except home and login)
	useEffect(() => {
		if (!currentUser && route !== 'login' && route !== 'home') {
			navigate('home')
		}
		if (currentUser && route === 'login') {
			const nextRoute = currentUser.role === 'admin' ? 'admin' : 'dashboard'
			navigate(nextRoute)
		}
	}, [currentUser, route])

	// Public routes (no auth required)
	if (route === 'home') {
		return <Homepage onNavigate={navigateTo} />
	}

	if (route === 'login') {
		return <LoginNew onNavigate={navigateTo} />
	}

	if (route === 'features') {
		return <FeaturesPage onNavigate={navigateTo} />
	}

	if (route === 'pricing') {
		return <PricingPage onNavigate={navigateTo} />
	}

	if (route === 'about') {
		return <AboutPage onNavigate={navigateTo} />
	}

	if (!currentUser) {
		return <Homepage onNavigate={navigateTo} />
	}

	if (route === 'admin' && currentUser.role === 'admin') {
		return (
			<AdminPanel
				adminUser={currentUser}
				users={users}
				onLogout={handleLogout}
			/>
		)
	}

	if (route === 'calendar') {
		return (
			<>
				<CalendarView onBackToBoard={handleBackToBoard} />
				{showQuickCapture && <QuickCapture onClose={() => setShowQuickCapture(false)} />}
				{showSearch && <SearchPalette onClose={() => setShowSearch(false)} onOpenCard={handleOpenCardFromSearch} />}
			</>
		)
	}

	if (route === 'today') {
		return (
			<>
				<TodayView onBackToBoard={handleBackToBoard} />
				{showQuickCapture && <QuickCapture onClose={() => setShowQuickCapture(false)} />}
				{showSearch && <SearchPalette onClose={() => setShowSearch(false)} onOpenCard={handleOpenCardFromSearch} />}
			</>
		)
	}

	if (route === 'focus') {
		return (
			<>
				<FocusView onBack={handleBackToBoard} pomodoro={pomodoro} />
				{showSearch && <SearchPalette onClose={() => setShowSearch(false)} onOpenCard={handleOpenCardFromSearch} />}
			</>
		)
	}

	if (route === 'todo') {
		return (
			<>
				<AuraLayout />
				{showQuickCapture && <QuickCapture onClose={() => setShowQuickCapture(false)} />}
				{showSearch && <SearchPalette onClose={() => setShowSearch(false)} onOpenCard={handleOpenCardFromSearch} />}
			</>
		)
	}

	return (
		<>
			<UserDashboard
				user={currentUser}
				onLogout={handleLogout}
				onOpenTodo={handleOpenTodo}
				onOpenCalendar={handleOpenCalendar}
				onOpenToday={handleOpenToday}
			/>
			{showQuickCapture && <QuickCapture onClose={() => setShowQuickCapture(false)} />}
			{showSearch && <SearchPalette onClose={() => setShowSearch(false)} onOpenCard={handleOpenCardFromSearch} />}
		</>
	)
}