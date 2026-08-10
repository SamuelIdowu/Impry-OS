import React from "react";
import { notFound } from "next/navigation";
import { getInvitationByToken } from "@/lib/invitations";
import { getUser } from "@/lib/auth";
import { InviteAcceptanceCard } from "./InviteAcceptanceCard";

export default async function InvitePage({
    params
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;
    const [invitation, currentUser] = await Promise.all([
        getInvitationByToken(token),
        getUser()
    ]);

    if (!invitation) {
        notFound();
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900/40">
            <InviteAcceptanceCard
                invitation={invitation}
                currentUser={currentUser}
                token={token}
            />
        </div>
    );
}
