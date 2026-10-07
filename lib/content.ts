import type { GlyphName, ProjectGlyphName } from "./glyphs";

export const contact = {
  email: "useit015@gmail.com",
  cal: "https://cal.com/useit015/15min",
  github: "https://github.com/useit015",
  githubUser: "useit015",
  linkedin: "https://linkedin.com/in/useit015",
  toptal: "https://www.toptal.com/developers/resume/oussama-nahiz",
};

export const hero = {
  name: "Oussama Nahiz",
  bioLead:
    "Senior full-stack engineer and graduate of the 42 coding school. For 9+ years I have taken products from architecture to production in React, Node.js, TypeScript, and AI.",
  bioProof:
    "I built a course-creation app alone for a six-figure enterprise deal. As co-founder and CTO of LendStack, I led 9 engineers to two pilot clients in Zambia. Through Toptal, I shipped 8 engagements for 7 clients.",
};

export const socials = [
  { label: "GitHub", href: contact.github, icon: "github" },
  { label: "LinkedIn", href: contact.linkedin, icon: "linkedin" },
  { label: "Toptal", href: contact.toptal, icon: "toptal" },
  { label: "Email", href: `mailto:${contact.email}`, icon: "email" },
] as const;

export type Role = {
  company: string;
  url?: string;
  icon: GlyphName;
  title: string;
  period: string;
  summary: string;
  bullets: string[];
};

export const experience: Role[] = [
  {
    company: "Acurai",
    url: "https://acur.ai/",
    title: "Senior Software Engineer",
    period: "Jan 25 – Jun 25", icon: "co-cloud",
    summary: "Five-person AI startup reducing hallucinations, the confident wrong answers of large language models.",
    bullets: [
      "Owned most of the front end: Chat, Wiki, and Brain Builder.",
      "Shipped it in TypeScript and Next.js, on Node.js services and OpenAI-integrated workflows.",
    ],
  },
  {
    company: "LendStack",
    url: "https://www.linkedin.com/company/lendstack",
    title: "Co-Founder & CTO",
    period: "Oct 23 – May 24", icon: "co-building",
    summary: "Software for lending startups: customer onboarding, ID checks, and loan origination.",
    bullets: [
      "Led 9 engineers (7 developers, 2 AI engineers) in a bootstrapped, 14-person company.",
      "Designed three Next.js apps (borrower, lender, admin) on shared Node.js services. Authentication got its own service from day one, because three apps and sensitive ID data made a late extraction too risky.",
      "Wrote the lending rules (credit limits, installment schedules, repayments split between fees and principal) and built the loan application chatbot.",
      "Put two pilot clients live in Zambia, with 12 prospects in the pipeline when I left.",
    ],
  },
  {
    company: "Toptal",
    url: "https://www.toptal.com/",
    title: "Senior Software Engineer",
    period: "Apr 22 – Oct 24", icon: "toptal",
    summary: "8 engagements for 7 clients over 30 months: agricultural AI, insurance, fintech media, and AI SaaS.",
    bullets: [
      "Shipped full-stack work in React, Node.js, TypeScript, MongoDB, and AWS, from data visualizations to internal tools.",
      "Clients included Blue River Technology, Axion Ray, What's Next Media, Top Shelf Insurance, DSF OpCo, and iTech Insurance.",
    ],
  },
  {
    company: "Axion Ray",
    url: "https://www.axion.com/",
    title: "Senior Software Engineer",
    period: "May 24 – Oct 24", icon: "co-radar",
    summary: "AI-powered SaaS platform for data operations and visualization.",
    bullets: [
      "Extended the data-operations configuration portal end to end: the React interface and the Node.js and MongoDB services behind it.",
      "Added reusable UI components (checkboxes, radio dials, file uploaders) on top of the existing libraries.",
    ],
  },
  {
    company: "What's Next Media",
    url: "https://www.pymnts.com/",
    title: "Senior Software Engineer",
    period: "Sep 23 – Jan 24", icon: "co-activity",
    summary: "Media and data company covering payments and the connected economy.",
    bullets: [
      "Built interactive React data visualizations for connected-economy reporting.",
      "Built Node.js backend features on SQL, MongoDB, and third-party APIs.",
      "Created AI-powered writing tools for editors, including a self-publishing tool.",
    ],
  },
  {
    company: "Blue River Technology",
    url: "https://www.bluerivertechnology.com/",
    title: "Senior Software Engineer",
    period: "Apr 22 – Aug 22", icon: "co-sprout",
    summary: "Agricultural AI company behind See & Spray, which spots weeds with computer vision. Acquired by John Deere for $300M.",
    bullets: [
      "Solo-built Clicky Clicky, a web labeling tool that collects See & Spray boom-height ground truth (the reference measurements its models train on), plus a dashboard to create and assign labeling jobs.",
      "Deployed both tools and checked labeling accuracy against radar measurements.",
      "Migrated Spyglass from vanilla JavaScript to React and fixed existing bugs along the way.",
    ],
  },
  {
    company: "VO2 Group",
    url: "https://www.vo2-group.com/",
    title: "Senior Software Engineer",
    period: "Jan 21 – Jan 22", icon: "co-heart-pulse",
    summary: "Healthcare software products.",
    bullets: [
      "Solo-built the Radiometer Course Creator (React, Node.js, TypeScript, AWS SAM, PostgreSQL) for a six-figure enterprise deal with a medical-diagnostics client.",
      "Led 3 engineers rebuilding AXA Health Keeper from Quasar/Vue to React and React Native, including a rewards system where healthy habits earn points.",
      "Saved about $20K a year in licensing by building the AQURE JavaScript API layer in-house.",
    ],
  },
  {
    company: "Spotbills",
    url: "https://www.linkedin.com/company/spotbills/",
    title: "Full-Stack Developer",
    period: "Sep 20 – Dec 20", icon: "co-message",
    summary: "Startup building Peer, a peer-to-peer chat and calling app.",
    bullets: [
      "Built the signaling server that connects Peer users for chat and calls, with NestJS, TypeScript, Redis, MongoDB, Socket.IO, and WebRTC.",
      "Oversaw deployment and helped the company launch on time.",
    ],
  },
  {
    company: "Caronae Systems",
    url: "https://caronae.com/",
    title: "Senior Software Engineer",
    period: "Apr 20 – Sep 20", icon: "co-shield-check",
    summary: "No-code tools for building identity verification (KYC) workflows.",
    bullets: [
      "Led 3 front-end engineers building a drag-and-drop builder for identity verification journeys.",
      "Solo-built the runtime front end that walks users through each configured journey.",
      "Owned the integrations for government ID recognition, face matching, and liveness checks.",
    ],
  },
  {
    company: "SQLI Digital Experience",
    url: "https://www.sqli.com/",
    title: "Software Engineer",
    period: "Feb 20 – Jul 20", icon: "co-shopping-bag",
    summary: "Contract work on Nespresso's global eCommerce platform.",
    bullets: [
      "Built a guest checkout for the Nespresso storefront, so customers can buy without completing full registration.",
      "Wrote Jest and Enzyme tests and upgraded legacy AngularJS and jQuery libraries.",
    ],
  },
];

