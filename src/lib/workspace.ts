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
        throw new Error('Workspace context required for this operation');
    }
    return workspaceId;
}
