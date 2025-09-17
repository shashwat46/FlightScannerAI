export async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({} as any));
    throw new Error(body?.error || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export function buildSearchQuery(params: Record<string, any>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    if (typeof v === 'object') q.set(k, JSON.stringify(v));
    else q.set(k, String(v));
  }
  return `/api/search?${q.toString()}`;
}


