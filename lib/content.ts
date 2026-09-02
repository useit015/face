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
    "Senior full-stack engineer and 42-grad with 9+ years shipping production software across React, Node.js, TypeScript, and AI.",
  bioProof:
    "I solo-built a six-figure enterprise healthcare platform, led 9 engineers as co-founder & CTO, and delivered 8 Toptal engagements across 7 clients.",
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
  icon: string;
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
    period: "Jan 25 – Jun 25", icon: "cloud",
    summary: "AI startup focused on reducing hallucinations in large language models.",
    bullets: [
      "Shipped the front-end product surface across Chat, Wiki, and Brain Builder.",
      "Worked with TypeScript, Next.js, Node.js, and OpenAI-integrated workflows.",
    ],
  },
  {
    company: "LendStack",
    url: "https://www.linkedin.com/company/lendstack",
    title: "Co-Founder & CTO",
    period: "Oct 23 – May 24", icon: "building",
    summary: "Microfinance operating system for lending startups.",
    bullets: [
      "Led a 9-person engineering team inside a 14-person startup.",
      "Shipped to 2 live pilot clients in Zambia with 12 prospects in the pipeline.",
      "Owned architecture for Next.js, Node.js microservices, KYC, OCR, and AI-assisted workflows.",
    ],
  },
  {
    company: "Toptal",
    url: "https://www.toptal.com/",
    title: "Senior Software Engineer",
    period: "Apr 22 – Oct 24", icon: "globe",
    summary: "8 engagements across 7 clients over 30 months, delivered in parallel with startup work.",
    bullets: [
      "Delivered senior full-stack work across React, Node.js, TypeScript, MongoDB, AWS, and data visualization.",
      "Clients included Blue River Technology, Axion Ray, What's Next Media, Top Shelf Insurance, DSF OpCo, and iTech Insurance.",
    ],
  },
  {
    company: "Axion Ray",
    url: "https://www.axion.com/",
    title: "Senior Software Engineer",
    period: "May 24 – Oct 24", icon: "radar",
    summary: "AI-powered SaaS for industrial data operations.",
    bullets: [
      "Built AI configuration tooling for the data-operations module.",
      "Wired backend integrations into a React front end on Node.js and MongoDB.",
    ],
  },
  {
    company: "What's Next Media",
    url: "https://www.pymnts.com/",
    title: "Senior Software Engineer",
    period: "Sep 23 – Jan 24", icon: "activity",
    summary: "Interactive data products for payments reporting.",
    bullets: [
      "Built data-visualization components in React for connected-economy reporting.",
      "Implemented server-side Node.js work with SQL, MongoDB, and third-party APIs.",
    ],
  },
  {
    company: "Blue River Technology",
    url: "https://www.bluerivertechnology.com/",
    title: "Senior Software Engineer",
    period: "Apr 22 – Aug 22", icon: "sprout",
    summary: "See & Spray computer vision, acquired by John Deere for $300M.",
    bullets: [
      "Solo-built Clicky Clicky, a web labeling tool for See & Spray boom-height ground-truth collection.",
      "Migrated the Spyglass platform from vanilla JavaScript to React.",
    ],
  },
  {
    company: "VO2 Group",
    url: "https://www.vo2-group.com/",
    title: "Senior Software Engineer",
    period: "Jan 21 – Jan 22", icon: "heart-pulse",
    summary: "Healthcare and health-tech products.",
    bullets: [
      "Solo-built the Radiometer Course Creator on React, Node.js, TypeScript, AWS SAM, and PostgreSQL as part of a six-figure enterprise deal.",
      "Led a 3-engineer rebuild of AXA Health Keeper, migrating from Quasar/Vue to React and React Native.",
      "Built an in-house JavaScript API layer for AQURE that saved about $20K per year in licensing.",
    ],
  },
  {
    company: "Spotbills",
    url: "https://www.linkedin.com/company/spotbills/",
    title: "Full-Stack Developer",
    period: "Sep 20 – Dec 20", icon: "message",
    summary: "Real-time communication infrastructure.",
    bullets: [
      "Built the signaling server for Peer, a hybrid mobile chat and calling app, with NestJS, TypeScript, Redis, MongoDB, Socket.IO, and WebRTC.",
    ],
  },
  {
    company: "Caronae Systems",
    url: "https://caronae.com/",
    title: "Senior Software Engineer",
    period: "Apr 20 – Sep 20", icon: "shield-check",
    summary: "No-code KYC journey builder.",
    bullets: [
      "Led a 3-engineer front-end team building journey-authoring workflows.",
      "Owned integrations for government ID recognition, face match, and liveness checks.",
    ],
  },
  {
    company: "SQLI Digital Experience",
    url: "https://www.sqli.com/",
    title: "Software Engineer",
    period: "Feb 20 – Jul 20", icon: "shopping-bag",
    summary: "Global Nespresso eCommerce platform.",
    bullets: [
      "Implemented a guest checkout flow for the Nespresso storefront.",
      "Wrote Jest and Enzyme tests and modernized legacy AngularJS and jQuery code.",
    ],
  },
];

export type Project = {
  name: string;
  icon: string;
  description: string;
  stack: string[];
  url?: string;
  repo?: { owner: string; name: string; url: string };
  note?: string;
};

