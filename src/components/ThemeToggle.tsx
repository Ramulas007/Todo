import { useTheme } from "../theme/useTheme";

export default function ThemeToggle({ className = "" }: { className?: string }) {
	const { isDark, toggle } = useTheme();

	return (
		<button
			type="button"
			onClick={toggle}
			aria-pressed={isDark}
			aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
			title={isDark ? "Switch to light theme" : "Switch to dark theme"}
			className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-all duration-300 hover:text-white hover:border-white/20 hover:bg-white/10 ${className}`}
		>
			<span className={`transition-transform duration-300 ${isDark ? 'rotate-0' : 'rotate-180'}`}>
				{isDark ? (
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
						<path
							d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
							stroke="currentColor"
							strokeWidth="1.8"
							strokeLinecap="round"
						/>
					</svg>
				) : (
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path
							d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
							stroke="currentColor"
							strokeWidth="1.8"
							strokeLinejoin="round"
						/>
					</svg>
				)}
			</span>
		</button>
	);
}
