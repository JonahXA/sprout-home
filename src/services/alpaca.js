const API_BASE = import.meta.env.VITE_ALPACA_RELAY_HTTP || 'http://localhost:8787';
const WS_BASE = import.meta.env.VITE_ALPACA_RELAY_WS || 'ws://localhost:8787';

export async function getBars({ symbol, timeframe='1Min', limit=500, feed='delayed_sip' }) {
 const url = new URL(`${API_BASE}/api/market/bars`);
 url.searchParams.set('symbol', symbol);
 url.searchParams.set('timeframe', timeframe);
 url.searchParams.set('limit', String(limit));
 url.searchParams.set('feed', feed);
 const res = await fetch(url);
 if (!res.ok) throw new Error(await res.text());
 return res.json();
}

export async function getSnapshot({ symbol, feed='delayed_sip' }) {
 const url = new URL(`${API_BASE}/api/market/snapshot`);
 url.searchParams.set('symbol', symbol);
 url.searchParams.set('feed', feed);
 const res = await fetch(url);
 if (!res.ok) throw new Error(await res.text());
 return res.json();
}

export async function getPaperAccount() {
 const res = await fetch(`${API_BASE}/api/paper/account`);
 if (!res.ok) throw new Error(await res.text());
 return res.json();
}

export async function getPaperPositions() {
 const res = await fetch(`${API_BASE}/api/paper/positions`);
 if (!res.ok) throw new Error(await res.text());
 return res.json();
}

export async function placePaperOrder({ symbol, qty, side }) {
 const res = await fetch(`${API_BASE}/api/paper/order`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ symbol, qty, side })
 });
 if (!res.ok) throw new Error(await res.text());
 return res.json();
}

export function openMarketWS() {
 return new WebSocket(`${WS_BASE}/ws/market`);
}
