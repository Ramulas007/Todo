import { motion } from "framer-motion";
import { ArrowRight, Bell, Zap, RefreshCw } from "lucide-react";
import BlobBackground from "../components/BlobBackground";

interface Props {
	onNavigate: (path: string) => void;
}

export default function Homepage({ onNavigate }: Props) {
	return (
		<div className="min-h-screen bg-[#0a0a12] text-white overflow-x-hidden relative">
			<BlobBackground />

			<div className="relative z-10">
				{/* ─── Navbar ──────────────────────────────────────── */}
				<nav className="px-6 sm:px-8 py-5">
					<div className="max-w-7xl mx-auto flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate("/")}>
								<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
									<svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
										<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
									</svg>
								</div>
								<span className="text-base font-bold text-white">AuraTask</span>
							</div>
							<button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-all">
								Settings
							</button>
						</div>

						<div className="hidden sm:flex items-center gap-6">
							<button onClick={() => onNavigate("/features")} className="text-sm text-white/50 hover:text-white transition-colors">Features</button>
							<button onClick={() => onNavigate("/pricing")} className="text-sm text-white/50 hover:text-white transition-colors">Pricing</button>
							<button onClick={() => onNavigate("/about")} className="text-sm text-white/50 hover:text-white transition-colors">About</button>
							<button onClick={() => onNavigate("/login")} className="text-sm text-white/50 hover:text-white transition-colors">Log In</button>
							<button onClick={() => onNavigate("/login")}
								className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-sm font-semibold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200">
								Start Now
							</button>
						</div>
					</div>
				</nav>

				{/* ─── Hero Section ────────────────────────────────── */}
				<section className="max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-12">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						{/* Left: Text */}
						<motion.div
							initial={{ opacity: 0, x: -30 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
						>
							<h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.1] mb-6">
								Master Your Day with{" "}
								<br />
								<span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
									AuraTask: The Future of{" "}
									<br />
									Task Management.
								</span>
							</h1>
							<p className="text-base text-white/50 max-w-md mb-8 leading-relaxed">
								A beautiful, focused platform for personal and team productivity.
							</p>
							<button
								onClick={() => onNavigate("/login")}
								className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
							>
								Try AuraTask Free
								<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
							</button>
						</motion.div>

						{/* Right: App Preview */}
						<motion.div
							initial={{ opacity: 0, x: 30, rotateY: -10 }}
							animate={{ opacity: 1, x: 0, rotateY: 0 }}
							transition={{ duration: 1, delay: 0.3 }}
							className="relative"
							style={{ perspective: "1200px" }}
						>
							<div className="relative rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-indigo-500/20"
								style={{ transform: "rotateY(-5deg) rotateX(3deg)" }}>
								{/* Mock dashboard */}
								<div className="bg-[#0d0d14] p-5">
									<div className="flex items-center gap-2 mb-4">
										<div className="w-3 h-3 rounded-full bg-red-500/60" />
										<div className="w-3 h-3 rounded-full bg-yellow-500/60" />
										<div className="w-3 h-3 rounded-full bg-green-500/60" />
									</div>
									<div className="grid grid-cols-3 gap-3">
										<div className="space-y-2">
											<div className="h-3 w-16 rounded bg-white/10" />
											<div className="h-20 rounded-lg bg-blue-500/10 border border-blue-500/20 p-2">
												<div className="h-2 w-12 rounded bg-blue-500/20 mb-2" />
												<div className="h-1.5 w-full rounded bg-white/5 mb-1" />
												<div className="h-1.5 w-3/4 rounded bg-white/5" />
											</div>
											<div className="h-16 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2">
												<div className="h-2 w-10 rounded bg-emerald-500/20 mb-2" />
												<div className="h-1.5 w-full rounded bg-white/5" />
											</div>
										</div>
										<div className="space-y-2">
											<div className="h-3 w-20 rounded bg-white/10" />
											<div className="h-24 rounded-lg bg-amber-500/10 border border-amber-500/20 p-2">
												<div className="h-2 w-14 rounded bg-amber-500/20 mb-2" />
												<div className="grid grid-cols-2 gap-1">
													<div className="h-8 rounded bg-white/5" />
													<div className="h-8 rounded bg-white/5" />
													<div className="h-8 rounded bg-white/5" />
													<div className="h-8 rounded bg-white/5" />
												</div>
											</div>
										</div>
										<div className="space-y-2">
											<div className="h-3 w-14 rounded bg-white/10" />
											<div className="h-16 rounded-lg bg-purple-500/10 border border-purple-500/20 p-2">
												<div className="flex items-center gap-2 mb-2">
													<div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-rose-500" />
													<div className="h-2 w-10 rounded bg-white/10" />
												</div>
												<div className="h-1.5 w-full rounded bg-white/5" />
											</div>
											<div className="h-12 rounded-lg bg-rose-500/10 border border-rose-500/20 p-2">
												<div className="h-2 w-12 rounded bg-rose-500/20" />
											</div>
										</div>
									</div>
								</div>
							</div>
							{/* Glow */}
							<div className="absolute -inset-8 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl blur-3xl -z-10" />
						</motion.div>
					</div>
				</section>

				{/* ─── Feature Cards ───────────────────────────────── */}
				<section className="max-w-7xl mx-auto px-6 sm:px-8 pb-16">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
						{[
							{ icon: Bell, title: "Smart Notifications", desc: "Get timely reminders that keep you on track without overwhelming your workflow.", color: "from-blue-500/20 to-indigo-500/20", iconColor: "text-blue-400" },
							{ icon: Zap, title: "Pomodoro Integration", desc: "Focus timer built in. Start a session with one click and maintain your productivity streak.", color: "from-amber-500/20 to-orange-500/20", iconColor: "text-amber-400" },
							{ icon: RefreshCw, title: "Cross-Platform Sync", desc: "Seamlessly sync across Mac, iPhone, iPad, and web. Your tasks follow you everywhere.", color: "from-emerald-500/20 to-teal-500/20", iconColor: "text-emerald-400" },
						].map((f, i) => (
							<motion.div
								key={f.title}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: i * 0.1 }}
								className="glass rounded-2xl p-5 hover:bg-white/[0.06] transition-all duration-300"
							>
								<div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-3`}>
									<f.icon className={`w-5 h-5 ${f.iconColor}`} />
								</div>
								<h3 className="text-sm font-semibold text-white mb-1.5">{f.title}</h3>
								<p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
							</motion.div>
						))}
					</div>
				</section>

				{/* ─── Footer ──────────────────────────────────────── */}
				<footer className="px-6 sm:px-8 py-6 border-t border-white/5">
					<div className="max-w-7xl mx-auto flex items-center justify-between">
						<p className="text-xs text-white/30">© Copyright Marco Antonio · Built by Yudis</p>
						<div className="flex items-center gap-4">
							<div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white/60 cursor-pointer transition-colors">
								<svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
							</div>
							<div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white/60 cursor-pointer transition-colors">
								<svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037 19.736 19.736 0 00-4.885 1.515.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>
							</div>
							<div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white/60 cursor-pointer transition-colors">
								<svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
							</div>
							<div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white/60 cursor-pointer transition-colors">
								<svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.43A6.34 6.34 0 0015.78 10V6.69h3.81z"/></svg>
							</div>
						</div>
					</div>
				</footer>
			</div>
		</div>
	);
}