interface Props {
	variant?: "landing" | "auth";
	onNavigate?: (path: string) => void;
}

export default function Navbar({ variant = "landing", onNavigate }: Props) {
	function nav(path: string) {
		onNavigate?.(path);
	}

	return (
		<nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
			<div className="max-w-7xl mx-auto flex items-center justify-between">
				<div className="flex items-center gap-3 cursor-pointer" onClick={() => nav("/")}>
					<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
						<svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
					</div>
					<span className="text-lg font-bold text-white">AuraTask</span>
				</div>

				<div className="flex items-center gap-6">
					{variant === "landing" && (
						<>
							<button onClick={() => nav("/features")} className="text-sm text-white/60 hover:text-white transition-colors">Features</button>
							<button onClick={() => nav("/pricing")} className="text-sm text-white/60 hover:text-white transition-colors">Pricing</button>
							<button onClick={() => nav("/about")} className="text-sm text-white/60 hover:text-white transition-colors">About</button>
							<button onClick={() => nav("/login")} className="text-sm text-white/60 hover:text-white transition-colors">Log In</button>
						</>
					)}
					<button onClick={() => nav("/login")}
						className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-sm font-semibold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200">
						{variant === "landing" ? "Start Now" : "Login"}
					</button>
				</div>
			</div>
		</nav>
	);
}