export const projects: Project[] = [
  {
    name: "whichmodel",
    icon: "terminal",
    description: "TypeScript CLI that recommends the right AI model for a task.",
    stack: ["TypeScript", "Node.js", "OpenRouter", "FAL"],
    repo: { owner: "useit015", name: "whichmodel", url: "https://github.com/useit015/whichmodel" },
  },
  {
    name: "Sigil",
    icon: "wand",
    description: "Creator studio converting video and images into shareable ASCII previews.",
    stack: ["Next.js", "React", "Rust", "Supabase"],
    note: "329+ commits",
  },
  {
    name: "Asset Forge",
    icon: "boxes",
    description: "Asset-generation platform for game and character art, with fal.ai.",
    stack: ["React", "Express", "Supabase", "Cloudflare R2"],
  },
  {
    name: "souk-fighter",
    icon: "swords",
    description: "KOF-style browser fighting game with a custom .sfpack bundle format.",
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
      { name: "HTML/CSS", icon: "html5", url: "https://developer.mozilla.org/en-US/docs/Web" },
    ],
    more: [
      { name: "SQL", icon: "database", url: "https://sqlbolt.com/" },
      { name: "SCSS/Sass", icon: "sass", url: "https://sass-lang.com/" },
      { name: "Vite", icon: "vite", url: "https://vite.dev/" },
      { name: "Redux", icon: "redux", url: "https://redux.js.org/" },
      { name: "Vue", icon: "vue", url: "https://vuejs.org/" },
      { name: "AngularJS", icon: "angular", url: "https://angularjs.org/" },
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
      { name: "REST APIs", icon: "braces", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP" },
    ],
    more: [
      { name: "MySQL", icon: "mysql", url: "https://www.mysql.com/" },
      { name: "Supabase", icon: "supabase", url: "https://supabase.com/" },
      { name: "SQLite", icon: "sqlite", url: "https://www.sqlite.org/" },
      { name: "DynamoDB", icon: "database", url: "https://aws.amazon.com/dynamodb/" },
      { name: "Amazon S3", icon: "boxes", url: "https://aws.amazon.com/s3/" },
      { name: "GraphQL", icon: "graphql", url: "https://graphql.org/" },
    ],
  },
  {
    label: "Cloud & delivery",
    skills: [
      { name: "AWS SAM", icon: "aws", url: "https://docs.aws.amazon.com/serverless-application-model/" },
      { name: "Lambda", icon: "lambda", url: "https://aws.amazon.com/lambda/" },
      { name: "Docker", icon: "docker", url: "https://www.docker.com/" },
      { name: "CI/CD", icon: "workflow", url: "https://docs.github.com/en/actions" },
    ],
    more: [
      { name: "Serverless Framework", icon: "serverless", url: "https://www.serverless.com/" },
      { name: "Docker Compose", icon: "layers", url: "https://docs.docker.com/compose/" },
      { name: "Jenkins", icon: "jenkins", url: "https://www.jenkins.io/" },
      { name: "GitLab CI", icon: "gitlab", url: "https://docs.gitlab.com/ee/ci/" },
      { name: "Bitbucket Pipelines", icon: "bitbucket", url: "https://bitbucket.org/product/features/pipelines" },
      { name: "Cloudflare Workers", icon: "cloudflare", url: "https://workers.cloudflare.com/" },
    ],
  },
  {
    label: "AI",
    skills: [
      { name: "OpenAI APIs", icon: "openai", url: "https://platform.openai.com/docs" },
      { name: "OpenRouter", icon: "openrouter", url: "https://openrouter.ai/" },
      { name: "Replicate", icon: "replicate", url: "https://replicate.com/" },
      { name: "Agentic AI", icon: "bot", url: "https://openai.github.io/openai-agents-python/" },
      { name: "LLM integration", icon: "sparkles", url: "https://platform.openai.com/docs/guides/text" },
    ],
    more: [
      { name: "fal.ai", icon: "zap", url: "https://fal.ai/" },
      { name: "Agentic harnesses", icon: "flask", url: "https://docs.claude.com/en/docs/agents-and-tools/agent-skills" },
      { name: "Prompt evals", icon: "list-checks", url: "https://github.com/openai/evals" },
      { name: "Model routing", icon: "route", url: "https://openrouter.ai/docs" },
      { name: "OCR / KYC", icon: "scan-face", url: "https://cloud.google.com/vision/docs/ocr" },
      { name: "CV annotation", icon: "scan-eye", url: "https://www.cvat.ai/" },
    ],
  },
  {
    label: "Breadth",
    skills: [
      { name: "React Native", icon: "react", url: "https://reactnative.dev/" },
      { name: "Pixi.js 8", icon: "sparkles", url: "https://pixijs.com/" },
      { name: "Three.js", icon: "threejs", url: "https://threejs.org/" },
      { name: "WebRTC", icon: "radio", url: "https://webrtc.org/" },
      { name: "Unix/Linux", icon: "terminal-square", url: "https://www.kernel.org/" },
    ],
    more: [
      { name: "Flutter", icon: "flutter", url: "https://flutter.dev/" },
      { name: "Solidity", icon: "solidity", url: "https://soliditylang.org/" },
      { name: "Socket.IO", icon: "socketio", url: "https://socket.io/" },
      { name: "Twilio API", icon: "phone", url: "https://www.twilio.com/docs" },
      { name: "Playwright", icon: "app-window", url: "https://playwright.dev/" },
      { name: "WordPress", icon: "wordpress", url: "https://wordpress.org/" },
    ],
  },
] as const;

