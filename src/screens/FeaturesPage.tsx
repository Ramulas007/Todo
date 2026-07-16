import { motion } from "framer-motion";
import { Bell, Zap, RefreshCw, Calendar, Layout, Users, Clock, BarChart3, Shield } from "lucide-react";
import BlobBackground from "../components/BlobBackground";
import BackButton from "../components/BackButton";

interface Props {
	onNavigate: (path: string) => void;
}

const FEATURES = [
	{
		icon: Layout,
		title: "Kanban Board",
		desc: "Drag-and-drop cards across customizable columns. Organize work your way with lists, labels, and priorities.",
		color: "from-blue-500/20 to-indigo-500/20",
		iconColor: "text-blue-400",
	},
	{
		icon: Calendar,
		title: "Today View",
		desc: "Smart daily planner that surfaces overdue tasks, due-today items, and AI-suggested next actions.",
		color: "from-amber-500/20 to-orange-500/20",
		iconColor: "text-amber-400",
	},
	{
		icon: Clock,
		title: "Pomodoro Timer",
		desc: "Built-in focus timer with customizable durations. Track time spent per task and build productive streaks.",
		color: "from-emerald-500/20 to-teal-500/20",
		iconColor: "text-emerald-400",
	},
	{
		icon: Bell,
		title: "Smart Notifications",
		desc: "Get timely reminders that keep you on track without overwhelming your workflow.",
		color: "from-rose-500/20 to-pink-500/20",
		iconColor: "text-rose-400",
	},
	{
		icon: Users,
		title: "Team Collaboration",
		desc: "Multi-user workspaces with role-based access. Admin panel for user management and board oversight.",
		color: "from-violet-500/20 to-purple-500/20",
		iconColor: "text-violet-400",
	},
	{
		icon: BarChart3,
		title: "Dashboard Analytics",
		desc: "Track velocity, completion rates, and weekly activity. See your team's momentum at a glance.",
		color: "from-cyan-500/20 to-blue-500/20",
		iconColor: "text-cyan-400",
	},
	{
		icon: RefreshCw,
		title: "Recurring Tasks",
		desc: "Set tasks to repeat daily, weekly, or monthly. Never forget routine work like gym, standups, or bill payments.",
		color: "from-green-500/20 to-emerald-500/20",
		iconColor: "text-green-400",
	},
	{
		icon: Zap,
		title: "Quick Capture",
		desc: "Press Ctrl+N anywhere to instantly capture a new task. Never let an idea slip away.",
		color: "from-yellow-500/20 to-amber-500/20",
		iconColor: "text-yellow-400",
	},
	{
		icon: Shield,
		title: "Secure & Private",
		desc: "Your data stays yours. Enterprise-grade security with encrypted storage and secure authentication.",
		color: "from-indigo-500/20 to-blue-500/20",
		iconColor: "text-indigo-400",
	},
];

export default function FeaturesPage({ onNavigate }: Props) {
	return (
		<div className="min-h-screen bg-[#0a0a12] text-white overflow-x-hidden relative">
			<BlobBackground />
			<div className="fixed top-[5%] right-[10%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-orange-500/10 to-amber-500/8 blur-[120px] pointer-events-none" />
			<div className="fixed bottom-[10%] left-[5%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/8 blur-[120px] pointer-events-none" />

			<div className="relative z-10">
				{/* Nav */}
				<nav className="px-8 py-5 border-b border-white/5">
					<div className="max-w-7xl mx-auto flex items-center justify-between">
						<div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate("/")}>
							<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
								<svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
									<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</div>
							<span className="text-base font-bold text-white">AuraTask</span>
						</div>
						<BackButton />
						<div className="flex items-center gap-6">
							<button onClick={() => onNavigate("/login")} className="text-sm text-white/50 hover:text-white transition-colors">Log In</button>
							<button onClick={() => onNavigate("/login")}
								className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-sm font-semibold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all">
								Get Started
							</button>
						</div>
					</div>
				</nav>

				{/* Hero */}
				<section className="max-w-7xl mx-auto px-8 pt-20 pb-16 text-center">
					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
						<h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
							Everything you need to{" "}
							<span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">stay productive</span>
						</h1>
						<p className="text-lg text-white/40 max-w-2xl mx-auto">
							AuraTask combines task management, time tracking, and team collaboration into one beautiful workspace.
						</p>
					</motion.div>
				</section>

				{/* Features Grid */}
				<section className="max-w-7xl mx-auto px-8 pb-20">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
						{FEATURES.map((f, i) => (
							<motion.div
								key={f.title}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.4, delay: i * 0.05 }}
								className="glass rounded-2xl p-6 hover:bg-white/[0.06] transition-all duration-300"
							>
								<div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}>
									<f.icon className={`w-6 h-6 ${f.iconColor}`} />
								</div>
								<h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
								<p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
							</motion.div>
						))}
					</div>
				</section>

				{/* CTA */}
				<section className="max-w-7xl mx-auto px-8 pb-20 text-center">
					<div className="glass rounded-2xl p-12">
						<h2 className="text-2xl font-bold text-white mb-3">Ready to get started?</h2>
						<p className="text-white/40 mb-6">Join thousands of teams already using AuraTask.</p>
						<button onClick={() => onNavigate("/login")}
							className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-sm font-semibold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all">
							Start for Free
						</button>
					</div>
				</section>
			</div>
		</div>
	);
}
