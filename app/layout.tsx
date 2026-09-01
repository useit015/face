import type { Metadata } from "next";
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
  openGraph: {
    title: "Oussama Nahiz – Senior Full-Stack Engineer",
    description:
      "9+ years shipping production software across React, Node.js, TypeScript, and AI. Architecture to deployment, end to end.",
    type: "website",
  },
};

const jsClassScript = `document.documentElement.classList.add("js")`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsClassScript }} />
      </head>
      <body className="min-h-full flex flex-col"><MotionProvider>{children}</MotionProvider></body>
    </html>
  );
}
