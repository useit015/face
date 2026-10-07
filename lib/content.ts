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
    "Senior full-stack engineer, trained at 42. I have shipped React, Node.js, and TypeScript to production for a decade, and AI products for the last three years.",
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
  stack: string[];
};

export const experience: Role[] = [
  {
    company: "Acurai",
    url: "https://acur.ai/",
    title: "Senior Software Engineer",
    period: "Jan 25 – Jun 25", icon: "co-cloud",
    summary: "Acurai works on making language models stop hallucinating, and has published research on it. I was one of two developers on a five-person team, alongside two researchers and the CEO.",
    bullets: [
      "Shipped the three core apps: Chat, Wiki, and Brain Builder.",
      "Chat puts a conversational interface on Acurai's hallucination-reduction layer.",
      "Brain Builder lets users build and edit the structured knowledge Acurai's system works from.",
      "Made the product-side implementation calls, with no designer on the team.",
    ],
    stack: ["Next.js", "TypeScript", "Node.js", "OpenAI"],
  },
  {
    company: "LendStack",
    url: "https://www.linkedin.com/company/lendstack",
    title: "Co-Founder & CTO",
    period: "Oct 23 – May 24", icon: "co-building",
    summary: "LendStack was a bootstrapped operating system for microfinance lenders, covering onboarding, KYC, and loan origination for personal and small-business loans. I co-founded it and ran everything technical.",
    bullets: [
      "Hired and led nine engineers: seven developers and two AI engineers.",
      "Designed three apps on shared services. Borrowers got loan simulation, onboarding, and KYC; lenders got a dashboard to configure journeys and process applications; we got a central admin console.",
      "Gave authentication its own service from day one. With three apps touching sensitive ID data, pulling it out later would have meant a risky migration with clients live.",
      "Designed the lending rules: credit limits, installment schedules, and how each repayment splits between fees and principal.",
      "Built ID checks on Regula, offline OCR on local models, and a loan application chatbot on OpenAI.",
    ],
    stack: ["Next.js", "Node.js", "TypeScript", "Regula", "OpenAI"],
  },
  {
    company: "Toptal",
    url: "https://www.toptal.com/",
    title: "Senior Software Engineer",
    period: "Apr 22 – Oct 24", icon: "toptal",
    summary: "Thirty months of contract work through Toptal: eight engagements for seven clients in agricultural AI, insurance, fintech, media, and AI SaaS. The three biggest have their own entries below. The rest:",
    bullets: [
      "Top Shelf Insurance: ten weeks on a Toptal Teams squad building an internal desktop tool for agency workflows, in React against AWS GraphQL APIs.",
      "DSF OpCo: three weeks to revive a Vue and AWS Amplify app that had lost contact with its backend. The client had no front-end developer; the app worked again by the end.",
      "Amina El Abed: sole engineer on a shoppable-video MVP, where viewers pause a clip and tap items to open product links. Booked twice.",
      "iTech Insurance: found why their Act! CRM's PDF exports were dropping thousands separators, and fixed it.",
    ],
    stack: ["React", "TypeScript", "Vue", "GraphQL", "AWS"],
  },
  {
    company: "Axion Ray",
    url: "https://www.axion.com/",
    title: "Senior Software Engineer",
    period: "May 24 – Oct 24", icon: "co-radar",
    summary: "Axion Ray makes AI-powered software for data operations and visualization. I joined through Toptal to add full-stack capacity to its data-operations module.",
    bullets: [
      "Extended the module's configuration portal in React and TypeScript.",
      "Built and tested the Node.js and MongoDB backend pieces it needed.",
      "Added shared form components, such as checkboxes, radio dials, and file uploaders, on top of the existing component libraries.",
      "Helped with front-end work across the rest of the platform.",
    ],
    stack: ["React", "TypeScript", "Node.js", "MongoDB"],
  },
  {
    company: "What's Next Media",
    url: "https://www.pymnts.com/",
    title: "Senior Software Engineer",
    period: "Sep 23 – Jan 24", icon: "co-activity",
    summary: "What's Next Media publishes PYMNTS, a news and data outlet covering payments and the connected economy. I worked part-time through Toptal, alongside LendStack.",
    bullets: [
      "Built interactive React charts for its connected-economy reports, working with the editorial team on what each dataset needed to show.",
      "Built AI writing tools for editors, including a self-publishing tool.",
      "Wrote Node.js services over SQL, MongoDB, and third-party APIs.",
      "Cleaned up the old WordPress codebase the site ran on.",
    ],
    stack: ["React", "Node.js", "SQL", "MongoDB", "WordPress"],
  },
  {
    company: "Blue River Technology",
    url: "https://www.bluerivertechnology.com/",
    title: "Senior Software Engineer",
    period: "Apr 22 – Aug 22", icon: "co-sprout",
    summary: "Blue River builds See & Spray, which uses computer vision to tell weeds from crops. John Deere bought it for $300M. I worked remotely, through Toptal, on the team building its ground-truth data system.",
    bullets: [
      "Built Clicky Clicky alone, a web tool for labeling See & Spray boom-height ground truth.",
      "Built its dashboard for creating labeling jobs, assigning work, and collecting results.",
      "Deployed both and validated the labels against radar measurements.",
      "Moved Spyglass from vanilla JavaScript to React, fixing its existing bugs along the way.",
    ],
    stack: ["React", "TypeScript", "NestJS", "MongoDB", "Docker", "AWS"],
  },
  {
    company: "VO2 Group",
    url: "https://www.vo2-group.com/",
    title: "Senior Software Engineer",
    period: "Jan 21 – Jan 22", icon: "co-heart-pulse",
    summary: "Two tracks at VO2 Group: solo delivery for Radiometer, a medical-diagnostics company, and team lead on AXA's Health Keeper app.",
    bullets: [
      "Built the Radiometer Course Creator alone: architecture, UI, backend, serverless infrastructure, and tests. It lets non-technical staff create courses and publish them to AQURE, Radiometer's healthcare platform.",
      "Delivered it as part of a six-figure enterprise deal.",
      "Saved about $20K a year by writing the JavaScript API layer to AQURE in-house instead of paying for an external integration.",
      "Led three engineers moving AXA Health Keeper, a healthy-habits app, from Quasar and Vue to React and React Native for better performance.",
      "Shipped its rewards system: users earn points for healthy habits and spend them in an in-app marketplace.",
      "Worked on the serverless backend, Node.js and MongoDB on AWS Lambda and API Gateway.",
    ],
    stack: ["React", "React Native", "TypeScript", "Node.js", "AWS SAM", "PostgreSQL", "MongoDB"],
  },
  {
    company: "Spotbills",
    url: "https://www.linkedin.com/company/spotbills/",
    title: "Full-Stack Developer",
    period: "Sep 20 – Dec 20", icon: "co-message",
    summary: "Spotbills was building Peer, a Flutter app for peer-to-peer messaging, file sharing, and audio and video calls, designed to keep server costs low.",
    bullets: [
      "Built the signaling server that sets up peer connections, in NestJS with Redis and MongoDB.",
      "Worked on the app's architecture, development, and testing.",
      "Ran the deployment and helped the company launch on schedule.",
    ],
    stack: ["NestJS", "TypeScript", "Redis", "MongoDB", "WebRTC", "Flutter"],
  },
  {
    company: "Caronae Systems",
    url: "https://caronae.com/",
    title: "Senior Software Engineer",
    period: "Apr 20 – Sep 20", icon: "co-shield-check",
    summary: "Caronae was building identity verification for the Moroccan market. I led the front end of its product, Helloo, and owned the KYC integrations.",
    bullets: [
      "Led three front-end engineers building Helloo's Journey Builder, a drag-and-drop editor where customers compose their own verification flows.",
      "Built, alone, the runtime that reads a journey's JSON definition and walks the end user through each step.",
      "Integrated government ID recognition, face matching, and liveness checks.",
      "Reviewed the team's pull requests and wrote Jest and Enzyme tests.",
    ],
    stack: ["React", "Redux", "Node.js", "PostgreSQL", "AWS"],
  },
  {
    company: "SQLI Digital Experience",
    url: "https://www.sqli.com/",
    title: "Software Engineer",
    period: "Feb 20 – Jul 20", icon: "co-shopping-bag",
    summary: "SQLI is a digital agency. I was one of more than a hundred engineers working on Nespresso's global online store.",
    bullets: [
      "Built a new checkout that let customers buy without completing registration.",
      "Wrote Jest and Enzyme tests for the features I shipped.",
      "Upgraded legacy AngularJS and jQuery libraries.",
    ],
    stack: ["JavaScript", "React", "Vue", "AngularJS", "Jest"],
  },
  {
    company: "Freelance",
    title: "Full-Stack Developer",
    period: "May 16 – Dec 19", icon: "co-globe",
    summary: "Three and a half years of client work before the full-time roles, mostly for small businesses.",
    bullets: [
      "Built company websites, landing pages, WordPress sites, and Shopify storefronts.",
      "Built internal tools and web portals in PHP, Node.js, and MySQL, with Vue or React on the front.",
      "Handled scoping and delivery directly with clients, many of whom came back with more work.",
    ],
    stack: ["PHP", "Node.js", "MySQL", "Vue", "React", "WordPress", "Shopify"],
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
