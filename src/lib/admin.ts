import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Verify the current user is an admin. Returns the session if admin,
 * or null if not authenticated or not an admin.
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  // Always verify against DB for admin routes (don't trust JWT alone)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, isAdmin: true },
  });

  if (!user?.isAdmin) {
    return null;
  }

  return session;
}
