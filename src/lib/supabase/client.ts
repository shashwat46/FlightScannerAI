import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ConfigError } from '../../domain/errors';

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
	if (browserClient) return browserClient;
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!url || !anonKey) {
		throw new ConfigError('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set');
	}

	browserClient = createBrowserClient(url, anonKey, {
		auth: {
			persistSession: true,
			autoRefreshToken: true
		}
	});
	return browserClient;
}


