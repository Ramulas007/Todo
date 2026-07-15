import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import BlobBackground from "../components/BlobBackground";
import { useStore } from "../store/useStore";

const GOOGLE_CLIENT_ID = "641369217488-1sf75tdga483bso1egddbpjfcfabf8so.apps.googleusercontent.com";

interface Props {
	onNavigate: (path: string) => void;
}

declare global {
	interface Window {
		google?: {
			accounts: {
				id: {
					initialize: (config: {
						client_id: string;
						callback: (response: { credential: string }) => void;
					}) => void;
					renderButton: (parent: HTMLElement, config: Record<string, unknown>) => void;
					prompt: () => void;
				};
			};
		};
	}
}

export default function LoginNew({ onNavigate }: Props) {
	const login = useStore((s) => s.login);
	const googleLogin = useStore((s) => s.googleLogin);

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [googleReady, setGoogleReady] = useState(false);
	const googleBtnContainerRef = useRef<HTMLDivElement>(null);

	const handleGoogleCredential = useCallback((response: { credential: string }) => {
		try {
			const payload = JSON.parse(atob(response.credential.split(".")[1]));
			googleLogin(payload.email, payload.name, payload.picture);
			onNavigate("/dashboard");
		} catch {
			setError("Google sign-in failed. Please try again.");
		}
	}, [googleLogin, onNavigate]);

	useEffect(() => {
		function initGoogle() {
			if (!window.google?.accounts?.id) return;

			window.google.accounts.id.initialize({
				client_id: GOOGLE_CLIENT_ID,
				callback: handleGoogleCredential,
			});

			if (googleBtnContainerRef.current) {
				googleBtnContainerRef.current.innerHTML = "";
				window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
					theme: "outline",
					size: "large",
					width: "100%",
					shape: "rectangular",
					text: "continue_with",
				});
				setGoogleReady(true);
			}
		}

		if (window.google?.accounts?.id) {
			initGoogle();
		} else {
			const interval = setInterval(() => {
				if (window.google?.accounts?.id) {
					initGoogle();
					clearInterval(interval);
				}
			}, 100);
			return () => clearInterval(interval);
		}
	}, [handleGoogleCredential]);

	function handleLogin(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		setTimeout(() => {
			const success = login(email, password);
			setIsLoading(false);
			if (success) {
				const user = useStore.getState().currentUser;
				onNavigate(user?.role === "admin" ? "/admin" : "/dashboard");
			} else {
				setError("Invalid email or password. Try demo@workelo.test / Admin#2026");
			}
		}, 500);
	}

	function handleGoogleLogin() {
		setError("");
		const googleBtn = googleBtnContainerRef.current?.querySelector<HTMLElement>("div[role='button'], iframe");
		if (googleBtn) {
			googleBtn.click();
		} else {
			setError("Google sign-in is loading. Please wait a moment and try again.");
		}
	}

	return (
		<div className="min-h-screen bg-[#050508] flex items-center justify-center relative overflow-hidden">
			<BlobBackground />

			<div className="fixed top-[10%] left-[5%] w-64 h-64 rounded-full bg-gradient-to-br from-orange-500/12 to-amber-500/8 blur-[100px] pointer-events-none" />
			<div className="fixed bottom-[15%] right-[10%] w-48 h-48 rounded-full bg-gradient-to-br from-blue-500/12 to-indigo-500/8 blur-[100px] pointer-events-none" />

			{/* Logo */}
			<div className="absolute top-6 left-6 z-10 cursor-pointer" onClick={() => onNavigate("/")}>
				<div className="flex items-center gap-3">
					<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
						<svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
					</div>
					<span className="text-lg font-bold text-white">AuraTask</span>
				</div>
			</div>

			{/* Login card */}
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5 }}
				className="relative z-10 w-full max-w-md mx-4"
			>
				<div className="glass rounded-3xl p-8">
					<div className="text-center mb-8">
						<h1 className="text-2xl font-bold text-white mb-2">Welcome Back to</h1>
						<h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">AuraTask</h2>
					</div>

					{error && (
						<div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
							{error}
						</div>
					)}

					<form onSubmit={handleLogin} className="space-y-4">
						<div>
							<label className="block text-xs font-medium text-white/50 mb-1.5">Email Address</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="dave@email.com"
								className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 outline-none focus:border-white/20 transition-colors"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-white/50 mb-1.5">Password</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									className="w-full px-4 py-3 pr-10 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 outline-none focus:border-white/20 transition-colors"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
								>
									{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-50"
						>
							{isLoading ? "Signing in..." : "Log In"}
						</button>
					</form>

					<div className="mt-4 text-center">
						<button className="text-xs text-white/40 hover:text-white/60 transition-colors">
							Forgot Password?
						</button>
					</div>

					<div className="mt-4 text-center text-sm text-white/40">
						Don't have an account yet?{" "}
						<button onClick={() => onNavigate("/signup")} className="text-white font-medium hover:text-white/80 transition-colors">
							Sign Up
						</button>
					</div>

					<div className="flex items-center gap-3 my-6">
						<div className="h-px flex-1 bg-white/10" />
						<span className="text-xs text-white/30">Or continue with</span>
						<div className="h-px flex-1 bg-white/10" />
					</div>

					{/* Hidden Google rendered button */}
					<div ref={googleBtnContainerRef} className="absolute opacity-0 pointer-events-none" />

					{/* Custom styled button that triggers the hidden Google button */}
					<button
						type="button"
						onClick={handleGoogleLogin}
						disabled={!googleReady}
						className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
					>
						<svg className="w-4 h-4" viewBox="0 0 24 24">
							<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
							<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
							<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
							<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
						</svg>
						{googleReady ? "Continue with Google" : "Loading Google sign-in..."}
					</button>
				</div>
			</motion.div>
		</div>
	);
}
