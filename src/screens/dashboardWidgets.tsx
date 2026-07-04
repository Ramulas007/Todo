import type { DashboardWidget, WidgetTone } from '../types/user.types'

const toneStyles: Record<WidgetTone, string> = {
	cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100',
	amber: 'border-amber-400/20 bg-amber-400/10 text-amber-100',
	emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
	rose: 'border-rose-400/20 bg-rose-400/10 text-rose-100',
	violet: 'border-violet-400/20 bg-violet-400/10 text-violet-100',
}

function toneClass(tone: WidgetTone) {
	return toneStyles[tone]
}

export function DashboardWidgetGrid({
	widgets,
	compact = false,
}: {
	widgets: DashboardWidget[]
	compact?: boolean
}) {
	return (
		<div className={compact ? 'grid gap-4 md:grid-cols-2' : 'grid gap-4 xl:grid-cols-2'}>
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

	if (widget.type === 'stat') {
		return (
			<section className={`rounded-2xl border p-5 ${tone} backdrop-blur-sm`}>
				<p className="text-xs uppercase tracking-[0.2em] text-white/60">
					{widget.label}
				</p>
				<div className="mt-3 text-3xl font-semibold text-white">{widget.value}</div>
				<p className="mt-2 text-sm text-white/70">{widget.detail}</p>
			</section>
		)
	}

	if (widget.type === 'project') {
		return (
			<section className={`rounded-2xl border p-5 ${tone} backdrop-blur-sm`}>
				<div className="flex items-start justify-between gap-3">
					<div>
						<p className="text-xs uppercase tracking-[0.2em] text-white/60">
							Project
						</p>
						<h3 className="mt-2 text-lg font-semibold text-white">{widget.title}</h3>
					</div>
					<span className="rounded-full border border-white/10 bg-black/10 px-3 py-1 text-xs text-white/80">
						{widget.status}
					</span>
				</div>
				<div className="mt-4 h-2 rounded-full bg-white/10">
					<div
						className="h-2 rounded-full bg-white"
						style={{ width: `${widget.progress}%` }}
					/>
				</div>
				<div className="mt-2 flex items-center justify-between text-sm text-white/70">
					<span>{widget.detail}</span>
					<span>{widget.progress}%</span>
				</div>
			</section>
		)
	}

	if (widget.type === 'note') {
		return (
			<section className={`rounded-2xl border p-5 ${tone} backdrop-blur-sm`}>
				<p className="text-xs uppercase tracking-[0.2em] text-white/60">
					Note
				</p>
				<h3 className="mt-2 text-lg font-semibold text-white">{widget.title}</h3>
				<p className="mt-3 text-sm leading-6 text-white/75">{widget.body}</p>
			</section>
		)
	}

	return (
		<section className={`rounded-2xl border p-5 ${tone} backdrop-blur-sm`}>
			<p className="text-xs uppercase tracking-[0.2em] text-white/60">
				Timeline
			</p>
			<h3 className="mt-2 text-lg font-semibold text-white">{widget.title}</h3>
			<ul className={compact ? 'mt-3 space-y-2 text-sm text-white/75' : 'mt-4 space-y-3 text-sm text-white/75'}>
				{widget.entries.map((entry) => (
					<li key={entry} className="flex gap-3">
						<span className="mt-2 h-2 w-2 rounded-full bg-white/80" />
						<span>{entry}</span>
					</li>
				))}
			</ul>
		</section>
	)
}
