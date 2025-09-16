import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
	serverClient = createClient(url, anonKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});
	return serverClient;
}


