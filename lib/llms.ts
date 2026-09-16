import { contact, experience, hero, projects, skillGroups } from "./content";
import { siteUrl } from "./seo";

function skills(group: (typeof skillGroups)[number]) {
  return [...group.skills, ...group.more].map((skill) => skill.name).join(", ");
}

function projectMeta(project: (typeof projects)[number]) {
  return [project.stack.join(", "), project.note].filter(Boolean).join("; ");
}

function llmsTxt() {
  return [
    `# ${hero.name}`,
    "",
    `> ${hero.bioLead}`,
    "",
    hero.bioProof,
    "",
    `Source: ${siteUrl}`,
    "",
    "## Contact",
    "",
    `- Book a 15-minute call: ${contact.cal}`,
    `- Email: ${contact.email}`,
    `- GitHub: ${contact.github}`,
    `- LinkedIn: ${contact.linkedin}`,
    `- Toptal profile: ${contact.toptal}`,
    "",
    "## Experience",
    "",
    ...experience.map(
      (role) =>
        `- **${role.company}** — ${role.title} (${role.period}): ${role.summary}`,
    ),
    "",
    "## Projects",
    "",
    ...projects.map(
      (project) =>
        `- **${project.name}** — ${project.description} (${projectMeta(project)})${
          project.repo ? ` — ${project.repo.url}` : ""
        }`,
    ),
    "",
    "## Skills",
    "",
    ...skillGroups.map((group) => `- ${group.label}: ${skills(group)}`),
    "",
    "## Full content",
    "",
    `- Complete résumé with per-role details in markdown: ${siteUrl}/llms-full.txt`,
    "",
  ].join("\n");
}

function llmsFullTxt() {
  return [
    `# ${hero.name} — Senior Full-Stack Engineer`,
    "",
    `> ${hero.bioLead}`,
    "",
    hero.bioProof,
    "",
    `Site: ${siteUrl}`,
    `Email: ${contact.email}`,
    "",
    "## Experience",
    "",
    ...experience.flatMap((role) => [
      `### ${role.company} — ${role.title}`,
      "",
      `${role.period}${role.url ? ` — ${role.url}` : ""}`,
      "",
      role.summary,
      "",
      ...role.bullets.map((bullet) => `- ${bullet}`),
      "",
    ]),
    "## Projects",
    "",
    ...projects.flatMap((project) => [
      `### ${project.name}`,
      "",
      project.description,
      "",
      `- Stack: ${project.stack.join(", ")}`,
      ...(project.note ? [`- Note: ${project.note}`] : []),
      ...(project.repo ? [`- Repo: ${project.repo.url}`] : []),
      "",
    ]),
    "## Skills",
    "",
    ...skillGroups.flatMap((group) => [
      `### ${group.label}`,
      "",
      group.skills.map((skill) => skill.name).join(", "),
      "",
      `Also: ${group.more.map((skill) => skill.name).join(", ")}`,
      "",
    ]),
    "## Links",
    "",
    `- Website: ${siteUrl}`,
    `- Book a 15-minute call: ${contact.cal}`,
    `- GitHub: ${contact.github}`,
    `- LinkedIn: ${contact.linkedin}`,
    `- Toptal profile: ${contact.toptal}`,
    "",
  ].join("\n");
}

export { llmsTxt, llmsFullTxt };
