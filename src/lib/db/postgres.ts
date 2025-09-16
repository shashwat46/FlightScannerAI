import postgres, { Sql } from 'postgres';
import { ConfigError } from '../../domain/errors';

let sqlClient: Sql | null = null;

function getDatabaseUrl(): string {
	const url = process.env.DATABASE_URL;
	if (!url || url.trim().length === 0) {
		throw new ConfigError('Missing DATABASE_URL for Postgres connection');
	}
	return url.trim();
}

export function getPostgres(): Sql {
	if (sqlClient) return sqlClient;
	const connectionString = getDatabaseUrl();
	sqlClient = postgres(connectionString, {
		ssl: 'require'
	});
	return sqlClient;
}


