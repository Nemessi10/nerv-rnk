import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "~/styles/globals.css";
import { ThemeProvider } from "~/components/theme-provider";
import { TopNav } from "~/components/top-nav";
import { AuthProvider } from "~/providers/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "nerv-rnk | Music Album Rating & Analytics",
  description: "Track, rate, and analyze your music listening habits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-background text-foreground antialiased`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="nerv-dark"
            enableSystem={false}
            themes={["nerv-dark", "nerv-wave"]}
          >
            <div className="flex min-h-screen flex-col">
              <TopNav />
              <main className="flex-1 pt-16">{children}</main>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
