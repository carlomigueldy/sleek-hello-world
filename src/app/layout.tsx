import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Hello, World.",
  description: "A sleek greeting from the web.",
};

// Hardcoded literal — no user input reaches this string, no XSS risk.
// Runs before first paint to apply the correct theme class without flash.
const DARK_MODE_INIT = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* biome-ignore lint: hardcoded literal, no XSS risk */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: DARK_MODE_INIT }}
        />
      </head>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
