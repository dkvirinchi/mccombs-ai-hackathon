import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { content, stripTodo } from "@/lib/content";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

// Until the final URL is decided the TODO value still gives absolute OG image URLs a sane base.
const siteUrl = stripTodo(content.meta.url).trim();

export const metadata: Metadata = {
  title: { default: content.meta.title, template: `%s · ${content.meta.siteName}` },
  description: content.meta.description,
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: content.meta.title,
    description: content.meta.description,
    siteName: content.meta.siteName,
    images: [{ url: content.meta.ogImage }],
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.png", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#FAF7F2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-charcoal focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