export type Project = {
  name: string;
  icon: ProjectGlyphName;
  description: string;
  stack: string[];
  url?: string;
  repo?: { owner: string; name: string; url: string };
  note?: string;
};

export const projects: Project[] = [
  {
    name: "Ballpoint",
    icon: "ballpoint",
    description: "Open-source React component library, drawn in the same blue ballpoint as this site.",
    stack: ["React 19", "Tailwind CSS 4", "Base UI", "shadcn registry"],
    url: "https://ballpoint.st9wd.com",
    repo: { owner: "useit015", name: "ballpoint", url: "https://github.com/useit015/ballpoint" },
  },
  {
    name: "whichmodel",
    icon: "whichmodel",
    description: "Command-line tool (CLI): describe a task in plain English, get an AI model recommendation in three tiers (cheapest, balanced, best).",
    stack: ["TypeScript", "Node.js", "OpenRouter", "FAL"],
    repo: { owner: "useit015", name: "whichmodel", url: "https://github.com/useit015/whichmodel" },
  },
  {
    name: "Sigil",
    icon: "sigil",
    description: "Creator studio that turns videos and images into shareable text-based (ASCII) previews, converted by a Rust engine.",
    stack: ["Next.js", "React", "Rust", "Supabase"],
    note: "329+ commits",
  },
  {
    name: "Asset Forge",
    icon: "asset-forge",
    description: "Full-stack tool for generating and managing game assets and character art with fal.ai.",
    stack: ["React", "Express", "Supabase", "Cloudflare R2"],
  },
  {
    name: "souk-fighter",
    icon: "souk-fighter",
    description: "Browser fighting game in the spirit of The King of Fighters, with a character customizer and a custom .sfpack format for sharing characters.",
    stack: ["React 19", "Pixi.js 8", "IndexedDB"],
    repo: { owner: "useit015", name: "souk-fighter", url: "https://github.com/useit015/souk-fighter" },
  },
];

