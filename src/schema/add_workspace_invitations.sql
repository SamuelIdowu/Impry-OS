-- Migration: Add workspace_invitations table
CREATE TABLE IF NOT EXISTS "workspace_invitations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
    "email" TEXT NOT NULL,
    "role" TEXT DEFAULT 'member',
    "token" UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    "status" TEXT DEFAULT 'pending',
    "invited_by" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "workspace_invitations_workspace_id_idx" ON "workspace_invitations" ("workspace_id");
CREATE INDEX IF NOT EXISTS "workspace_invitations_token_idx" ON "workspace_invitations" ("token");
CREATE INDEX IF NOT EXISTS "workspace_invitations_email_idx" ON "workspace_invitations" ("email");
