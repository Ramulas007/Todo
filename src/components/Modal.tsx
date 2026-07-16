import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface ModalProps {
	/** Accessible title, wired to aria-labelledby. */
	titleId: string;
	/** Called on Escape and (when allowed) backdrop click. */
	onClose: () => void;
	/** When false, backdrop click won't dismiss (Escape still works). */
	dismissOnBackdrop?: boolean;
	children: ReactNode;
}

const FOCUSABLE =
	'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export default function Modal({
	titleId,
	onClose,
	dismissOnBackdrop = true,
	children,
}: ModalProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	const previouslyFocused = useRef<HTMLElement | null>(null);
	const prefersReduced = useReducedMotion();

	useEffect(() => {
		previouslyFocused.current = document.activeElement as HTMLElement | null;

		const panel = panelRef.current;
		const focusables = panel?.querySelectorAll<HTMLElement>(FOCUSABLE);
		const initial =
			panel?.querySelector<HTMLElement>("[data-autofocus]") ??
			focusables?.[focusables.length - 1] ??
			panel;
		initial?.focus();

		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				e.stopPropagation();
				onClose();
				return;
			}
			if (e.key !== "Tab" || !panel) return;

			const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
			if (items.length === 0) return;
			const first = items[0];
			const last = items[items.length - 1];

			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}

		document.addEventListener("keydown", onKeyDown, true);
		return () => {
			document.removeEventListener("keydown", onKeyDown, true);
			previouslyFocused.current?.focus?.();
		};
	}, [onClose]);

	return (
		<AnimatePresence>
			<motion.div
				key="modal-backdrop"
				initial={prefersReduced ? false : { opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={prefersReduced ? undefined : { opacity: 0 }}
				transition={{ duration: 0.25 }}
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
				onMouseDown={(e) => {
					if (dismissOnBackdrop && e.target === e.currentTarget) onClose();
				}}
			>
				<motion.div
					ref={panelRef}
					role="dialog"
					aria-modal="true"
					aria-labelledby={titleId}
					initial={prefersReduced ? false : { opacity: 0, scale: 0.7, y: 40 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={prefersReduced ? undefined : { opacity: 0, scale: 0.85, y: 20 }}
					transition={{
						type: "spring",
						damping: 20,
						stiffness: 300,
						mass: 0.8,
					}}
					className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a1d27] p-5 shadow-2xl shadow-black/50"
				>
					{children}
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
