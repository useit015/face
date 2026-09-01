export const contact = {
  email: "useit015@gmail.com",
  github: "https://github.com/useit015",
  linkedin: "https://linkedin.com/in/useit015",
  toptal: "https://www.toptal.com/developers/resume/oussama-nahiz",
  githubUser: "useit015",
};

export const hero = {
  name: "Oussama Nahiz",
  headline: "Senior Full-Stack Engineer",
  focus: "React, Node.js, TypeScript — AI product engineering",
  bio: "Senior full-stack engineer and 42-grad with 9+ years building production software across React, Node.js, TypeScript, and AI. I ship products end to end, from architecture to deployment. I previously co-founded a fintech startup as CTO and now focus on AI tools, product engineering, and selective client work.",
};

export const stats = [
  { value: "9+", label: "years shipping product software" },
  { value: "8", label: "Toptal engagements delivered" },
  { value: "9", label: "engineers led as co-founder & CTO" },
  { value: "1", label: "six-figure enterprise build, solo" },
];

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
  category: string;
  description: string;
  stack: string[];
  url?: string;
  repo?: string;
  note?: string;
};

export const projects: Project[] = [
  {
    name: "Radiometer Course Creator",
    category: "enterprise health-tech",
    description:
      "Course-authoring platform for Radiometer's AQURE healthcare ecosystem, solo-built end to end as part of a six-figure enterprise deal.",
    stack: ["React", "Node.js", "TypeScript", "AWS SAM", "PostgreSQL"],
    url: contact.toptal,
  },
  {
    name: "Clicky Clicky",
    category: "computer vision ops",
    description:
      "Labeling tool and dashboard for Blue River Technology's See & Spray boom-height ground-truth workflow, solo-built.",
    stack: ["React", "NestJS", "MongoDB", "Docker", "Leaflet", "AWS"],
    url: contact.toptal,
  },
  {
    name: "whichmodel",
    category: "open source",
    description:
      "TypeScript CLI that recommends the right AI model for a task across OpenRouter, FAL, and Replicate.",
    stack: ["TypeScript", "Node.js", "OpenRouter", "Replicate", "FAL"],
    repo: "https://github.com/useit015/whichmodel",
  },
  {
    name: "Open Design",
    category: "ai design tooling",
    description:
      "Local-first design-agent product connecting coding-agent CLIs, design systems, and sandboxed previews into a deployable workflow.",
    stack: ["TypeScript", "Local daemon", "Web app", "SQLite"],
    repo: "https://github.com/nexu-io/open-design",
  },
  {
    name: "Sigil",
    category: "creator tools",
    description:
      "Creator studio converting video and images into shareable ASCII previews, with a studio UI, player packages, and Rust conversion tooling.",
    stack: ["Next.js", "React", "TypeScript", "Rust", "Supabase"],
    note: "329+ commits across studio, player, CLI, and conversion layers",
  },
  {
    name: "Asset Forge",
    category: "ai game assets",
    description:
      "Full-stack asset-generation tool for game and character assets, with auth, storage, fal.ai generation, and quality-analysis workflows.",
    stack: ["React", "Vite", "Express", "TypeScript", "Supabase", "Cloudflare R2"],
  },
  {
    name: "souk-fighter",
    category: "game-tech",
    description:
      "KOF-style browser fighting game with a custom .sfpack bundle format, character tooling, and a fixed-timestep engine.",
    stack: ["React 19", "Pixi.js 8", "Tailwind CSS 4", "IndexedDB"],
    repo: "https://github.com/useit015/souk-fighter",
  },
];

export const skillGroups = [
  {
    name: "Core stack",
    description: "The product surface users see and the application layer that keeps it maintainable.",
    skills: ["TypeScript", "JavaScript", "React", "Next.js", "Node.js", "HTML/CSS"],
  },
  {
    name: "Backend and data",
    description: "APIs, services, and storage for product workflows that survive real usage.",
    skills: ["NestJS", "Express", "PostgreSQL", "MongoDB", "Redis", "REST APIs"],
  },
  {
    name: "Cloud and delivery",
    description: "The deployment path: serverless infrastructure, containers, and release plumbing.",
    skills: ["AWS SAM", "Lambda", "API Gateway", "S3", "Docker", "CI/CD"],
  },
  {
    name: "AI and ML-adjacent",
    description: "LLM integrations, model selection, AI media tooling, OCR/KYC, and annotation systems in real products.",
    skills: ["OpenAI APIs", "OpenRouter", "Replicate", "FAL", "Agentic AI", "LLM integration"],
  },
  {
    name: "Breadth signals",
    description: "Mobile, game-tech, real-time, graphics, and systems breadth for unusual product surfaces.",
    skills: ["React Native", "Pixi.js 8", "Three.js", "WebRTC", "Web3.js", "Unix/Linux"],
  },
];
