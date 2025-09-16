import { getRedis, disconnectRedis } from './client';

async function main() {
    const redis = await getRedis();
    await redis.set('foo', 'bar');
    const result = await redis.get('foo');
    // eslint-disable-next-line no-console
    console.log(result);
    await disconnectRedis();
}

main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
});


