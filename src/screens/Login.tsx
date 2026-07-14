import { useState } from "react";
import type { FormEvent } from "react";
import { useStore } from "../store/useStore";

interface LoginProps {
	onLogin: (email: string, password: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
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

		setTimeout(() => {
			const success = onLogin(email, password);
			setIsSubmitting(false);
			if (!success) {
				setError("Invalid email or password. Try one of the demo accounts.");
			}
		}, 400);
	}

	return (
		<div className="min-h-screen bg-[#0f1117] flex relative overflow-hidden">
			{/* Left branding panel */}
			<div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-600/20 via-[#0f1117] to-[#0f1117] items-center justify-center p-12">
				<div className="absolute top-20 left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-float" />
				<div className="absolute bottom-20 right-20 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-1.5s" }} />
				<div className="absolute inset-0 opacity-[0.03]"
					style={{
						backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
						backgroundSize: '40px 40px'
					}}
				/>
				<div className="relative z-10 max-w-md animate-page-enter">
					<div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-8">
						<svg viewBox="0 0 24 24" className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="1.5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
						</svg>
					</div>
					<h2 className="text-3xl font-bold text-white tracking-tight mb-4">
						Organize your work with elegance
					</h2>
					<p className="text-slate-400 text-lg leading-relaxed">
						A collaborative workspace designed for teams who value simplicity and clarity.
					</p>
					<div className="mt-12 flex items-center gap-8">
						<div>
							<p className="text-2xl font-bold gradient-text">50K+</p>
							<p className="text-xs text-slate-500 mt-1">Active teams</p>
						</div>
						<div className="w-px h-10 bg-white/10" />
						<div>
							<p className="text-2xl font-bold gradient-text">99.9%</p>
							<p className="text-xs text-slate-500 mt-1">Uptime</p>
						</div>
						<div className="w-px h-10 bg-white/10" />
						<div>
							<p className="text-2xl font-bold gradient-text">4.9/5</p>
							<p className="text-xs text-slate-500 mt-1">Rating</p>
						</div>
					</div>
				</div>
			</div>

			{/* Right login panel */}
			<div className="flex-1 flex items-center justify-center px-6 py-12 relative">
				<div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
				<div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />

				<div className="relative w-full max-w-md animate-page-enter">
					<div className="lg:hidden mb-8 text-center">
						<div className="inline-flex items-center gap-2.5 mb-4">
							<div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
								<svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
									<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
								</svg>
							</div>
							<span className="text-xl font-bold text-white tracking-tight">Workelo</span>
						</div>
					</div>

					<div className="mb-8">
						<h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
						<p className="mt-2 text-sm text-slate-400">Sign in to pick up where your board left off.</p>
					</div>

					<form onSubmit={handleSubmit}
						className="bg-[#1a1d27]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl shadow-black/40"
						noValidate
					>
						{error && (
							<div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 flex items-center gap-2 animate-slide-up">
								<svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
									<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
								</svg>
								{error}
							</div>
						)}

						<label className="block mb-4">
							<span className="block text-xs font-medium text-slate-400 mb-2">Email address</span>
							<input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
								placeholder="you@company.com" autoComplete="email"
								className="w-full rounded-xl bg-[#22263a] border border-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
							/>
						</label>

						<label className="block mb-4">
							<div className="flex items-center justify-between mb-2">
								<span className="text-xs font-medium text-slate-400">Password</span>
								<a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</a>
							</div>
							<div className="relative">
								<input type={showPassword ? "text" : "password"} value={password}
									onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password"
									className="w-full rounded-xl bg-[#22263a] border border-white/5 px-4 py-3 pr-12 text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
								/>
								<button type="button" onClick={() => setShowPassword((s) => !s)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
									aria-label={showPassword ? "Hide password" : "Show password"}
								>
									{showPassword ? (
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
											<path d="M2 2l20 20M9.88 9.88a3 3 0 104.24 4.24M10.73 5.08A10.43 10.43 0 0112 5c7 0 10 7 10 7a13.16 13.16 0 01-1.67 2.68M6.61 6.61A13.526 13.526 0 0012 19c7 0 10-7 10-7a13.24 13.24 0 01-2.16-2.79" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
										</svg>
									) : (
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
											<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
											<circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
										</svg>
									)}
								</button>
							</div>
						</label>

						<label className="flex items-center gap-3 mb-6 cursor-pointer select-none group">
							<div className="relative">
								<input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="peer sr-only" />
								<div className="w-4 h-4 rounded border border-slate-600 bg-[#22263a] peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all duration-200 flex items-center justify-center">
									{remember && (
										<svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
											<path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
										</svg>
									)}
								</div>
							</div>
							<span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Keep me signed in</span>
						</label>

						<button type="submit" disabled={isSubmitting}
							className="w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{isSubmitting ? (
								<>
									<span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
									Signing in...
								</>
							) : "Sign in"}
						</button>

						<div className="my-6 flex items-center gap-3">
							<div className="h-px flex-1 bg-white/10" />
							<span className="text-xs text-slate-500 font-medium">or</span>
							<div className="h-px flex-1 bg-white/10" />
						</div>

						<button type="button"
							className="w-full rounded-xl border border-white/10 bg-[#22263a]/50 py-3 text-sm font-medium text-slate-200 transition-all duration-200 hover:border-indigo-500/30 hover:bg-[#262b42] flex items-center justify-center gap-3"
						>
							<svg width="18" height="18" viewBox="0 0 24 24">
								<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
								<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
								<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
								<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
							</svg>
							Continue with Google
						</button>
					</form>

					<p className="mt-8 text-center text-sm text-slate-500">
						Demo accounts: admin@workelo.test / Admin#2026 or ava@workelo.test / Ava#2026
					</p>
				</div>
			</div>
		</div>
	);
}
