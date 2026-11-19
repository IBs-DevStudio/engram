"use client";

import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  FolderGit2,
  GitBranch,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/use-project";
import ArchiveButton from "./archive-button";
import AskQuestionCard from "./ask-question-card";
import CommitLog from "./commit-log";
import InviteButton from "./invite-button";
import TeamMembers from "./team-members";

export default function DashboardPage() {
  const { project, isLoading } = useProject();
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    if (!project?.githubUrl) return;
    await navigator.clipboard.writeText(project.githubUrl);
    setCopied(true);
    toast.success("Repository URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const hasProject = Boolean(project);

  return (
    <div className="space-y-6">
      {/* 
        Top Project Banner:
        - When a newcomer/user has no project: Displays "Connect your repository" with setup status & connect button.
        - When a project is connected: Displays project name, synced badge, repo link & action buttons.
      */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-primary/10 via-card to-primary/5 p-4 sm:p-5 shadow-xs transition-all">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/25 shadow-2xs flex-none">
              <FaGithub className="size-6 text-foreground" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  {hasProject ? project!.name : "Connect your repository"}
                </h1>
                {hasProject ? (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-[11px] font-medium"
                  >
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Synced &amp; Indexed
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1.5 border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-medium"
                  >
                    <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Setup Required
                  </Badge>
                )}
              </div>

              {hasProject && project?.githubUrl ? (
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <GitBranch className="size-3 text-primary" />
                    Linked repository:
                  </span>
                  <Link
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-foreground/80 hover:text-primary hover:underline transition-colors"
                  >
                    {project.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
                    <ExternalLink className="size-3 ml-0.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                    title="Copy GitHub URL"
                  >
                    {copied ? (
                      <>
                        <Check className="size-2.5 text-emerald-500" />
                        <span className="text-emerald-500">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-2.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Link your GitHub repository to index code with pgvector and enable AI questions &amp; commit memory.
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons: Connect button when new user, or Project Actions when project exists */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 self-start lg:self-center">
            {hasProject ? (
              <>
                <TeamMembers />
                <InviteButton />
                <ArchiveButton />
              </>
            ) : (
              <Link href="/create">
                <Button
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-xs cursor-pointer active:scale-95 touch-friendly"
                >
                  <Plus className="size-4" />
                  <span>Connect repository</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 
        Main Dashboard Section:
        Applies a subtle blur effect over the workspace controls until the user creates their first project.
      */}
      <div className="relative min-h-[420px]">
        {/* Content Area: Blurred until a repository is linked */}
        <div
          className={`space-y-6 transition-all duration-300 ${
            !hasProject
              ? "filter blur-[4px] select-none pointer-events-none opacity-45"
              : ""
          }`}
          aria-hidden={!hasProject}
        >
          {/* Main Hero Card: Ask Your Repo Copilot (Full Width) */}
          <div>
            <AskQuestionCard className="w-full" />
          </div>

          {/* Commit History */}
          <div className="pt-2">
            <CommitLog />
          </div>
        </div>

        {/* Focus Unlock Overlay: Centered overlay prompting the new user to connect their repo */}
        {!hasProject && !isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
            <div className="mx-auto w-full max-w-md rounded-2xl border border-border/80 bg-card/95 p-6 shadow-2xl backdrop-blur-md text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                <FolderGit2 className="size-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground font-brand">
                  Connect your repository to unlock AI Copilot
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  First, link a GitHub repository to index code with pgvector. Once linked, you can ask architectural questions and trace code changes.
                </p>
              </div>

              <div className="pt-1">
                <Link href="/create">
                  <Button
                    size="lg"
                    className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-md active:scale-95 touch-friendly"
                  >
                    <span>Connect your repository</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>

              <p className="text-[11px] text-muted-foreground font-mono">
                150 free credits provided on signup
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}