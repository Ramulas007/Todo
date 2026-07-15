import { MessageCircle, Globe, Mail } from "lucide-react";

export default function Footer() {
	return (
		<footer className="py-8 px-6 border-t border-white/5">
			<div className="max-w-5xl mx-auto flex items-center justify-between">
				<p className="text-sm text-white/30">© 2026 AuraTask. All rights reserved.</p>
				<div className="flex items-center gap-4">
					<a href="#" className="text-white/30 hover:text-white/60 transition-colors">
						<Globe className="w-4 h-4" />
					</a>
					<a href="#" className="text-white/30 hover:text-white/60 transition-colors">
						<MessageCircle className="w-4 h-4" />
					</a>
					<a href="#" className="text-white/30 hover:text-white/60 transition-colors">
						<Mail className="w-4 h-4" />
					</a>
				</div>
			</div>
		</footer>
	);
}