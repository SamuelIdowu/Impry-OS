import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/server/db";
import * as schema from "@/server/db/schema";
import { headers } from "next/headers";
import { dash } from "@better-auth/infra";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            ...schema,
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts,
            verification: schema.verifications
        }
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    trustedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.BETTER_AUTH_URL,
        "https://impry-os.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ].filter(Boolean) as string[],
    plugins: [
        dash(),
        nextCookies()
    ],
    emailAndPassword: {
        enabled: true,
    },
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ["google"],
            requireLocalEmailVerified: false,
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }
    }
});

export async function getSession() {
    const headersList = await headers();
    return await auth.api.getSession({
        headers: headersList
    });
}

export async function getUser() {
    const session = await getSession();
    return session?.user ?? null;
}
