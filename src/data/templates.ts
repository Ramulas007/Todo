import type { Priority } from "../types/board.types";

export interface CardTemplate {
	id: string;
	name: string;
	icon: string;
	description: string;
	color: string;
	defaults: {
		title: string;
		description: string;
		priority: Priority;
		tags: string[];
		tasks: { title: string; description: string }[];
	};
}

export const CARD_TEMPLATES: CardTemplate[] = [
	{
		id: "tpl-bug",
		name: "Bug Report",
		icon: "🐛",
		description: "Report and track a bug",
		color: "#ef4444",
		defaults: {
			title: "Bug: ",
			description:
				"## Steps to Reproduce\n1. \n2. \n3. \n\n## Expected Behavior\n\n\n## Actual Behavior\n\n\n## Environment\n- Browser: \n- OS: ",
			priority: "high",
			tags: ["bug"],
			tasks: [
				{ title: "Reproduce the bug", description: "" },
				{ title: "Identify root cause", description: "" },
				{ title: "Implement fix", description: "" },
				{ title: "Verify fix", description: "" },
			],
		},
	},
	{
		id: "tpl-feature",
		name: "Feature Request",
		icon: "✨",
		description: "Propose a new feature",
		color: "#6366f1",
		defaults: {
			title: "Feature: ",
			description:
				"## User Story\nAs a [user], I want [feature] so that [benefit].\n\n## Acceptance Criteria\n- [ ] \n- [ ] \n\n## Design\n",
			priority: "medium",
			tags: ["feature"],
			tasks: [
				{ title: "Define scope", description: "" },
				{ title: "Design solution", description: "" },
				{ title: "Implement", description: "" },
				{ title: "Test", description: "" },
				{ title: "Ship", description: "" },
			],
		},
	},
	{
		id: "tpl-meeting",
		name: "Meeting Notes",
		icon: "📝",
		description: "Capture meeting outcomes",
		color: "#10b981",
		defaults: {
			title: "Meeting: ",
			description:
				"## Attendees\n\n\n## Agenda\n1. \n2. \n\n## Discussion\n\n\n## Decisions\n- \n\n## Action Items\n- [ ] ",
			priority: "low",
			tags: ["meeting"],
			tasks: [],
		},
	},
	{
		id: "tpl-sprint",
		name: "Sprint Task",
		icon: "🏃",
		description: "Standard sprint work item",
		color: "#f59e0b",
		defaults: {
			title: "",
			description: "## Acceptance Criteria\n- [ ] \n\n## Technical Notes\n",
			priority: "medium",
			tags: [],
			tasks: [
				{ title: "Implementation", description: "" },
				{ title: "Code review", description: "" },
				{ title: "QA testing", description: "" },
			],
		},
	},
	{
		id: "tpl-research",
		name: "Research",
		icon: "🔍",
		description: "Investigate and document findings",
		color: "#8b5cf6",
		defaults: {
			title: "Research: ",
			description:
				"## Question\n\n\n## Sources\n- \n\n## Findings\n\n\n## Recommendation\n",
			priority: "low",
			tags: ["research"],
			tasks: [
				{ title: "Gather sources", description: "" },
				{ title: "Analyze findings", description: "" },
				{ title: "Write recommendation", description: "" },
			],
		},
	},
	{
		id: "tpl-design",
		name: "Design Task",
		icon: "🎨",
		description: "UI/UX design work",
		color: "#ec4899",
		defaults: {
			title: "Design: ",
			description:
				"## Brief\n\n\n## Constraints\n- \n\n## Deliverables\n- [ ] Wireframe\n- [ ] Prototype\n- [ ] Handoff specs",
			priority: "medium",
			tags: ["design"],
			tasks: [
				{ title: "Wireframe", description: "" },
				{ title: "High-fidelity mockup", description: "" },
				{ title: "Prototype interactions", description: "" },
				{ title: "Design review", description: "" },
				{ title: "Developer handoff", description: "" },
			],
		},
	},
];