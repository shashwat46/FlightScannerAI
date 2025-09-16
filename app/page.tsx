"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatDurationMinutes } from '../src/lib/format';

interface OfferDto {
	id: string;
	provider: string;
	outbound: { durationMinutes: number; stops: number; segments: Array<{ marketingCarrier: string }> };
	price: { amount: number; currency: string };
	cabin: string;
	score?: number;
}

export default function HomePage() {
	const [origin, setOrigin] = useState('SFO');
	const [destination, setDestination] = useState('LHR');
	const [departDate, setDepartDate] = useState('2025-11-10');
	const [includeScore, setIncludeScore] = useState(true);
	const [loading, setLoading] = useState(false);
	const [offers, setOffers] = useState<OfferDto[]>([]);
	const [error, setError] = useState<string | null>(null);

	const query = useMemo(() => {
		const params = new URLSearchParams({
			origin,
			destination,
			departDate,
			includeScore: includeScore ? 'true' : 'false',
			passengers: JSON.stringify({ adults: 1 }),
			cabin: 'economy',
			currency: 'USD'
		});
		return `/api/search?${params.toString()}`;
	}, [origin, destination, departDate, includeScore]);

	const search = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(query);
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body?.error || `Request failed: ${res.status}`);
			}
			const data = await res.json();
			setOffers(data.offers || []);
		} catch (e: any) {
			setError(e.message || 'Unknown error');
		} finally {
			setLoading(false);
		}
	}, [query]);

	useEffect(() => {
		search();
	}, []);

	return (
		<main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
			<h1>FlightScannerAI</h1>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					search();
				}}
				style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, alignItems: 'end', marginBottom: 16 }}
			>
				<label style={{ display: 'grid', gap: 4 }}>
					<span>Origin</span>
					<input value={origin} onChange={(e) => setOrigin(e.target.value.toUpperCase())} placeholder="SFO" />
				</label>
				<label style={{ display: 'grid', gap: 4 }}>
					<span>Destination</span>
					<input value={destination} onChange={(e) => setDestination(e.target.value.toUpperCase())} placeholder="LHR" />
				</label>
				<label style={{ display: 'grid', gap: 4 }}>
					<span>Depart</span>
					<input type="date" value={departDate} onChange={(e) => setDepartDate(e.target.value)} />
				</label>
				<label style={{ display: 'grid', gap: 4 }}>
					<span>Include score</span>
					<input type="checkbox" checked={includeScore} onChange={(e) => setIncludeScore(e.target.checked)} />
				</label>
				<button type="submit" disabled={loading}>
					{loading ? 'Searching…' : 'Search'}
				</button>
			</form>

			{error && <div style={{ color: 'crimson', marginBottom: 12 }}>{error}</div>}

			<ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
				{offers.map((o) => (
					<li key={o.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
							<div>
								<div style={{ fontWeight: 600 }}>{o.outbound.segments[0]?.marketingCarrier || o.provider}</div>
								<div style={{ color: '#555' }}>
									{formatDurationMinutes(o.outbound.durationMinutes)} • {o.outbound.stops} stops
								</div>
							</div>
							<div style={{ textAlign: 'right' }}>
								<div style={{ fontWeight: 700 }}>
									{o.price.currency} {o.price.amount}
								</div>
								{typeof o.score === 'number' && <div style={{ color: '#0a7' }}>Score {o.score}</div>}
							</div>
						</div>
					</li>
				))}
			</ul>
		</main>
	);
}


