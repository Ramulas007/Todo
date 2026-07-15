import type { DashboardWidget, WidgetTone } from '../types/user.types'

const toneStyles: Record<WidgetTone, string> = {
	cyan: 'border-l-cyan-400/60 bg-cyan-400/8',
	amber: 'border-l-amber-400/60 bg-amber-400/8',
	emerald: 'border-l-emerald-400/60 bg-emerald-400/8',
	rose: 'border-l-rose-400/60 bg-rose-400/8',
	violet: 'border-l-violet-400/60 bg-violet-400/8',
}

const toneText: Record<WidgetTone, string> = {
	cyan: 'text-cyan-400',
	amber: 'text-amber-400',
	emerald: 'text-emerald-400',
	rose: 'text-rose-400',
	violet: 'text-violet-400',
}

function toneClass(tone: WidgetTone) {
	return toneStyles[tone]
}

function toneTextClass(tone: WidgetTone) {
	return toneText[tone]
}

export function DashboardWidgetGrid({
	widgets,
	compact = false,
}: {
	widgets: DashboardWidget[]
	compact?: boolean
}) {
	return (
		<div className={compact ? 'grid gap-3 md:grid-cols-2' : 'grid gap-4 xl:grid-cols-2'}>
			{widgets.map((widget) => (
				<WidgetCard key={widget.id} widget={widget} compact={compact} />
			))}
		</div>
	)
}

function WidgetCard({
	widget,
	compact = false,
}: {
	widget: DashboardWidget
	compact?: boolean
}) {
	const tone = toneClass(widget.tone)
	const textColor = toneTextClass(widget.tone)

	if (widget.type === 'stat') {
		return (
			<section className={`rounded-xl border-l-[3px] border border-white/5 ${tone} p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}>
				<div className="flex items-center justify-between mb-2">
					<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">
						{widget.label}
					</p>
					<span className="text-sm">📊</span>
				</div>
				<div className="text-2xl font-bold text-white">{widget.value}</div>
				<p className="mt-1.5 text-xs text-slate-400">{widget.detail}</p>
			</section>
		)
	}

	if (widget.type === 'project') {
		return (
			<section className={`rounded-xl border-l-[3px] border border-white/5 ${tone} p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}>
				<div className="flex items-start justify-between gap-2 mb-2">
					<div>
						<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">
							Project
						</p>
						<h3 className="mt-1.5 text-sm font-semibold text-white">{widget.title}</h3>
					</div>
					<span className={`text-xs font-medium ${textColor} bg-white/5 px-2 py-0.5 rounded-full`}>
						{widget.status}
					</span>
				</div>
				<div className="mt-3 h-1.5 rounded-full bg-white/5">
					<div
						className="h-1.5 rounded-full bg-white transition-all duration-500"
						style={{ width: `${widget.progress}%` }}
					/>
				</div>
				<div className="mt-2 flex items-center justify-between text-xs text-slate-400">
					<span>{widget.detail}</span>
					<span className="font-medium">{widget.progress}%</span>
				</div>
			</section>
		)
	}

	if (widget.type === 'note') {
		return (
			<section className={`rounded-xl border-l-[3px] border border-white/5 ${tone} p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}>
				<div className="flex items-center gap-2 mb-2">
					<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">
						Note
					</p>
					<span className="text-sm">📝</span>
				</div>
				<h3 className="text-sm font-semibold text-white mb-1.5">{widget.title}</h3>
				<p className="text-xs leading-relaxed text-slate-400">{widget.body}</p>
			</section>
		)
	}

	return (
		<section className={`rounded-xl border-l-[3px] border border-white/5 ${tone} p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}>
			<div className="flex items-center gap-2 mb-2">
				<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">
					Timeline
				</p>
				<span className="text-sm">🕐</span>
			</div>
			<h3 className="text-sm font-semibold text-white mb-2">{widget.title}</h3>
			<ul className={compact ? 'space-y-1.5 text-xs text-slate-400' : 'space-y-2 text-xs text-slate-400'}>
				{widget.entries.map((entry) => (
					<li key={entry} className="flex items-start gap-2">
						<span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${textColor} shrink-0`} />
						<span>{entry}</span>
					</li>
				))}
			</ul>
		</section>
	)
}