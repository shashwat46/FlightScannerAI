import { createClient, RedisClientType } from 'redis';

// Use a global variable to hold the singleton or in-flight promise across hot-reloads / serverless invocations
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const globalForRedis = global as unknown as { __redisClient__?: RedisClientType; __redisPromise__?: Promise<RedisClientType> };

let client: RedisClientType | null = globalForRedis.__redisClient__ || null;
let clientPromise: Promise<RedisClientType> | null = globalForRedis.__redisPromise__ || null;

function getEnv(name: string): string {
    const value = process.env[name];
    if (!value || value.length === 0) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}

export async function getRedis(): Promise<RedisClientType> {
    if (client) return client;
    if (clientPromise) return clientPromise;

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

    clientPromise = (async () => {
        if (!client.isOpen) {
            await client.connect();
        }
        globalForRedis.__redisClient__ = client;
        return client;
    })();

    globalForRedis.__redisPromise__ = clientPromise;
    return clientPromise;
}

export async function disconnectRedis(): Promise<void> {
    if (client) {
        await client.quit();
        client = null;
    }
}

export type { RedisClientType };


