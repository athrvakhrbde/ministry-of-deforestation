import type { Metadata, Viewport } from "next";
import { Special_Elite, DM_Mono, Bebas_Neue } from "next/font/google";
import "./globals.css";

const specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-special-elite",
  display: "swap",
  preload: true,
});

const dmMono = DM_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-mono",
  display: "swap",
  preload: true,
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Ministry of Deforestation",
  description:
    "A people's audit of India's vanishing trees — crowdsourced map of deforestation incidents.",
  icons: { icon: "/favicon.svg" },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a08",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${specialElite.variable} ${dmMono.variable} ${bebasNeue.variable} antialiased bg-[var(--black)] text-[var(--paper)]`}
      >
        {children}
      </body>
    </html>
  );
}
