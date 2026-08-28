import { getUser } from "@/lib/auth";
import { getCurrentWorkspaceId } from "@/lib/workspace";

/**
 * A higher-order function to wrap server actions with authentication and workspace validation.
 * Ensures the user is logged in and a valid workspace context is present.
 */
export async function withAuth<T>(
    action: (user: any, workspaceId: string) => Promise<T>,
    providedWorkspaceId?: string
): Promise<T> {
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }

    const workspaceId = providedWorkspaceId || await getCurrentWorkspaceId();
    if (!workspaceId) {
        throw new Error('Workspace context required');
    }

    return action(user, workspaceId);
}
