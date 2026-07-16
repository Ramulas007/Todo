import { motion } from "framer-motion";
import BlobBackground from "../components/BlobBackground";
import BackButton from "../components/BackButton";

interface Props {
	onNavigate: (path: string) => void;
}

export default function AboutPage({ onNavigate }: Props) {
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

				{/* Content */}
				<section className="max-w-3xl mx-auto px-8 pt-20 pb-20">
					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
						<h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
							About{" "}
							<span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">AuraTask</span>
						</h1>
						<div className="space-y-6 text-white/50 leading-relaxed">
							<p className="text-lg">
								AuraTask is a modern task management platform designed for teams and individuals who value clarity, focus, and beautiful design.
							</p>
							<p>
								We believe that managing work shouldn't feel like work. That's why we built AuraTask with a clean, intuitive interface that gets out of your way and lets you focus on what matters — completing your tasks and reaching your goals.
							</p>
							<p>
								From Kanban boards and Pomodoro timers to smart daily planners and team analytics, AuraTask brings together everything you need in one cohesive workspace.
							</p>

							<div className="glass rounded-2xl p-8 mt-10">
								<h2 className="text-xl font-semibold text-white mb-4">Our Mission</h2>
								<p>
									To make productivity tools that are as enjoyable to use as they are powerful. We're building the workspace we always wished existed — one that adapts to how you work, not the other way around.
								</p>
							</div>

							<div className="glass rounded-2xl p-8 mt-6">
								<h2 className="text-xl font-semibold text-white mb-4">Built with Care</h2>
								<p>
									AuraTask is built with modern web technologies — React, TypeScript, Zustand — and designed with attention to every pixel. We care about performance, accessibility, and the small details that make a tool feel right.
								</p>
							</div>

							<div className="text-center mt-12 pt-8 border-t border-white/5">
								<p className="text-sm text-white/30">
									© Copyright Marco Antonio · Built by Yudis
								</p>
							</div>
						</div>
					</motion.div>
				</section>
			</div>
		</div>
	);
}
