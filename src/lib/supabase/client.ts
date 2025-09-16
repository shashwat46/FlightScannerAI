import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigError } from '../../domain/errors';

let browserClient: SupabaseClient | null = null;

function getPublicEnv(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'): string {
	const value = process.env[name];
	if (!value || value.trim().length === 0) {
		throw new ConfigError(`Missing ${name}`);
	}
	return value.trim();
}

export function getSupabaseBrowserClient(): SupabaseClient {
	if (browserClient) return browserClient;
	const url = getPublicEnv('NEXT_PUBLIC_SUPABASE_URL');
	const anonKey = getPublicEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
	browserClient = createClient(url, anonKey);
	return browserClient;
}


