import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oussama Nahiz – Senior Full-Stack Engineer",
  description:
    "Senior full-stack engineer and 42-grad with 9+ years shipping production software across React, Node.js, TypeScript, and AI. I ship products end to end, from architecture to deployment.",
  icons: {
    icon: [
      {
        url: "https://emojifavicons.com/sun?dark=moon&ref=st9wd.com",
        type: "image/svg+xml",
      },
    ],
  },
  openGraph: {
    title: "Oussama Nahiz – Senior Full-Stack Engineer",
    description:
      "9+ years shipping production software across React, Node.js, TypeScript, and AI. Architecture to deployment, end to end.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf8f2",
};

const jsClassScript = `document.documentElement.classList.add("js")`;

const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",d?"#0b0b0b":"#faf8f2")}catch(e){}})()`;

const consoleScript = `try{console.log("%cViewing source? Good instinct. It's how I'd vet this page too.","font-weight:600;font-size:13px");console.log("%cIf the code passes inspection, the engineer might too — useit015@gmail.com","color:#8a8578")}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsClassScript }} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: consoleScript }} />
      </head>
      <body className="min-h-full flex flex-col"><MotionProvider>{children}</MotionProvider></body>
    </html>
  );
}
