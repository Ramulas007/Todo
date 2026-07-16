import { motion } from "framer-motion";
import { Check } from "lucide-react";
import BlobBackground from "../components/BlobBackground";
import BackButton from "../components/BackButton";

interface Props {
	onNavigate: (path: string) => void;
}

const PLANS = [
	{
		name: "Free",
		price: "$0",
		period: "forever",
		desc: "Perfect for individuals getting started",
		features: [
			"1 personal board",
			"Up to 50 cards",
			"Basic Kanban view",
			"Today view",
			"Pomodoro timer",
			"Mobile access",
		],
		cta: "Get Started",
		primary: false,
	},
	{
		name: "Pro",
		price: "$12",
		period: "/month",
		desc: "For power users who want the full experience",
		features: [
			"Unlimited boards",
			"Unlimited cards",
			"Calendar view",
			"Dashboard analytics",
			"Habit tracker",
			"Journal",
			"Sketch canvas",
			"Priority support",
		],
		cta: "Start Free Trial",
		primary: true,
	},
	{
		name: "Team",
		price: "$29",
		period: "/month",
		desc: "For teams that need collaboration tools",
		features: [
			"Everything in Pro",
			"Up to 20 team members",
			"Admin panel",
			"Team analytics",
			"Role-based access",
			"Audit log",
			"Dedicated support",
			"Custom integrations",
		],
		cta: "Contact Sales",
		primary: false,
	},
];

export default function PricingPage({ onNavigate }: Props) {
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
							Simple, transparent{" "}
							<span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">pricing</span>
						</h1>
						<p className="text-lg text-white/40 max-w-2xl mx-auto">
							Start free, upgrade when you need more. No hidden fees.
						</p>
					</motion.div>
				</section>

				{/* Pricing Cards */}
				<section className="max-w-5xl mx-auto px-8 pb-20">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{PLANS.map((plan, i) => (
							<motion.div
								key={plan.name}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.4, delay: i * 0.1 }}
								className={`rounded-2xl p-6 transition-all duration-300 ${
									plan.primary
										? "glass ring-2 ring-indigo-500/30 bg-indigo-500/5"
										: "glass hover:bg-white/[0.06]"
								}`}
							>
								{plan.primary && (
									<span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-medium text-indigo-400 mb-4">
										Most Popular
									</span>
								)}
								<h3 className="text-lg font-semibold text-white">{plan.name}</h3>
								<div className="flex items-baseline gap-1 mt-2 mb-1">
									<span className="text-3xl font-bold text-white">{plan.price}</span>
									<span className="text-sm text-white/40">{plan.period}</span>
								</div>
								<p className="text-sm text-white/40 mb-5">{plan.desc}</p>
								<ul className="space-y-2.5 mb-6">
									{plan.features.map((f) => (
										<li key={f} className="flex items-center gap-2.5 text-sm text-white/60">
											<Check className="w-4 h-4 text-emerald-400 shrink-0" />
											{f}
										</li>
									))}
								</ul>
								<button
									onClick={() => onNavigate("/login")}
									className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
										plan.primary
											? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25"
											: "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
									}`}
								>
									{plan.cta}
								</button>
							</motion.div>
						))}
					</div>
				</section>
			</div>
		</div>
	);
}
