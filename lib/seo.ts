import { contact, hero } from "./content";

const siteUrl = "https://st9wd.com";
const siteName = hero.name;
const siteTitle = `${siteName} – Senior Full-Stack Engineer`;
const siteDescription =
  `${siteName} is a senior full-stack engineer and graduate of the 42 coding school, with 9+ years building React, Node.js, TypeScript, and AI products.`;
const siteSocialDescription =
  "9+ years building production software with React, Node.js, TypeScript, and AI. Architecture to deployment.";

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: siteName,
      url: siteUrl,
    },
    {
      "@type": "ProfilePage",
      "@id": `${siteUrl}/#profile`,
      name: siteTitle,
      url: siteUrl,
      description: siteDescription,
      isPartOf: { "@id": `${siteUrl}/#website` },
      mainEntity: { "@id": `${siteUrl}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: siteName,
      alternateName: contact.githubUser,
      url: siteUrl,
      image: `${siteUrl}/portrait.jpg`,
      mainEntityOfPage: { "@id": `${siteUrl}/#profile` },
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
    },
  ],
};

export {
  siteUrl,
  siteName,
  siteTitle,
  siteDescription,
  siteSocialDescription,
  siteJsonLd,
};
