import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Props {
	onNavigate?: (path: string) => void;
}

export default function HeroSection({ onNavigate }: Props) {
	return (
		<section className="relative min-h-screen flex items-center justify-center px-6 pt-24">
			<div className="max-w-4xl mx-auto text-center">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				>
					<h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
						Master Your Day with{" "}
						<br />
						<span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
							AuraTask: The Future of
							<br />
							Task Management.
						</span>
					</h1>
				</motion.div>

				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
					className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10"
				>
					A beautiful, focused platform for personal and team productivity.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
				>
					<button
						onClick={() => onNavigate?.("/login")}
						className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
					>
						Try AuraTask Free
						<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
					</button>
				</motion.div>
			</div>
		</section>
	);
}