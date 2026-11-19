import "@/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { type Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/theme-provider";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "Engram — Find your way through code",
  description: "Engram: our codebase’s memory. Have a meaningful conversation with your entire engineering workflow.",
  icons: [{ rel: "icon", url: "/engram-icon.svg" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geist.variable} ${geistMono.variable} ${spaceGrotesk.variable}`}
        suppressHydrationWarning
      >
        <body>
          {/* 
            Theme Provider Configuration:
            - defaultTheme="light": Enforces light mode as the default for all visitors out-of-the-box.
            - enableSystem={false}: Prevents dark mode from automatically applying based on OS preference.
            - Users can still manually toggle to dark mode anytime via the ThemeToggle component.
          */}
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <TRPCReactProvider>{children}</TRPCReactProvider>
            <Toaster richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}