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
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
    trustedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.BETTER_AUTH_URL,
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
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
    user: {
        deleteUser: {
            enabled: true
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }
    }
});

import { eq } from "drizzle-orm";

export async function getSession() {
    const headersList = await headers();
    return await auth.api.getSession({
        headers: headersList
    });
}

export async function getUser() {
    const session = await getSession();
    if (!session?.user) return null;

    try {
        const [dbUser] = await db.select().from(schema.users).where(eq(schema.users.id, session.user.id));
        if (dbUser) {
            return {
                ...session.user,
                name: dbUser.name || session.user.name,
                email: dbUser.email || session.user.email,
                image: dbUser.image || session.user.image,
                brandColor: dbUser.brandColor,
                logoUrl: dbUser.logoUrl,
                companyName: dbUser.companyName
            };
        }
    } catch (error) {
        console.error("Error in getUser():", error);
    }

    return session.user;
}
