"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  GitBranch,
  GitCommit,
  MessageSquareCode,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { EngramIcon } from "@/components/engram-logo";

interface AuthPageShellProps {
  children: React.ReactNode;
  mode: "sign-in" | "sign-up";
}

export function AuthPageShell({ children, mode }: AuthPageShellProps) {
  const isSignIn = mode === "sign-in";
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [copiedField, setCopiedField] = useState<"username" | "password" | null>(null);

  const handleCopy = (text: string, field: "username" | "password") => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-white text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* 1. Full-Width Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
          >
            <EngramIcon size={32} />
            <div className="flex items-center gap-1.5">
              <span className="font-brand font-extrabold text-xl tracking-tight text-slate-950">
                Engram
              </span>
              <span className="size-2 rounded-full bg-indigo-600 animate-pulse" />
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-5 sm:gap-7 text-sm font-medium text-slate-600">
            <Link
              href="/"
              className="hover:text-slate-950 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/#features"
              className="hover:text-slate-950 transition-colors hidden sm:inline-block"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="hover:text-slate-950 transition-colors hidden sm:inline-block"
            >
              How It Works
            </Link>
            <Link
              href="/#pricing"
              className="hover:text-slate-950 transition-colors hidden md:inline-block"
            >
              Pricing
            </Link>
            <Link
              href="/#faq"
              className="hover:text-slate-950 transition-colors hidden md:inline-block"
            >
              FAQ
            </Link>

            {/* Top Right Auth Action Button */}
            <Link
              href={isSignIn ? "/sign-up" : "/sign-in"}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSignIn ? "Sign Up" : "Sign In"}
            </Link>
          </nav>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start pt-8 pb-16 px-4">
        {/* Subtle Ambient Glow */}
        <div className="pointer-events-none absolute top-40 left-1/2 -translate-x-1/2 size-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.07),transparent_70%)] blur-[90px] -z-10" />

        <div className="w-full max-w-[540px] flex flex-col items-center">
          {/* Top Banner: DEMO CREDENTIALS & QUICK ACCESS */}
          <div className="w-full mb-6 sm:mb-8 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="size-3 text-indigo-600 animate-pulse" />
                DEMO CREDENTIALS
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use a ready-made demo account (for recruiters or reviewers) to quickly explore Engram&apos;s rich features.
              </p>
            </div>

            <button
              onClick={() => setShowDemoModal(true)}
              className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-800 transition-all shrink-0 cursor-pointer shadow-2xs w-full sm:w-auto text-center active:scale-[0.98] touch-manipulation"
            >
              View demo details
            </button>
          </div>

          {/* Centered Clerk Component */}
          <div className="w-full flex justify-center">
            {children}
          </div>
        </div>
      </main>

      {/* Demo Details Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-[94vw] max-w-lg rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl max-h-[90dvh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <EngramIcon size={24} />
                <h3 className="text-sm sm:text-base font-bold font-brand text-slate-900">
                  Engram Demo &amp; Reviewer Guide
                </h3>
              </div>
              <button
                onClick={() => setShowDemoModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs text-slate-600 leading-relaxed">
              {/* Credentials Card */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <Sparkles className="size-3 text-indigo-600" />
                    Reviewer Demo Account
                  </span>
                  <span className="text-[10px] font-medium text-indigo-700 bg-indigo-100/90 px-2 py-0.5 rounded-full">
                    Pre-configured
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-sans">
                  {/* Username Card */}
                  <div className="bg-white rounded-lg border border-slate-200/90 p-2.5 flex items-center justify-between shadow-2xs">
                    <div className="min-w-0 pr-2">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Username</p>
                      <p className="text-xs font-mono font-bold text-slate-900 truncate">TryEngram</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy("TryEngram", "username")}
                      className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer shrink-0"
                      title="Copy username"
                      aria-label="Copy username"
                    >
                      {copiedField === "username" ? (
                        <Check className="size-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Password Card */}
                  <div className="bg-white rounded-lg border border-slate-200/90 p-2.5 flex items-center justify-between shadow-2xs">
                    <div className="min-w-0 pr-2">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Password</p>
                      <p className="text-xs font-mono font-bold text-slate-900 truncate">tryEngram@0123456</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy("tryEngram@0123456", "password")}
                      className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer shrink-0"
                      title="Copy password"
                      aria-label="Copy password"
                    >
                      {copiedField === "password" ? (
                        <Check className="size-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 pt-0.5">
                  Click the copy icon to quickly paste credentials into the sign-in form.
                </p>
              </div>

              {/* Rich Features Showcase */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-slate-900">
                  Explore Rich Features in this Account:
                </p>

                <div className="space-y-2 font-sans">
                  <div className="flex items-start gap-2.5 rounded-lg border border-slate-150 bg-slate-50/80 p-2.5">
                    <GitBranch className="size-4 text-indigo-600 mt-0.5 flex-none" />
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">
                        Pre-connected Repositories &amp; Link Any Repo
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Repositories are already connected and indexed in this account. You can also link any new public GitHub repo (e.g. <code>facebook/react</code>, <code>shadcn-ui/ui</code>) or private repo using your credits.
                      </p>
                    </div>
                  </div>


                  <div className="flex items-start gap-2.5 rounded-lg border border-slate-150 bg-slate-50/80 p-2.5">
                    <GitCommit className="size-4 text-indigo-600 mt-0.5 flex-none" />
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">
                        AI Commit Summaries
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Browse automated AI-generated summaries and developer insights on every synced commit.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-lg border border-slate-150 bg-slate-50/80 p-2.5">
                    <Users className="size-4 text-indigo-600 mt-0.5 flex-none" />
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">
                        Invite Members &amp; Collaborate
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Invite teammates to projects, collaborate on codebase questions, and share indexed insights.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <CheckCircle2 className="size-3.5 text-emerald-600 flex-none" />
                  <span>Reviewers can also sign in with any GitHub or Google account (150 free credits provisioned on sign-up).</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowDemoModal(false)}
                className="w-full sm:w-auto rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-semibold transition-colors cursor-pointer active:scale-[0.98] touch-manipulation"
              >
                Got it, continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
