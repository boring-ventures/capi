import { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "@/components/ui/toaster";

const APP_NAME = "CAPI";
const APP_DESCRIPTION = "Panel Administrativo de CAPI";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

const hanson = localFont({
  src: "./fonts/Hanson-Bold.ttf",
  variable: "--font-hanson",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: APP_URL,
    siteName: APP_NAME,
    locale: "es_ES",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon/favicon.ico",
    shortcut: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
    other: {
      rel: "apple-touch-icon",
      url: "/favicon/apple-touch-icon.png",
    },
  },
  manifest: "/favicon/site.webmanifest",
  keywords: ["capi", "admin", "dashboard", "gestión"],
  authors: [
    {
      name: "CAPI",
      url: APP_URL,
    },
  ],
  creator: "CAPI",
  publisher: "CAPI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${hanson.variable} antialiased`}
        suppressHydrationWarning
      >
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
