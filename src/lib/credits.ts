import type { Prisma, PrismaClient } from "../../generated/prisma";
import { TRPCError } from "@trpc/server";

export const INITIAL_SIGNUP_CREDITS = 150;

type PrismaTx = PrismaClient | Prisma.TransactionClient;

/**
 * Ensures a user has received their initial 150 free signup credits.
 * If the user has never received a SIGNUP credit entry, one is created.
 * Returns the current total balance for the user.
 */
export async function ensureSignupCredits(db: PrismaTx, userId: string): Promise<number> {
  const existingSignup = await db.creditEntry.findFirst({
    where: { userId, reason: "SIGNUP" },
  });

  if (!existingSignup) {
    const userExists = await db.user.findUnique({
      where: { id: userId },
    });

    if (userExists) {
      await db.creditEntry.create({
        data: {
          userId,
          delta: INITIAL_SIGNUP_CREDITS,
          reason: "SIGNUP",
        },
      });
    } else {
      try {
        const { clerkClient } = await import("@clerk/nextjs/server");
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);
        if (clerkUser?.emailAddresses?.[0]?.emailAddress) {
          const email = clerkUser.emailAddresses[0].emailAddress;
          await db.user.upsert({
            where: { emailAddress: email },
            update: {
              imageUrl: clerkUser.imageUrl,
              firstName: clerkUser.firstName,
              lastName: clerkUser.lastName,
            },
            create: {
              id: userId,
              emailAddress: email,
              imageUrl: clerkUser.imageUrl,
              firstName: clerkUser.firstName,
              lastName: clerkUser.lastName,
            },
          });
          await db.creditEntry.create({
            data: {
              userId,
              delta: INITIAL_SIGNUP_CREDITS,
              reason: "SIGNUP",
            },
          });
        }
      } catch (err) {
        console.error("Auto-syncing user for signup credits failed:", err);
      }
    }
  }

  const { _sum } = await db.creditEntry.aggregate({
    where: { userId },
    _sum: { delta: true },
  });

  return _sum.delta ?? 0;
}

/** Counts every file (blob) in the repo's default branch with one GitHub call. */
export async function countRepoFiles(githubUrl: string, githubToken?: string) {
  let owner: string | undefined;
  let repo: string | undefined;
  try {
    const parts = new URL(githubUrl).pathname.split("/").filter(Boolean);
    owner = parts[0];
    repo = parts[1]?.replace(/\.git$/, "");
  } catch {
    // handled below
  }
  if (!owner || !repo) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid GitHub URL" });
  }

  const token = githubToken || process.env.GITHUB_TOKEN;
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );

  if (res.status === 404) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Repository not found. If it is private, add a GitHub token.",
    });
  }
  if (res.status === 403 || res.status === 429) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "GitHub rate limit reached. Add a GitHub token and try again.",
    });
  }
  if (!res.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Could not read the repository from GitHub",
    });
  }

  const data = (await res.json()) as { tree: { type: string }[] };
  return data.tree.filter((item) => item.type === "blob").length;
}
