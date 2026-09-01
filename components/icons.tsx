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
  SiMysql,
  SiSupabase,
  SiSqlite,
  SiCloudflare,
  SiSocketdotio,
  SiJest,
  SiVuedotjs,
  SiAngular,
  SiFlutter,
  SiPhp,
  SiSolidity,
  SiGraphql,
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
  Phone,
  RadioTower,
  FlaskConical,
  AppWindow,
  Database,
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
  mysql: SiMysql,
  supabase: SiSupabase,
  sqlite: SiSqlite,
  cloudflare: SiCloudflare,
  socketio: SiSocketdotio,
  jest: SiJest,
  vue: SiVuedotjs,
  angular: SiAngular,
  flutter: SiFlutter,
  php: SiPhp,
  solidity: SiSolidity,
  graphql: SiGraphql,
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

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  );
}

function SproutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M16 10a4 4 0 0 1-8 0" />
      <path d="M3.103 6.034h17.794" />
      <path d="M20.182 6.034 21.5 19.25a2 2 0 0 1-1.99 2.75H4.49a2 2 0 0 1-1.99-2.75l1.318-13.216A2 2 0 0 1 5.804 4h12.392a2 2 0 0 1 1.986 2.034" />
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
  radar: ScanEye,
  activity: ActivityIcon,
  sprout: SproutIcon,
  message: MessageIcon,
  "shield-check": ShieldIcon,
  "shopping-bag": ShoppingBagIcon,
  briefcase: Briefcase,
  phone: Phone,
  "radio-tower": RadioTower,
  flask: FlaskConical,
  "app-window": AppWindow,
  database: Database,
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
