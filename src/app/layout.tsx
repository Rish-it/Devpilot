import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TamboSetup } from "@/providers/TamboSetup";
import { AuthProvider } from "@/providers/AuthProvider";
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
  title: "DevPilot - Developer Automation Platform",
  description:
    "Codex-style developer automation platform powered by Tambo generative UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <TamboSetup>{children}</TamboSetup>
        </AuthProvider>
      </body>
    </html>
  );
}
