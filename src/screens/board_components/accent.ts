// Maps a card/list accent key to a Tailwind utility backed by the
// --color-accent-* tokens. Full literal class strings so Tailwind's scanner
// keeps them. Anything unknown falls back to the brand primary.
const ACCENT_BG: Record<string, string> = {
	blue: "bg-accent-blue",
	green: "bg-accent-green",
	cyan: "bg-accent-cyan",
	rose: "bg-accent-rose",
	violet: "bg-accent-violet",
	amber: "bg-accent-amber",
};

export function accentBgClass(key: string): string {
	return ACCENT_BG[key] ?? "bg-primary";
}
