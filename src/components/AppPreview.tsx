import { motion } from "framer-motion";

export default function AppPreview() {
	return (
		<section className="relative py-20 px-6">
			<div className="max-w-5xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 40, rotateX: 10 }}
					animate={{ opacity: 1, y: 0, rotateX: 0 }}
					transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
					className="relative"
					style={{ perspective: "1000px" }}
				>
					<div className="relative rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-indigo-500/20"
						style={{ transform: "rotateY(-3deg) rotateX(2deg)" }}>
						{/* Mock dashboard UI */}
						<div className="bg-[#0a0a0f] p-6">
							{/* Top bar */}
							<div className="flex items-center justify-between mb-6">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600" />
									<span className="text-sm font-semibold text-white">AuraTask</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-8 h-8 rounded-full bg-white/10" />
									<div className="w-8 h-8 rounded-full bg-white/10" />
								</div>
							</div>

							{/* Content grid */}
							<div className="grid grid-cols-3 gap-4">
								{/* Left column */}
								<div className="space-y-3">
									<div className="h-4 w-24 rounded bg-white/10" />
									<div className="h-32 rounded-xl bg-white/5 border border-white/10 p-4">
										<div className="h-3 w-16 rounded bg-white/10 mb-3" />
										<div className="space-y-2">
											<div className="h-2 w-full rounded bg-white/5" />
											<div className="h-2 w-3/4 rounded bg-white/5" />
											<div className="h-2 w-1/2 rounded bg-white/5" />
										</div>
									</div>
									<div className="h-24 rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
										<div className="h-3 w-20 rounded bg-blue-500/20 mb-2" />
										<div className="h-6 w-12 rounded bg-blue-500/30" />
									</div>
								</div>

								{/* Middle column */}
								<div className="space-y-3">
									<div className="h-4 w-32 rounded bg-white/10" />
									<div className="h-40 rounded-xl bg-white/5 border border-white/10 p-4">
										<div className="grid grid-cols-2 gap-2">
											<div className="h-16 rounded-lg bg-emerald-500/10 border border-emerald-500/20" />
											<div className="h-16 rounded-lg bg-amber-500/10 border border-amber-500/20" />
											<div className="h-16 rounded-lg bg-rose-500/10 border border-rose-500/20" />
											<div className="h-16 rounded-lg bg-indigo-500/10 border border-indigo-500/20" />
										</div>
									</div>
								</div>

								{/* Right column */}
								<div className="space-y-3">
									<div className="h-4 w-20 rounded bg-white/10" />
									<div className="h-28 rounded-xl bg-white/5 border border-white/10 p-4">
										<div className="flex items-center gap-3 mb-3">
											<div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500" />
											<div>
												<div className="h-2 w-16 rounded bg-white/10" />
												<div className="h-1.5 w-10 rounded bg-white/5 mt-1" />
											</div>
										</div>
										<div className="space-y-2">
											<div className="h-2 w-full rounded bg-white/5" />
											<div className="h-2 w-2/3 rounded bg-white/5" />
										</div>
									</div>
									<div className="h-20 rounded-xl bg-purple-500/10 border border-purple-500/20 p-4">
										<div className="h-3 w-24 rounded bg-purple-500/20 mb-2" />
										<div className="h-4 w-16 rounded bg-purple-500/30" />
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Glow effect */}
					<div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-3xl blur-3xl -z-10" />
				</motion.div>
			</div>
		</section>
	);
}