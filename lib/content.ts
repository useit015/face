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
    "Senior full-stack engineer and graduate of the 42 coding school, with 9+ years building production software with React, Node.js, TypeScript, and AI.",
  bioProof:
    "I built an enterprise healthcare platform on my own as part of a six-figure deal. As co-founder and CTO, I led 9 engineers. Through Toptal, I completed 8 engagements for 7 clients.",
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
    summary: "AI startup working to reduce incorrect answers (hallucinations) from large language models.",
    bullets: [
      "Shipped the front end for the Chat, Wiki, and Brain Builder interfaces.",
      "Used TypeScript, Next.js, and Node.js for OpenAI-integrated workflows.",
    ],
  },
  {
    company: "LendStack",
    url: "https://www.linkedin.com/company/lendstack",
    title: "Co-Founder & CTO",
    period: "Oct 23 – May 24", icon: "co-building",
    summary: "Software for lending startups to manage microfinance operations.",
    bullets: [
      "Led 9 engineers in a 14-person startup.",
      "Launched pilots with 2 clients in Zambia, with 12 prospects in the pipeline.",
      "Designed the Next.js and Node.js microservices architecture for identity verification (KYC), document text extraction (OCR), and AI-assisted workflows.",
    ],
  },
  {
    company: "Toptal",
    url: "https://www.toptal.com/",
    title: "Senior Software Engineer",
    period: "Apr 22 – Oct 24", icon: "toptal",
    summary: "Completed 8 engagements for 7 clients over 30 months alongside startup work.",
    bullets: [
      "Built full-stack applications and data visualizations with React, Node.js, TypeScript, MongoDB, and AWS.",
      "Clients included Blue River Technology, Axion Ray, What's Next Media, Top Shelf Insurance, DSF OpCo, and iTech Insurance.",
    ],
  },
  {
    company: "Axion Ray",
    url: "https://www.axion.com/",
    title: "Senior Software Engineer",
    period: "May 24 – Oct 24", icon: "co-radar",
    summary: "AI software for managing industrial data.",
    bullets: [
      "Built tools to configure AI in the data-operations module.",
      "Connected the React interface to backend services built with Node.js and MongoDB.",
    ],
  },
  {
    company: "What's Next Media",
    url: "https://www.pymnts.com/",
    title: "Senior Software Engineer",
    period: "Sep 23 – Jan 24", icon: "co-activity",
    summary: "Interactive data products for payments reporting.",
    bullets: [
      "Built React data visualizations for connected-economy reporting.",
      "Built Node.js backend features using SQL, MongoDB, and third-party APIs.",
    ],
  },
  {
    company: "Blue River Technology",
    url: "https://www.bluerivertechnology.com/",
    title: "Senior Software Engineer",
    period: "Apr 22 – Aug 22", icon: "co-sprout",
    summary: "Company behind See & Spray computer vision, acquired by John Deere for $300M.",
    bullets: [
      "Built Clicky Clicky on my own: a web labeling tool for collecting reference data (ground truth) on See & Spray boom height.",
      "Migrated the Spyglass platform from vanilla JavaScript to React.",
    ],
  },
  {
    company: "VO2 Group",
    url: "https://www.vo2-group.com/",
    title: "Senior Software Engineer",
    period: "Jan 21 – Jan 22", icon: "co-heart-pulse",
    summary: "Healthcare software products.",
    bullets: [
      "Built the Radiometer Course Creator on my own for a six-figure enterprise deal, using React, Node.js, TypeScript, AWS SAM, and PostgreSQL.",
      "Led 3 engineers rebuilding AXA Health Keeper, moving from Quasar/Vue to React and React Native.",
      "Saved about $20K per year in licensing by building an in-house JavaScript API layer for AQURE.",
    ],
  },
  {
    company: "Spotbills",
    url: "https://www.linkedin.com/company/spotbills/",
    title: "Full-Stack Developer",
    period: "Sep 20 – Dec 20", icon: "co-message",
    summary: "Real-time communication infrastructure.",
    bullets: [
      "Built the signaling server for Peer, a hybrid mobile chat and calling app, with NestJS, TypeScript, Redis, MongoDB, Socket.IO, and WebRTC.",
    ],
  },
  {
    company: "Caronae Systems",
    url: "https://caronae.com/",
    title: "Senior Software Engineer",
    period: "Apr 20 – Sep 20", icon: "co-shield-check",
    summary: "No-code tools for building identity verification (KYC) workflows.",
    bullets: [
      "Led 3 front-end engineers building tools to create identity verification workflows.",
      "Integrated government ID recognition, face matching, and liveness checks.",
    ],
  },
  {
    company: "SQLI Digital Experience",
    url: "https://www.sqli.com/",
    title: "Software Engineer",
    period: "Feb 20 – Jul 20", icon: "co-shopping-bag",
    summary: "Global Nespresso eCommerce platform.",
    bullets: [
      "Implemented a guest checkout flow for the Nespresso storefront.",
      "Wrote Jest and Enzyme tests and modernized legacy AngularJS and jQuery code.",
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
    name: "whichmodel",
    icon: "whichmodel",
    description: "TypeScript command-line tool (CLI) that recommends an AI model for a task.",
    stack: ["TypeScript", "Node.js", "OpenRouter", "FAL"],
    repo: { owner: "useit015", name: "whichmodel", url: "https://github.com/useit015/whichmodel" },
  },
  {
    name: "Sigil",
    icon: "sigil",
    description: "Creator studio that turns videos and images into shareable text-based (ASCII) previews.",
    stack: ["Next.js", "React", "Rust", "Supabase"],
    note: "329+ commits",
  },
  {
    name: "Asset Forge",
    icon: "asset-forge",
    description: "Platform for generating game assets and character art with fal.ai.",
    stack: ["React", "Express", "Supabase", "Cloudflare R2"],
  },
  {
    name: "souk-fighter",
    icon: "souk-fighter",
    description: "Browser fighting game inspired by The King of Fighters, with a custom .sfpack format for bundling game assets.",
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
