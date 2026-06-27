import { db } from "../server/db";
import { users, workspaces, workspaceMembers, clients, projects, scopes, scopeVersions, payments, reminders, timelineEvents } from "../server/db/schema";
import { eq, isNull } from "drizzle-orm";
import crypto from "crypto";

async function main() {
    console.log("Starting data migration to workspaces...");

    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users.`);

    for (const user of allUsers) {
        // Check if user already has a workspace
        const existingMembers = await db.select().from(workspaceMembers).where(eq(workspaceMembers.userId, user.id));
        
        if (existingMembers.length === 0) {
            const workspaceId = crypto.randomUUID();
            console.log(`Creating default workspace for user ${user.id} (${user.email})...`);
            
            // Create default workspace
            await db.insert(workspaces).values({
                id: workspaceId,
                name: `${user.name || "User"}'s Workspace`,
            });

            // Add user to workspace member
            await db.insert(workspaceMembers).values({
                id: crypto.randomUUID(),
                workspaceId: workspaceId,
                userId: user.id,
                role: "owner",
            });

            // Migrate user's clients
            await db.update(clients)
                .set({ workspaceId })
                .where(eq(clients.userId, user.id));

            // Migrate user's projects
            await db.update(projects)
                .set({ workspaceId })
                .where(eq(projects.userId, user.id));

            // Scopes, ScopeVersions, Payments, Reminders, TimelineEvents usually are tied to projectId
            // But if they have workspaceId directly, we should update them:
            try {
                await db.update(scopes).set({ workspaceId }).where(eq(scopes.userId, user.id));
                await db.update(scopeVersions).set({ workspaceId }).where(eq(scopeVersions.userId, user.id));
                await db.update(payments).set({ workspaceId }).where(eq(payments.userId, user.id));
                await db.update(reminders).set({ workspaceId }).where(eq(reminders.userId, user.id));
                await db.update(timelineEvents).set({ workspaceId }).where(eq(timelineEvents.userId, user.id));
            } catch (err) {
                // Ignore if tables do not have userId or workspaceId, some might be indirect via projectId
                console.log(`Note: some deep relations skipped for user ${user.id} (may not have userId or workspaceId columns).`);
            }
        }
    }

    console.log("Migration complete!");
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
