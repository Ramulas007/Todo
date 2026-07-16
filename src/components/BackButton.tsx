interface Props {
	onClick?: () => void;
	className?: string;
}

export default function BackButton({ onClick, className = "" }: Props) {
	return (
		<button
			type="button"
			onClick={onClick ?? (() => window.history.back())}
			className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-150 ${className}`}
		>
			<svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
				<path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
			Back
		</button>
	);
}
