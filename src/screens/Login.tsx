import { useState } from "react";
import type { FormEvent } from "react";
import type { AppUser } from "../types/user.types";
import { authenticateUser } from "../data/mockUsers";

interface LoginProps {
	users: AppUser[];
	onLogin: (email: string, password: string) => void;
}

export default function Login({ users, onLogin }: LoginProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [remember, setRemember] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		setError(null);

		if (!email.trim() || !password) {
			setError("Enter your email and password to continue.");
			return;
		}

		setIsSubmitting(true);
		const authenticatedUser = authenticateUser(users, email, password);

		setTimeout(() => {
			setIsSubmitting(false);
			if (!authenticatedUser) {
				setError("Invalid email or password. Use one of the four approved demo accounts.");
				return;
			}

			onLogin(email, password);
		}, 600);
	}

	return (
		<div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4 relative overflow-hidden">
			{/* Ambient board-column glow, echoes the kanban lanes */}
			<div className="pointer-events-none absolute inset-0 flex gap-6 px-8 py-10 opacity-[0.35]">
				<div className="flex-1 rounded-2xl bg-[#1a1d27]" />
				<div className="flex-1 rounded-2xl bg-[#1a1d27]" />
				<div className="flex-1 rounded-2xl bg-[#1a1d27]" />
				<div className="flex-1 rounded-2xl bg-[#1a1d27]" />
			</div>
			<div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-150 h-150 rounded-full bg-indigo-500/10 blur-[120px]" />

			<div className="relative w-full max-w-sm">
				{/* Brand mark */}
				<div className="mb-8 text-center">
					<div className="inline-flex items-center gap-2 mb-4">
						<div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
							<svg
								viewBox="0 0 16 16"
								className="w-4 h-4 text-white"
								fill="none"
							>
								<rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
								<rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5" />
								<rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5" />
								<rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" />
							</svg>
						</div>
						<span className="text-lg font-bold text-white tracking-tight">
							Workelo
						</span>
					</div>
					<h1 className="text-2xl font-bold text-white tracking-tight">
						Welcome back
					</h1>
					<p className="mt-1.5 text-sm text-slate-400">
						Sign in to pick up where your board left off.
					</p>
				</div>

				{/* Card */}
				<form
					onSubmit={handleSubmit}
					className="bg-[#1a1d27] border border-white/5 rounded-2xl p-6 shadow-xl shadow-black/40"
					noValidate
				>
					{error && (
						<div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
							{error}
						</div>
					)}

					<label className="block mb-4">
						<span className="block text-xs font-medium text-slate-400 mb-1.5">
							Email
						</span>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@company.com"
							autoComplete="email"
							className="w-full rounded-lg bg-[#22263a] border border-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
						/>
					</label>

					<label className="block mb-4">
						<div className="flex items-center justify-between mb-1.5">
							<span className="text-xs font-medium text-slate-400">
								Password
							</span>
							<a
								href="#"
								className="text-xs text-indigo-400 hover:text-indigo-300 transition"
							>
								Forgot password?
							</a>
						</div>
						<div className="relative">
							<input
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								autoComplete="current-password"
								className="w-full rounded-lg bg-[#22263a] border border-white/5 px-3 py-2.5 pr-10 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
							/>
							<button
								type="button"
								onClick={() => setShowPassword((s) => !s)}
								className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
								aria-label={showPassword ? "Hide password" : "Show password"}
							>
								{showPassword ? (
									<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
										<path
											d="M2 2l12 12M6.6 6.7a2 2 0 0 0 2.7 2.7M4.3 4.3C2.7 5.4 1.5 7 1 8c1.3 2.8 4 5 7 5 1.1 0 2.2-.3 3.2-.8M12 11.4C13.2 10.4 14.2 9.2 15 8c-1.3-2.8-4-5-7-5-.6 0-1.3.1-1.9.3"
											stroke="currentColor"
											strokeWidth="1.3"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								) : (
									<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
										<path
											d="M1 8s2.7-5 7-5 7 5 7 5-2.7 5-7 5-7-5-7-5Z"
											stroke="currentColor"
											strokeWidth="1.3"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<circle
											cx="8"
											cy="8"
											r="2"
											stroke="currentColor"
											strokeWidth="1.3"
										/>
									</svg>
								)}
							</button>
						</div>
					</label>

					<label className="flex items-center gap-2 mb-5 cursor-pointer select-none">
						<input
							type="checkbox"
							checked={remember}
							onChange={(e) => setRemember(e.target.checked)}
							className="w-3.5 h-3.5 rounded border-white/10 bg-[#22263a] accent-indigo-500"
						/>
						<span className="text-xs text-slate-400">
							Keep me signed in
						</span>
					</label>

					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					>
						{isSubmitting ? (
							<>
								<span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
								Signing in…
							</>
						) : (
							"Sign in"
						)}
					</button>

					<div className="my-5 flex items-center gap-3">
						<div className="h-px flex-1 bg-white/10" />
						<span className="text-[11px] text-slate-500">or</span>
						<div className="h-px flex-1 bg-white/10" />
					</div>

					<button
						type="button"
						className="w-full rounded-lg border border-white/5 bg-[#22263a] py-2.5 text-sm font-medium text-slate-200 transition hover:border-indigo-500/30 hover:bg-[#262b42] flex items-center justify-center gap-2"
					>
						<svg width="16" height="16" viewBox="0 0 16 16">
							<path
								fill="#4285F4"
								d="M15.5 8.18c0-.57-.05-1.12-.15-1.64H8v3.1h4.2a3.6 3.6 0 0 1-1.56 2.36v1.96h2.52c1.48-1.36 2.34-3.36 2.34-5.78Z"
							/>
							<path
								fill="#34A853"
								d="M8 16c2.1 0 3.86-.7 5.15-1.89l-2.52-1.96c-.7.47-1.6.75-2.63.75-2.02 0-3.73-1.36-4.34-3.19H1.05v2.02A8 8 0 0 0 8 16Z"
							/>
							<path
								fill="#FBBC05"
								d="M3.66 9.71a4.8 4.8 0 0 1 0-3.42V4.27H1.05a8 8 0 0 0 0 7.46l2.61-2.02Z"
							/>
							<path
								fill="#EA4335"
								d="M8 3.18c1.14 0 2.16.39 2.97 1.16l2.23-2.23A7.9 7.9 0 0 0 8 0a8 8 0 0 0-6.95 4.27l2.61 2.02C4.27 4.55 5.98 3.18 8 3.18Z"
							/>
						</svg>
						Continue with Google
					</button>
				</form>

				<p className="mt-6 text-center text-xs text-slate-500">
					Don't have an account?{" "}
					<a href="#" className="text-indigo-400 hover:text-indigo-300 transition">
						Create one
					</a>
				</p>
			</div>
		</div>
	);
}
