import type { ReactNode } from "react";

interface Props {
	children: ReactNode;
	className?: string;
	variant?: "default" | "card" | "active";
	onClick?: () => void;
}

export default function GlassPanel({ children, className = "", variant = "default", onClick }: Props) {
	const base = "rounded-2xl transition-all duration-200";
	const variants = {
		default: "glass",
		card: "glass-card",
		active: "glass ring-1 ring-white/20 bg-white/12",
	};

	return (
		<div className={`${base} ${variants[variant]} ${className}`} onClick={onClick}>
			{children}
		</div>
	);
}