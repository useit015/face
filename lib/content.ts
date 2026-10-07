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
    "Senior full-stack engineer, trained at 42. I have shipped React, Node.js, and TypeScript to production for nine years, and AI products for the last three.",
  bioProof:
    "I delivered a six-figure enterprise project on my own. As a co-founder, I ran a nine-person engineering team. Toptal sent me to seven clients; one booked me twice.",
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
    summary: "Five-person startup working on language models that don't hallucinate.",
    bullets: [
      "Built and owned the Chat, Wiki, and Brain Builder apps.",
      "One of two developers, alongside two researchers and the CEO.",
    ],
  },
  {
    company: "LendStack",
    url: "https://www.linkedin.com/company/lendstack",
    title: "Co-Founder & CTO",
    period: "Oct 23 – May 24", icon: "co-building",
    summary: "Bootstrapped platform for microfinance lenders.",
    bullets: [
      "Hired and led nine engineers, two of them on AI.",
      "Designed separate apps for borrowers, lenders, and admins on shared identity and KYC services. Authentication got its own service on day one, because moving it later would have meant migrating live credentials.",
      "Wrote the lending rules, down to how each repayment splits between fees and principal, and built the loan application chatbot.",
      "Two pilot clients went live in Zambia. Twelve more were in the pipeline when I left.",
    ],
  },
  {
    company: "Toptal",
    url: "https://www.toptal.com/",
    title: "Senior Software Engineer",
    period: "Apr 22 – Oct 24", icon: "toptal",
    summary: "Contract work through Toptal's freelance network.",
    bullets: [
      "Eight engagements for seven clients over 30 months, mostly full-stack React and Node.js.",
      "The main ones have their own entries below. The others: Top Shelf Insurance, iTech Insurance, and DSF OpCo.",
    ],
  },
  {
    company: "Axion Ray",
    url: "https://www.axion.com/",
    title: "Senior Software Engineer",
    period: "May 24 – Oct 24", icon: "co-radar",
    summary: "AI software company. I worked on its data-operations product.",
    bullets: [
      "Built features in the data-operations configuration portal, in the React app and its Node.js and MongoDB backend.",
      "Built shared form components, such as radio dials and file uploaders.",
    ],
  },
  {
    company: "What's Next Media",
    url: "https://www.pymnts.com/",
    title: "Senior Software Engineer",
    period: "Sep 23 – Jan 24", icon: "co-activity",
    summary: "Publisher of PYMNTS, covering payments and the connected economy.",
    bullets: [
      "Built interactive React charts for its connected-economy reports.",
      "Built Node.js services on SQL, MongoDB, and third-party APIs.",
      "Built AI writing tools for editors, among them a self-publishing tool.",
      "Cleaned up the legacy WordPress codebase the site ran on.",
    ],
  },
  {
    company: "Blue River Technology",
    url: "https://www.bluerivertechnology.com/",
    title: "Senior Software Engineer",
    period: "Apr 22 – Aug 22", icon: "co-sprout",
    summary: "Computer-vision weed spraying. Acquired by John Deere for $300M.",
    bullets: [
      "Built Clicky Clicky alone, a web tool for labeling See & Spray boom-height ground truth.",
      "Added a dashboard for creating and assigning labeling jobs, and checked label accuracy against radar.",
      "Rewrote Spyglass from vanilla JavaScript in React, fixing old bugs on the way.",
    ],
  },
  {
    company: "VO2 Group",
    url: "https://www.vo2-group.com/",
    title: "Senior Software Engineer",
    period: "Jan 21 – Jan 22", icon: "co-heart-pulse",
    summary: "Healthcare software.",
    bullets: [
      "Built the Radiometer Course Creator alone, a six-figure enterprise project for a medical-diagnostics company.",
      "Led three engineers moving AXA Health Keeper from Vue to React and React Native.",
      "Saved about $20K a year by building the AQURE API layer instead of licensing one.",
    ],
  },
  {
    company: "Spotbills",
    url: "https://www.linkedin.com/company/spotbills/",
    title: "Full-Stack Developer",
    period: "Sep 20 – Dec 20", icon: "co-message",
    summary: "Peer-to-peer chat and calling app.",
    bullets: [
      "Built the app's signaling server in NestJS, with Redis and MongoDB.",
      "Ran the deployment and helped the company launch on time.",
    ],
  },
  {
    company: "Caronae Systems",
    url: "https://caronae.com/",
    title: "Senior Software Engineer",
    period: "Apr 20 – Sep 20", icon: "co-shield-check",
    summary: "No-code identity verification.",
    bullets: [
      "Led three front-end engineers on a drag-and-drop builder for KYC flows.",
      "Built, alone, the front end that walks end users through each flow.",
      "Owned the ID recognition, face match, and liveness integrations.",
    ],
  },
  {
    company: "SQLI Digital Experience",
    url: "https://www.sqli.com/",
    title: "Software Engineer",
    period: "Feb 20 – Jul 20", icon: "co-shopping-bag",
    summary: "Agency work on Nespresso's global online store.",
    bullets: [
      "Built guest checkout, so customers could buy without registering.",
      "Upgraded legacy AngularJS and jQuery code and covered new features with Jest tests.",
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
    description: "Open-source React components in this page's ballpoint style.",
    stack: ["React 19", "Tailwind CSS 4", "Base UI", "shadcn registry"],
    url: "https://ballpoint.st9wd.com",
    repo: { owner: "useit015", name: "ballpoint", url: "https://github.com/useit015/ballpoint" },
  },
  {
    name: "whichmodel",
    icon: "whichmodel",
    description: "A CLI that takes a task in plain English and names the AI model to use, at three budgets.",
    stack: ["TypeScript", "Node.js", "OpenRouter", "FAL"],
    repo: { owner: "useit015", name: "whichmodel", url: "https://github.com/useit015/whichmodel" },
  },
  {
    name: "Sigil",
    icon: "sigil",
    description: "Creator studio that turns video and images into shareable ASCII.",
    stack: ["Next.js", "React", "Rust", "Supabase"],
    note: "329+ commits",
  },
  {
    name: "Asset Forge",
    icon: "asset-forge",
    description: "Generates and stores game art and characters, built on fal.ai.",
    stack: ["React", "Express", "Supabase", "Cloudflare R2"],
  },
  {
    name: "souk-fighter",
    icon: "souk-fighter",
    description: "Browser fighting game in the King of Fighters mold, with its own character builder.",
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
