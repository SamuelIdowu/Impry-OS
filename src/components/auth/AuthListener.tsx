"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";

export function AuthListener() {
    const router = useRouter();

    useEffect(() => {
        // Only run if there is a hash with an access token
        if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
            const supabase = createBrowserClient();

            // Setting up a listener to catch the session once it's established from the hash
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                if (event === "SIGNED_IN" && session) {
                    // Redirect to dashboard and clear the hash
                    router.push("/dashboard");
                    router.refresh();
                }
            });

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [router]);

    return null;
}
