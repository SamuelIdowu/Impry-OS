import { cookies } from 'next/headers';
import { createServerClient, createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        // eslint-disable-next-line @typescript-eslint/no-require-imports
                        const { logInfo, logError } = require('./server-logger');
                        logInfo(`Setting cookies: ${cookiesToSet.map(c => c.name).join(', ')}`);
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch (error) {
                        // eslint-disable-next-line @typescript-eslint/no-require-imports
                        const { logError } = require('./server-logger');
                        logError('Failed to set cookies in createClient', error);
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
            global: {
                fetch: (url, options) => {
                    return fetch(url, {
                        ...options,
                    });
                },
            },
        }
    );
}



export async function getUser() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user;
}

export async function getSession() {
    const supabase = await createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();
    return session;
}
