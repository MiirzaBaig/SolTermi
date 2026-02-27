import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "SolTerminal — Solana Trading Terminal",
  description: "Portfolio-showcase Solana trading terminal. Connect wallet, view charts, and simulate trading.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
  },
  openGraph: {
    title: "SolTerminal — Solana Trading Terminal",
    description: "Portfolio-showcase Solana trading terminal. Connect wallet, view charts, and simulate trading.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // #region agent log
  if (typeof fetch !== "undefined") {
    fetch("http://127.0.0.1:7259/ingest/c132c345-0d90-492d-8f59-aacafebf4960", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "layout.tsx:RootLayout",
        message: "RootLayout entered",
        data: {},
        timestamp: Date.now(),
        hypothesisId: "H2,H3,H5",
      }),
    }).catch(() => {});
  }
  // #endregion
  return (
    <html lang="en" className="dark">
      <body className={`${ibmPlexMono.variable} antialiased font-mono`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
