import type { Metadata, Viewport } from "next";
import { Familjen_Grotesk, Martian_Mono } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
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
  title: "Oussama Nahiz – Senior Full-Stack Engineer",
  description:
    "Senior full-stack engineer and 42-grad with 9+ years shipping production software across React, Node.js, TypeScript, and AI. I build products end to end, from architecture to deployment.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Oussama Nahiz – Senior Full-Stack Engineer",
    description:
      "9+ years shipping production software across React, Node.js, TypeScript, and AI. Architecture to deployment.",
    type: "website",
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
