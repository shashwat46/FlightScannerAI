import { getSupabaseServerClient } from './supabase/server';
import { getRedis } from './redis';

/**
 * Fetches the Skytrax rating for the given airline IATA code.
 * Falls back to neutral rating 3 when missing.
 */
export async function airlineRating(iata: string): Promise<number> {
    const key = `airline:${iata}`;
    const redis = await getRedis();
    const cached = await redis.get(key);
    if (cached) return Number(cached);

    const db = getSupabaseServerClient();
    const { data } = await db.from('airlines').select('skytrax_rating').eq('iata_code', iata).single();
    const rating = (data?.skytrax_rating ?? 3) as number;
    await redis.set(key, rating.toString(), { EX: 86_400 });
    return rating;
}

/**
 * Fetches the Skytrax rating for the given airport IATA code.
 * Uses neutral rating 3 for unknown airports.
 */
export async function airportRating(iata: string): Promise<number> {
    const key = `airport:${iata}`;
    const redis = await getRedis();
    const cached = await redis.get(key);
    if (cached) return Number(cached);

    const db = getSupabaseServerClient();
    const { data } = await db.from('airports').select('skytrax_rating').eq('iata_code', iata).single();
    const rating = (data?.skytrax_rating ?? 3) as number;
    await redis.set(key, rating.toString(), { EX: 86_400 });
    return rating;
}
