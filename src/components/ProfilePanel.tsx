import { useState } from "react";
import { useStore } from "../store/useStore";
import type { User } from "../types/board.types";

interface Props {
	onClose: () => void;
}

export default function ProfilePanel({ onClose }: Props) {
	const currentUser = useStore((s) => s.currentUser);
	const updateUser = useStore((s) => s.updateUser);
	const users = useStore((s) => s.users);

	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState({
		name: currentUser?.name ?? "",
		email: currentUser?.email ?? "",
		team: currentUser?.team ?? "",
		title: currentUser?.title ?? "",
	});
	const [error, setError] = useState("");
	const [saved, setSaved] = useState(false);

	if (!currentUser) return null;

	function handleSave() {
		setError("");

		if (!draft.name.trim()) {
			setError("Name is required");
			return;
		}
		if (!draft.email.trim()) {
			setError("Email is required");
			return;
		}

		// Check for duplicate email
		const emailExists = users.some(
			(u) => u.id !== currentUser.id && u.email === draft.email.toLowerCase().trim()
		);
		if (emailExists) {
			setError("This email is already in use by another account");
			return;
		}

		updateUser(currentUser.id, {
			name: draft.name.trim(),
			email: draft.email.trim().toLowerCase(),
			team: draft.team.trim(),
			title: draft.title.trim(),
		});

		setEditing(false);
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
			<div className="relative w-[400px] rounded-2xl bg-[#12121a] border border-white/10 shadow-2xl overflow-hidden">
				{/* Header */}
				<div className="p-6 pb-4 border-b border-white/5">
					<div className="flex items-center justify-between mb-4">
						<p className="text-xs text-white/40 font-medium">Profile</p>
						<button type="button" onClick={onClose}
							className="text-white/30 hover:text-white/60 transition-colors">
							<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
								<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
							</svg>
						</button>
					</div>
					<div className="flex items-center gap-4">
						<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shrink-0">
							{currentUser.name.split(" ").map((n) => n[0]).join("")}
						</div>
						<div>
							<h2 className="text-lg font-semibold text-white">{currentUser.name}</h2>
							<p className="text-sm text-white/40 capitalize">{currentUser.role}</p>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="p-6">
					{error && (
						<div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
							{error}
						</div>
					)}
					{saved && (
						<div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
							Profile updated successfully
						</div>
					)}

					<div className="space-y-4">
						<div>
							<label className="block text-xs uppercase tracking-wider text-white/60 mb-1.5">Name</label>
							{editing ? (
								<input type="text" value={draft.name}
									onChange={(e) => setDraft({ ...draft, name: e.target.value })}
									className="w-full rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-2.5 text-sm text-white outline-none focus:border-white/20 transition-colors"
								/>
							) : (
								<p className="text-sm text-white/70">{currentUser.name}</p>
							)}
						</div>
						<div>
							<label className="block text-xs uppercase tracking-wider text-white/60 mb-1.5">Email</label>
							{editing ? (
								<input type="email" value={draft.email}
									onChange={(e) => setDraft({ ...draft, email: e.target.value })}
									className="w-full rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-2.5 text-sm text-white outline-none focus:border-white/20 transition-colors"
								/>
							) : (
								<p className="text-sm text-white/70">{currentUser.email}</p>
							)}
						</div>
						<div>
							<label className="block text-xs uppercase tracking-wider text-white/60 mb-1.5">Team</label>
							{editing ? (
								<input type="text" value={draft.team}
									onChange={(e) => setDraft({ ...draft, team: e.target.value })}
									className="w-full rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-2.5 text-sm text-white outline-none focus:border-white/20 transition-colors"
								/>
							) : (
								<p className="text-sm text-white/70">{currentUser.team || "—"}</p>
							)}
						</div>
						<div>
							<label className="block text-xs uppercase tracking-wider text-white/60 mb-1.5">Title</label>
							{editing ? (
								<input type="text" value={draft.title}
									onChange={(e) => setDraft({ ...draft, title: e.target.value })}
									className="w-full rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-2.5 text-sm text-white outline-none focus:border-white/20 transition-colors"
								/>
							) : (
								<p className="text-sm text-white/70">{currentUser.title || "—"}</p>
							)}
						</div>
					</div>

					<div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/5">
						{editing ? (
							<>
								<button type="button" onClick={() => { setEditing(false); setDraft({ name: currentUser.name, email: currentUser.email, team: currentUser.team, title: currentUser.title }); setError(""); }}
									className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/50 hover:text-white transition-all">
									Cancel
								</button>
								<button type="button" onClick={handleSave}
									className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-sm font-semibold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all">
									Save
								</button>
							</>
						) : (
							<button type="button" onClick={() => setEditing(true)}
								className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all">
								Edit Profile
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
