import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { RuntimeEnvScript } from "@/components/providers/runtime-env-script";
import { Toaster } from "@/components/ui/sonner";
import { RootJsonLd } from "@/lib/support/seo/root-json-ld";
import { getSiteUrl, SITE } from "@/lib/support/seo/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: SITE.name,
      template: `%s | ${SITE.shortName}`,
    },
    description: SITE.defaultDescription,
    keywords: ["Wokki", "lịch ca", "chấm công", "quản lý nhân sự", "đổi ca", "đăng nhập"],
    alternates: { canonical: siteUrl },
    openGraph: {
      type: "website",
      locale: SITE.locale,
      url: siteUrl,
      title: SITE.name,
      description: SITE.defaultDescription,
      siteName: SITE.name,
    },
    twitter: {
      card: "summary_large_image",
      title: SITE.name,
      description: SITE.defaultDescription,
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <RuntimeEnvScript />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full`}>
        <RootJsonLd />
        <AppProviders>
          {children}
          <Toaster position="bottom-center" closeButton />
        </AppProviders>
      </body>
    </html>
  );
}
