import { contact } from "./content";

const siteUrl = "https://st9wd.com";
const siteName = "Oussama Nahiz";
const siteTitle = "Oussama Nahiz – Senior Full-Stack Engineer";
const siteDescription =
  "Senior full-stack engineer and 42-grad with 9+ years shipping production software across React, Node.js, TypeScript, and AI. I build products end to end, from architecture to deployment.";
const siteSocialDescription =
  "9+ years shipping production software across React, Node.js, TypeScript, and AI. Architecture to deployment.";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${siteUrl}/#person`,
  name: siteName,
  url: siteUrl,
  jobTitle: "Senior Full-Stack Engineer",
  description: siteDescription,
  email: `mailto:${contact.email}`,
  sameAs: [contact.github, contact.linkedin, contact.toptal],
  alumniOf: {
    "@type": "EducationalOrganization",
    name: "42",
    url: "https://42.fr/",
  },
  knowsAbout: [
    "TypeScript",
    "JavaScript",
    "React",
    "Next.js",
    "Node.js",
    "PostgreSQL",
    "MongoDB",
    "AWS",
    "AI integration",
  ],
};

export {
  siteUrl,
  siteName,
  siteTitle,
  siteDescription,
  siteSocialDescription,
  personJsonLd,
};
