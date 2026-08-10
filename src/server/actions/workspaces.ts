"use server"

import { db } from "@/server/db"
import { workspaces, workspaceMembers } from "@/server/db/schema"
import { eq, and } from "drizzle-orm"
import { getUser } from "@/lib/auth"

export async function getUserWorkspaces() {
  const user = await getUser()
  
  if (!user) {
    return []
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

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export async function verifyWorkspaceAccess(workspaceId: string) {
  const user = await getUser()
  
  if (!user || !workspaceId || !UUID_REGEX.test(workspaceId)) {
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
    let workspaceId = h.get('x-workspace-id');
    
    // Fallback for Server Actions where middleware headers might be dropped
    if (!workspaceId) {
        const referer = h.get('referer');
        if (referer) {
            const match = referer.match(/\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})(?:\/|$)/);
            if (match) {
                workspaceId = match[1];
            }
        }
    }
    if (!workspaceId) {
        // Throw an explicit error instead of silent dummy UUID failure
        throw new Error('Workspace context required for this operation');
    }
    return workspaceId;
}

export async function createWorkspace(name: string) {
  const user = await getUser()
  
  if (!user) {
    throw new Error("Unauthorized")
  }

  const [newWorkspace] = await db
    .insert(workspaces)
    .values({ name })
    .returning({ id: workspaces.id })

  if (!newWorkspace) {
    throw new Error("Failed to create workspace")
  }

  await db.insert(workspaceMembers).values({
    workspaceId: newWorkspace.id,
    userId: user.id,
    role: "owner"
  })

  return newWorkspace
}
