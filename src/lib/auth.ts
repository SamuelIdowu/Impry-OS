import { cookies } from 'next/headers';
import { createServerClient, createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import { lookup } from 'dns/promises';

// Custom fetch with DNS resolution fallback for Node.js on Windows
const customFetch: typeof fetch = async (url, options) => {
    try {
        const urlObj = new URL(url.toString());

        // Try to resolve DNS first to provide better error messages
        try {
            await lookup(urlObj.hostname);
        } catch (dnsError) {
            console.error(`DNS resolution failed:`, dnsError);
            throw new Error('Unable to connect to the authentication service. Please check your internet connection and try again.');
        }

        // Proceed with fetch if DNS resolves
        const headers = new Headers(options?.headers);
        headers.set('Connection', 'keep-alive');

        const response = await fetch(url, {
            ...options,
            headers,
        });
        return response;
    } catch (error) {
        console.error('Fetch error:', error, 'URL:', url);
        throw error;
    }
};

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
                fetch: customFetch,
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
