export const contact = {
  email: "useit015@gmail.com",
  github: "https://github.com/useit015",
  githubUser: "useit015",
  linkedin: "https://linkedin.com/in/useit015",
  toptal: "https://www.toptal.com/developers/resume/oussama-nahiz",
};

export const hero = {
  name: "Oussama Nahiz",
  role: "Senior Full-Stack Engineer",
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

export const stats = [
  { value: "9+", label: "years shipping product software" },
  { value: "8", label: "Toptal engagements delivered" },
  { value: "9", label: "engineers led as co-founder & CTO" },
  { value: "1", label: "six-figure enterprise build, solo" },
];

export const timeline = [
  { label: "Open to work", period: "Jun 26 – Now", icon: "search" },
  { label: "Acurai", period: "Jan 25 – Jun 25", icon: "cloud" },
  { label: "LendStack", period: "Oct 23 – May 24", icon: "building" },
  { label: "Toptal", period: "Apr 22 – Oct 24", icon: "globe" },
] as const;

export type Role = {
  company: string;
  url?: string;
  title: string;
  period: string;
  summary: string;
  bullets: string[];
};

export const experience: Role[] = [
  {
    company: "Independent",
    title: "AI Builder & Consultant",
    period: "Oct 2024 – present",
    summary: "Building AI developer tools and taking selective client work.",
    bullets: [
      "Built whichmodel, an open-source TypeScript CLI that recommends AI models across OpenRouter, FAL, and Replicate.",
      "Building Sigil, a creator studio converting video and images into shareable ASCII previews.",
      "Delivered front-end product work at Acurai across Chat, Wiki, and Brain Builder surfaces.",
    ],
  },
  {
    company: "Acurai",
    url: "https://acur.ai/",
    title: "Senior Software Engineer",
    period: "Jan 2025 – Jun 2025",
    summary: "AI startup focused on reducing hallucinations in large language models.",
    bullets: [
      "Shipped the front-end product surface across Chat, Wiki, and Brain Builder.",
      "Worked across TypeScript, Next.js, Node.js, and OpenAI-integrated workflows.",
    ],
  },
  {
    company: "LendStack",
    url: "https://www.linkedin.com/company/lendstack",
    title: "Co-Founder & CTO",
    period: "Oct 2023 – May 2024",
    summary: "Microfinance operating system for lending startups.",
    bullets: [
      "Led a 9-person engineering team inside a 14-person startup.",
      "Shipped to 2 live pilot clients in Zambia with 12 prospects in the pipeline.",
      "Owned architecture across Next.js, Node.js microservices, KYC, OCR, and AI-assisted workflows.",
    ],
  },
  {
    company: "Toptal",
    url: "https://www.toptal.com/",
    title: "Senior Software Engineer",
    period: "Apr 2022 – Oct 2024",
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
    period: "May 2024 – Oct 2024",
    summary: "AI-powered SaaS for industrial data operations.",
    bullets: [
      "Built AI-powered SaaS configuration tooling for the data-operations module.",
      "Wired backend integrations into a React front end on Node.js and MongoDB.",
    ],
  },
  {
    company: "What's Next Media",
    url: "https://www.pymnts.com/",
    title: "Senior Software Engineer",
    period: "Sep 2023 – Jan 2024",
    summary: "Interactive data products for payments reporting.",
    bullets: [
      "Built interactive data-visualization components in React for connected-economy reporting.",
      "Implemented server-side Node.js work with SQL, MongoDB, and third-party APIs.",
    ],
  },
  {
    company: "Blue River Technology",
    url: "https://www.bluerivertechnology.com/",
    title: "Senior Software Engineer",
    period: "Apr 2022 – Aug 2022",
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
    period: "Jan 2021 – Jan 2022",
    summary: "Healthcare and health-tech products.",
    bullets: [
      "Solo-built the Radiometer Course Creator on React, Node.js, TypeScript, AWS SAM, and PostgreSQL as part of a six-figure enterprise deal.",
      "Led a 3-engineer rebuild of AXA Health Keeper, migrating from Quasar/Vue to React and React Native.",
      "Built an in-house JavaScript API layer for AQURE that saved about $20K per year in licensing.",
    ],
  },
  {
    company: "Spotbills",
    title: "Full-Stack Developer",
    period: "Sep 2020 – Dec 2020",
    summary: "Real-time communication infrastructure.",
    bullets: [
      "Built the signaling server for Peer, a hybrid mobile chat and calling app, with NestJS, TypeScript, Redis, MongoDB, Socket.IO, and WebRTC.",
    ],
  },
  {
    company: "Caronae Systems",
    url: "https://caronae.com/",
    title: "Senior Software Engineer",
    period: "Apr 2020 – Sep 2020",
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
    period: "Feb 2020 – Jul 2020",
    summary: "Global Nespresso eCommerce platform.",
    bullets: [
      "Implemented a guest checkout flow on the global Nespresso eCommerce platform.",
      "Wrote Jest and Enzyme tests and modernized legacy AngularJS and jQuery code.",
    ],
  },
  {
    company: "Independent / Freelance",
    title: "Full-Stack Developer",
    period: "May 2016 – Dec 2019",
    summary: "Client web projects, end to end.",
    bullets: [
      "Built websites, landing pages, WordPress builds, Shopify storefronts, web portals, and internal tools.",
      "Handled scoping, delivery, and direct client communication for local and international clients.",
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
    name: "Radiometer Course Creator",
    icon: "heart-pulse",
    description: "Course-authoring platform for Radiometer's AQURE healthcare ecosystem.",
    stack: ["React", "Node.js", "TypeScript", "AWS SAM", "PostgreSQL"],
    url: contact.toptal,
  },
  {
    name: "Clicky Clicky",
    icon: "scan-eye",
    description: "See & Spray ground-truth labeling tool and dashboard at Blue River Technology.",
    stack: ["React", "NestJS", "MongoDB", "Docker", "Leaflet", "AWS"],
    url: contact.toptal,
  },
  {
    name: "whichmodel",
    icon: "terminal",
    description: "TypeScript CLI that recommends the right AI model for a task.",
    stack: ["TypeScript", "Node.js", "OpenRouter", "FAL"],
    repo: { owner: "useit015", name: "whichmodel", url: "https://github.com/useit015/whichmodel" },
  },
  {
    name: "Open Design",
    icon: "pen-tool",
    description: "Design-agent product connecting coding-agent CLIs and design systems.",
    stack: ["TypeScript", "Local daemon", "SQLite"],
    repo: { owner: "nexu-io", name: "open-design", url: "https://github.com/nexu-io/open-design" },
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
    description: "Asset-generation platform for game and character assets, with fal.ai.",
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
      { name: "TypeScript", icon: "typescript" },
      { name: "JavaScript", icon: "javascript" },
      { name: "React", icon: "react" },
      { name: "Next.js", icon: "nextjs" },
      { name: "Node.js", icon: "nodejs" },
      { name: "HTML/CSS", icon: "html5" },
    ],
  },
  {
    label: "Backend & data",
    skills: [
      { name: "NestJS", icon: "nestjs" },
      { name: "Express", icon: "express" },
      { name: "PostgreSQL", icon: "postgresql" },
      { name: "MongoDB", icon: "mongodb" },
      { name: "Redis", icon: "redis" },
      { name: "REST APIs", icon: "braces" },
    ],
  },
  {
    label: "Cloud & delivery",
    skills: [
      { name: "AWS SAM", icon: "aws" },
      { name: "Lambda", icon: "lambda" },
      { name: "Docker", icon: "docker" },
      { name: "CI/CD", icon: "workflow" },
    ],
  },
  {
    label: "AI",
    skills: [
      { name: "OpenAI APIs", icon: "openai" },
      { name: "OpenRouter", icon: "openrouter" },
      { name: "Replicate", icon: "replicate" },
      { name: "Agentic AI", icon: "bot" },
      { name: "LLM integration", icon: "sparkles" },
    ],
  },
  {
    label: "Breadth",
    skills: [
      { name: "React Native", icon: "react" },
      { name: "Pixi.js 8", icon: "sparkles" },
      { name: "Three.js", icon: "threejs" },
      { name: "WebRTC", icon: "radio" },
      { name: "Unix/Linux", icon: "terminal-square" },
    ],
  },
] as const;
