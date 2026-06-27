import { redirect } from "next/navigation";
import { getUserWorkspaces } from "@/server/actions/workspaces";

export default async function WorkspacesRedirectPage() {
    const workspaces = await getUserWorkspaces();

    if (workspaces && workspaces.length > 0) {
        // Redirect to the first workspace
        redirect(`/${workspaces[0].id}/dashboard`);
    } else {
        // Redirect to workspace onboarding
        redirect("/onboarding");
    }

    // Should never reach here
    return null;
}