export const skillGroups = [
  {
    label: "Core stack",
    skills: [
      { name: "TypeScript", icon: "typescript", url: "https://www.typescriptlang.org/" },
      { name: "JavaScript", icon: "javascript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
      { name: "React", icon: "react", url: "https://react.dev/" },
      { name: "Next.js", icon: "nextjs", url: "https://nextjs.org/" },
      { name: "Node.js", icon: "nodejs", url: "https://nodejs.org/" },
      { name: "HTML/CSS", icon: "html-css", url: "https://developer.mozilla.org/en-US/docs/Web" },
    ],
    more: [
      { name: "SQL", icon: "sql", url: "https://sqlbolt.com/" },
      { name: "SCSS/Sass", icon: "scss-sass", url: "https://sass-lang.com/" },
      { name: "Vite", icon: "vite", url: "https://vite.dev/" },
      { name: "Redux", icon: "redux", url: "https://redux.js.org/" },
      { name: "Vue", icon: "vue", url: "https://vuejs.org/" },
      { name: "AngularJS", icon: "angularjs", url: "https://angularjs.org/" },
    ],
  },
  {
    label: "Backend & data",
    skills: [
      { name: "NestJS", icon: "nestjs", url: "https://nestjs.com/" },
      { name: "Express", icon: "express", url: "https://expressjs.com/" },
      { name: "PostgreSQL", icon: "postgresql", url: "https://www.postgresql.org/" },
      { name: "MongoDB", icon: "mongodb", url: "https://www.mongodb.com/" },
      { name: "Redis", icon: "redis", url: "https://redis.io/" },
      { name: "REST APIs", icon: "rest-apis", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP" },
    ],
    more: [
      { name: "MySQL", icon: "mysql", url: "https://www.mysql.com/" },
      { name: "Supabase", icon: "supabase", url: "https://supabase.com/" },
      { name: "SQLite", icon: "sqlite", url: "https://www.sqlite.org/" },
      { name: "DynamoDB", icon: "dynamodb", url: "https://aws.amazon.com/dynamodb/" },
      { name: "Amazon S3", icon: "amazon-s3", url: "https://aws.amazon.com/s3/" },
      { name: "GraphQL", icon: "graphql", url: "https://graphql.org/" },
    ],
  },
  {
    label: "Cloud & delivery",
    skills: [
      { name: "AWS SAM", icon: "aws-sam", url: "https://docs.aws.amazon.com/serverless-application-model/" },
      { name: "Lambda", icon: "lambda", url: "https://aws.amazon.com/lambda/" },
      { name: "Docker", icon: "docker", url: "https://www.docker.com/" },
      { name: "CI/CD", icon: "ci-cd", url: "https://docs.github.com/en/actions" },
    ],
    more: [
      { name: "Serverless Framework", icon: "serverless-framework", url: "https://www.serverless.com/" },
      { name: "Docker Compose", icon: "docker-compose", url: "https://docs.docker.com/compose/" },
      { name: "Jenkins", icon: "jenkins", url: "https://www.jenkins.io/" },
      { name: "GitLab CI", icon: "gitlab-ci", url: "https://docs.gitlab.com/ee/ci/" },
      { name: "Bitbucket Pipelines", icon: "bitbucket-pipelines", url: "https://bitbucket.org/product/features/pipelines" },
      { name: "Cloudflare Workers", icon: "cloudflare-workers", url: "https://workers.cloudflare.com/" },
    ],
  },
  {
    label: "AI",
    skills: [
      { name: "OpenAI APIs", icon: "openai-apis", url: "https://platform.openai.com/docs" },
      { name: "OpenRouter", icon: "openrouter", url: "https://openrouter.ai/" },
      { name: "Replicate", icon: "replicate", url: "https://replicate.com/" },
      { name: "Agentic AI", icon: "agentic-ai", url: "https://openai.github.io/openai-agents-python/" },
      { name: "LLM integration", icon: "llm-integration", url: "https://platform.openai.com/docs/guides/text" },
    ],
    more: [
      { name: "fal.ai", icon: "fal-ai", url: "https://fal.ai/" },
      { name: "Agentic harnesses", icon: "agentic-harnesses", url: "https://docs.claude.com/en/docs/agents-and-tools/agent-skills" },
      { name: "Prompt evals", icon: "prompt-evals", url: "https://github.com/openai/evals" },
      { name: "Model routing", icon: "model-routing", url: "https://openrouter.ai/docs" },
      { name: "OCR / KYC", icon: "ocr-kyc", url: "https://cloud.google.com/vision/docs/ocr" },
      { name: "CV annotation", icon: "cv-annotation", url: "https://www.cvat.ai/" },
    ],
  },
  {
    label: "Breadth",
    skills: [
      { name: "React Native", icon: "react-native", url: "https://reactnative.dev/" },
      { name: "Pixi.js 8", icon: "pixijs-8", url: "https://pixijs.com/" },
      { name: "Three.js", icon: "threejs", url: "https://threejs.org/" },
      { name: "WebRTC", icon: "webrtc", url: "https://webrtc.org/" },
      { name: "Unix/Linux", icon: "unix-linux", url: "https://www.kernel.org/" },
    ],
    more: [
      { name: "Flutter", icon: "flutter", url: "https://flutter.dev/" },
      { name: "Solidity", icon: "solidity", url: "https://soliditylang.org/" },
      { name: "Socket.IO", icon: "socketio", url: "https://socket.io/" },
      { name: "Twilio API", icon: "twilio-api", url: "https://www.twilio.com/docs" },
      { name: "Playwright", icon: "playwright", url: "https://playwright.dev/" },
      { name: "WordPress", icon: "wordpress", url: "https://wordpress.org/" },
    ],
  },
] as const;
