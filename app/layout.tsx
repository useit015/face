import type { Metadata, Viewport } from "next";
import { Gaegu } from "next/font/google";
import { preload } from "react-dom";
import { MotionProvider } from "@/components/motion-provider";
import { PaperDoodles } from "@/components/paper-doodles";
import { PaperMarks } from "@/components/paper-marks";
import { InkSettle } from "@/components/ink/settle";
import {
  siteJsonLd,
  siteDescription,
  siteName,
  siteSocialDescription,
  siteTitle,
  siteUrl,
} from "@/lib/seo";
import { themeColors } from "@/lib/theme";
import "./globals.css";

// Gaegu: an upright, monoline print hand, the closest type to a ballpoint.
const hand = Gaegu({
  variable: "--font-hand",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  alternates: {
    canonical: "/",
    types: {
      "text/plain": "/llms.txt",
    },
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: siteTitle,
    description: siteSocialDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteSocialDescription,
  },
  // Indexing is the default; only the preview limits need saying (an
  // explicit "index" would also sit beside the 404 page's "noindex").
  robots: {
    googleBot: {
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: themeColors.light },
    { media: "(prefers-color-scheme: dark)", color: themeColors.dark },
  ],
  colorScheme: "light dark",
};

// `js` arms the reveal choreography. If the app hasn't hydrated within four
// seconds (slow network, blocked script), disarm it so nothing stays hidden.
const jsClassScript = `(function(){var d=document.documentElement;d.classList.add("js");setTimeout(function(){if(!d.classList.contains("hydrated"))d.classList.remove("js")},4000)})()`;

// Resolve the theme before first paint, and start fetching that theme's
// portrait sheet (the avatar module requests it with fetch()).
const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);var l=document.createElement("link");l.rel="preload";l.as="fetch";l.crossOrigin="anonymous";l.href="/avatar/ink/sheet-"+(d?"dark":"light")+".webp";document.head.appendChild(l)}catch(e){}})()`;

const consoleScript = `try{console.log("%cReading the source. Fair, that's how I'd check too.","font-weight:600;font-size:13px");console.log("%cEvery line on this page is drawn at runtime from seeded strokes. Drag on the empty paper to add your own.","color:#5b67c9");console.log("%cHiring? useit015@gmail.com","color:#8a8578")}catch(e){}`;

const whisperScript = `(function(){try{var t=document.title,w=["Still here.","The ink is drying.","The other tab is slower."],i=Math.floor(Math.random()*w.length);document.addEventListener("visibilitychange",function(){document.title=document.hidden?w[i++%w.length]:t})}catch(e){}})()`;

const jsonLdScript = JSON.stringify(siteJsonLd).replaceAll("<", "\\u003c");

export default function RootLayout({ children }: LayoutProps<"/">) {
  // CSS masks are fetched in CORS mode, so the preload must match it.
  preload("/ink/glyphs.webp", {
    as: "image",
    type: "image/webp",
    crossOrigin: "anonymous",
    fetchPriority: "high",
    imageSrcSet: "/ink/glyphs.webp 2x, /ink/glyphs@3x.webp 3x",
  });

  return (
    <html
      lang="en"
      className={`${hand.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsClassScript }} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: consoleScript }} />
        <script dangerouslySetInnerHTML={{ __html: whisperScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript }}
        />
      </head>
      <body className="relative min-h-full flex flex-col">
        <PaperMarks />
        <a
          href="#main"
          className="ink-tip sr-only px-3 py-1.5 text-meta focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        >
          Skip to content
        </a>
        <MotionProvider>{children}</MotionProvider>
        <PaperDoodles />
        <InkSettle />
      </body>
    </html>
  );
}
