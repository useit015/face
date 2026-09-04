import type { CSSProperties } from "react";
import { Reveal } from "@/components/reveal";
import { Expandable } from "@/components/expandable";
import { ScrollFadeX } from "@/components/scroll-fade-x";
import { SkillIcon } from "@/components/icons";
import { skillGroups } from "@/lib/content";

const skillChipClass =
	"inline-flex items-center gap-1.5 rounded-md text-body text-foreground-secondary outline-none transition-colors duration-200 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50";

function SkillChips({
	skills,
}: {
	skills: readonly {
		readonly name: string;
		readonly icon: string;
		readonly url: string;
	}[];
}) {
	return (
		<>
			{skills.map((skill) => (
				<li key={skill.name} className="shrink-0">
					<a
						href={skill.url}
						target="_blank"
						rel="noopener noreferrer"
						className={skillChipClass}
					>
						<SkillIcon
							name={skill.icon}
							className="size-3.5 shrink-0 text-foreground-tertiary"
						/>
						{skill.name}
					</a>
				</li>
			))}
		</>
	);
}

function SkillRow({
	label,
	skills,
	more,
	expanded,
	staggerIndex,
}: {
	label: string;
	skills: readonly {
		readonly name: string;
		readonly icon: string;
		readonly url: string;
	}[];
	more?: readonly {
		readonly name: string;
		readonly icon: string;
		readonly url: string;
	}[];
	expanded?: boolean;
	staggerIndex?: number;
}) {
	return (
		<div
			className={`grid grid-cols-[9rem_minmax(0,1fr)] items-start gap-x-2 min-[480px]:grid-cols-[10rem_minmax(0,1fr)] ${expanded ? "stagger-in" : ""}`}
			style={
				staggerIndex != null
					? ({ "--i": staggerIndex } as CSSProperties)
					: undefined
			}
		>
			<h3 className="pt-0.5 font-mono text-meta uppercase tracking-[0.12em] text-foreground-tertiary">
				{label}
			</h3>
			{expanded ? (
				<ul className="flex flex-wrap gap-x-3 gap-y-1.5">
					<SkillChips skills={skills} />
					{more?.map((skill, i) => (
						<li
							key={skill.name}
							className="chip-in shrink-0"
							style={{ "--i": i } as CSSProperties}
						>
							<a
								href={skill.url}
								target="_blank"
								rel="noopener noreferrer"
								className={skillChipClass}
							>
								<SkillIcon
									name={skill.icon}
									className="size-3.5 shrink-0 text-foreground-tertiary"
								/>
								{skill.name}
							</a>
						</li>
					))}
				</ul>
			) : (
				<ScrollFadeX
					as="ul"
					className="no-scrollbar flex flex-nowrap gap-x-3 overflow-x-auto"
				>
					<SkillChips skills={skills} />
				</ScrollFadeX>
			)}
		</div>
	);
}

export function SkillsSection() {
	return (
		<section aria-labelledby="skills-heading" className="flex flex-col gap-5">
			<Reveal variant="fade">
				<Expandable
					label="See more"
					header={
						<h2
							id="skills-heading"
							className="font-mono text-meta font-medium uppercase tracking-[0.14em] text-foreground-tertiary"
						>
							Skills
						</h2>
					}
					collapsed={
						<Reveal variant="stagger" className="flex flex-col gap-3 pt-5">
							{skillGroups.map((group) => (
								<SkillRow
									key={group.label}
									label={group.label}
									skills={group.skills}
								/>
							))}
						</Reveal>
					}
				>
					<div className="flex flex-col gap-3 pt-5">
						{skillGroups.map((group, i) => (
							<SkillRow
								key={group.label}
								label={group.label}
								skills={group.skills}
								more={group.more}
								expanded
								staggerIndex={i}
							/>
						))}
					</div>
				</Expandable>
			</Reveal>
		</section>
	);
}
