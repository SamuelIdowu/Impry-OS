"use server"

import { db } from "@/server/db"
import { workspaces, workspaceMembers } from "@/server/db/schema"
import { eq, and } from "drizzle-orm"
import { getUser } from "@/lib/auth"

export async function getUserWorkspaces() {
  const user = await getUser()
  
  if (!user) {
    throw new Error("Unauthorized")
  }

  const userWorkspaces = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      role: workspaceMembers.role,
    })
    .from(workspaces)
    .innerJoin(workspaceMembers, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, user.id))
    
  return userWorkspaces
}

export async function verifyWorkspaceAccess(workspaceId: string) {
  const user = await getUser()
  
  if (!user) {
    return false
  }

  const membership = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, user.id)
      )
    )
    .limit(1)

  return membership.length > 0
}

import { headers } from 'next/headers';

export async function getCurrentWorkspaceId() {
    const h = await headers();
    const workspaceId = h.get('x-workspace-id');
    if (!workspaceId) {
        // Return a dummy UUID to prevent DB type errors and crashes during Next.js static pre-rendering
        return '00000000-0000-0000-0000-000000000000';
    }
    return workspaceId;
}
