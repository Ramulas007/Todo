import { useState, useEffect, useCallback } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

const BREAKPOINTS = {
	mobile: 0,
	tablet: 640,
	desktop: 1024,
} as const;

export function useBreakpoint(): Breakpoint {
	const get = useCallback((): Breakpoint => {
		const w = window.innerWidth;
		if (w >= BREAKPOINTS.desktop) return "desktop";
		if (w >= BREAKPOINTS.tablet) return "tablet";
		return "mobile";
	}, []);

	const [bp, setBp] = useState<Breakpoint>(get);

	useEffect(() => {
		function onResize() {
			setBp(get());
		}
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, [get]);

	return bp;
}

export function useMediaQuery(query: string): boolean {
	const get = useCallback(() => window.matchMedia(query).matches, [query]);
	const [matches, setMatches] = useState(get);

	useEffect(() => {
		const mql = window.matchMedia(query);
		function onChange() {
			setMatches(mql.matches);
		}
		mql.addEventListener("change", onChange);
		return () => mql.removeEventListener("change", onChange);
	}, [query]);

	return matches;
}

export function useIsReducedMotion(): boolean {
	return useMediaQuery("(prefers-reduced-motion: reduce)");
}
