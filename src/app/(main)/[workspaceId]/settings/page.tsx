import React from "react"
import { SettingsForm } from "@/components/settings/SettingsForm"
import { getUser } from "@/lib/auth"
import { db } from "@/server/db"
import { users, workspaces } from "@/server/db/schema"
import { eq } from "drizzle-orm"

export default async function SettingsPage({
    params
}: {
    params: Promise<{ workspaceId: string }>
}) {
    const user = await getUser();
    const { workspaceId } = await params;

    if (!user) {
        return <div>Please log in to view settings.</div>
    }

    const profileArray = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1)

    const profile = profileArray[0]

    const [workspace] = await db
        .select({
            planTier: workspaces.planTier,
            subscriptionStatus: workspaces.subscriptionStatus,
        })
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId))
        .limit(1)

    return <SettingsForm user={user} profile={profile} workspaceId={workspaceId} workspacePlan={workspace?.planTier || "free"} workspaceStatus={workspace?.subscriptionStatus || "active"} />
}
