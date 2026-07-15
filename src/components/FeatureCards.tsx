import { motion } from "framer-motion";
import { Bell, Zap, RefreshCw } from "lucide-react";

const features = [
	{
		icon: Bell,
		title: "Smart Notifications",
		description: "Get timely reminders that keep you on track without overwhelming your workflow.",
		color: "from-blue-500/20 to-indigo-500/20",
		iconColor: "text-blue-400",
	},
	{
		icon: Zap,
		title: "Pomodoro Integration",
		description: "Focus timer built in. Start a session with one click and maintain your productivity streak.",
		color: "from-amber-500/20 to-orange-500/20",
		iconColor: "text-amber-400",
	},
	{
		icon: RefreshCw,
		title: "Cross-Platform Sync",
		description: "Seamlessly sync across Mac, iPhone, iPad, and web. Your tasks follow you everywhere.",
		color: "from-emerald-500/20 to-teal-500/20",
		iconColor: "text-emerald-400",
	},
];

export default function FeatureCards() {
	return (
		<section className="py-24 px-6">
			<div className="max-w-5xl mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{features.map((feature, index) => (
						<motion.div
							key={feature.title}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-50px" }}
							transition={{ duration: 0.6, delay: index * 0.15 }}
							className="glass rounded-2xl p-6 hover:bg-white/[0.08] transition-all duration-300 group"
						>
							<div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
								<feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
							</div>
							<h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
							<p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}