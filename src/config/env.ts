import { ConfigError } from '../domain/errors';

export interface RedisConfig {
	host: string;
	port: number;
	username: string;
	password: string;
	tls: boolean;
}

export interface AppConfig {
	redis: RedisConfig;
	appUrl?: string;
}

let cachedConfig: AppConfig | null = null;

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value || value.trim().length === 0) {
		throw new ConfigError(`Missing environment variable: ${name}`);
	}
	return value.trim();
}

export function getAppConfig(): AppConfig {
	if (cachedConfig) return cachedConfig;

	const host = requireEnv('REDIS_HOST');
	const portRaw = requireEnv('REDIS_PORT');
	const password = requireEnv('REDIS_PASSWORD');
	const username = (process.env.REDIS_USERNAME || 'default').trim();
	const tlsFlag = (process.env.REDIS_TLS || 'true').toLowerCase();
	const tls = tlsFlag === 'true' || tlsFlag === '1';

	const port = Number(portRaw);
	if (!Number.isInteger(port) || port <= 0) {
		throw new ConfigError('REDIS_PORT must be a positive integer');
	}

	cachedConfig = {
		redis: { host, port, username, password, tls },
		appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim()
	};

	return cachedConfig;
}


