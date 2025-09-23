import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ConfigError } from '../../domain/errors';

let serverClient: SupabaseClient | null = null;

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value || value.trim().length === 0) {
		throw new ConfigError(`Missing environment variable: ${name}`);
	}
	return value.trim();
}

export function getSupabaseServerClient(): SupabaseClient {
	if (serverClient) return serverClient;
	const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
	const anonKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
	const cookieStore = cookies();
	serverClient = createServerClient(url, anonKey, {
		cookies: {
			get(name: string) {
				return cookieStore.get(name)?.value;
			},
			set(name: string, value: string, options: CookieOptions) {
				cookieStore.set({ name, value, ...options });
			},
			remove(name: string, options: CookieOptions) {
				cookieStore.set({ name, value: '', ...options });
			}
		}
	});
	return serverClient;
}


