import type { Metadata, Viewport } from "next";
import { Familjen_Grotesk, Martian_Mono } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import {
  personJsonLd,
  siteDescription,
  siteName,
  siteSocialDescription,
  siteTitle,
  siteUrl,
} from "@/lib/seo";
import "./globals.css";

const familjenGrotesk = Familjen_Grotesk({
  variable: "--font-familjen",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian",
  subsets: ["latin"],
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0c0a" },
  ],
  colorScheme: "light dark",
};

const jsClassScript = `document.documentElement.classList.add("js")`;

const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

const consoleScript = `try{console.log("%cViewing source? Good instinct. It's how I'd vet this page too.","font-weight:600;font-size:13px");console.log("%cIf the code passes inspection, the engineer might too — useit015@gmail.com","color:#8a8578")}catch(e){}`;

const whisperScript = `(function(){try{var t=document.title,w=["Still here.","The avatar noticed.","The other tab is slower."],i=Math.floor(Math.random()*w.length);document.addEventListener("visibilitychange",function(){document.title=document.hidden?w[i++%w.length]:t})}catch(e){}})()`;

const jsonLdScript = JSON.stringify(personJsonLd).replaceAll("<", "\\u003c");

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${familjenGrotesk.variable} ${martianMono.variable} h-full antialiased`}
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
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-3 focus:py-1.5 focus:font-mono focus:text-meta focus:text-background focus:outline-none"
        >
          Skip to content
        </a>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
