import {
  SiTypescript,
  SiJavascript,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiHtml5,
  SiNestjs,
  SiExpress,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiDocker,
  SiOpenrouter,
  SiReplicate,
  SiThreedotjs,
  SiGithub,
} from "react-icons/si";
import {
  Braces,
  Workflow,
  Bot,
  Sparkles,
  Radio,
  SquareTerminal,
  Search,
  Cloud,
  Building2,
  Globe,
  HeartPulse,
  ScanEye,
  Terminal,
  PenTool,
  Wand2,
  Boxes,
  Swords,
  Briefcase,
  Mail,
} from "lucide-react";
import type { ComponentType } from "react";

const brandIcons: Record<string, ComponentType<{ className?: string }>> = {
  typescript: SiTypescript,
  javascript: SiJavascript,
  react: SiReact,
  nextjs: SiNextdotjs,
  nodejs: SiNodedotjs,
  html5: SiHtml5,
  nestjs: SiNestjs,
  express: SiExpress,
  postgresql: SiPostgresql,
  mongodb: SiMongodb,
  redis: SiRedis,
  aws: Cloud,
  docker: SiDocker,
  openai: Braces,
  openrouter: SiOpenrouter,
  replicate: SiReplicate,
  threejs: SiThreedotjs,
};

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

const lucideIcons: Record<string, ComponentType<{ className?: string }>> = {
  braces: Braces,
  workflow: Workflow,
  lambda: ZapIcon,
  bot: Bot,
  sparkles: Sparkles,
  radio: Radio,
  "terminal-square": SquareTerminal,
  search: Search,
  cloud: Cloud,
  building: Building2,
  globe: Globe,
  "heart-pulse": HeartPulse,
  "scan-eye": ScanEye,
  terminal: Terminal,
  "pen-tool": PenTool,
  wand: Wand2,
  boxes: Boxes,
  swords: Swords,
  toptal: Briefcase,
};

export function SkillIcon({ name, className }: { name: string; className?: string }) {
  const Brand = brandIcons[name];
  if (Brand) return <Brand className={className} />;
  const Icon = lucideIcons[name] ?? Sparkles;
  return <Icon className={className} />;
}

export function SocialIcon({ name, className }: { name: string; className?: string }) {
  if (name === "github") return <SiGithub className={className} />;
  if (name === "linkedin") return <LinkedInIcon className={className} />;
  const Icon = lucideIcons[name] ?? Mail;
  return <Icon className={className} />;
}

export function ProjectIcon({ name, className }: { name: string; className?: string }) {
  const Icon = lucideIcons[name] ?? Boxes;
  return <Icon className={className} />;
}
