import { createClient, RedisClientType } from 'redis';

let client: RedisClientType | null = null;

function getEnv(name: string): string {
    const value = process.env[name];
    if (!value || value.length === 0) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}

export async function getRedis(): Promise<RedisClientType> {
    if (client) return client;

    const host = getEnv('REDIS_HOST');
    const portRaw = getEnv('REDIS_PORT');
    const username = process.env.REDIS_USERNAME || 'default';
    const password = getEnv('REDIS_PASSWORD');
    const tlsFlag = (process.env.REDIS_TLS || 'true').toLowerCase();
    const tls = tlsFlag === 'true' || tlsFlag === '1';

    const port = Number(portRaw);
    if (!Number.isInteger(port) || port <= 0) {
        throw new Error('Invalid REDIS_PORT');
    }

    client = createClient({
        username,
        password,
        socket: {
            host,
            port,
            tls
        }
    });

    client.on('error', (err) => {
        // eslint-disable-next-line no-console
        console.error('Redis Client Error', err);
    });

    await client.connect();
    return client;
}

export async function disconnectRedis(): Promise<void> {
    if (client) {
        await client.quit();
        client = null;
    }
}

export type { RedisClientType };


