require("dotenv").config();
const fetch = require("node-fetch");

const HEADERS = {
  "APCA-API-KEY-ID": process.env.ALPACA_API_KEY,
  "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY,
  "Content-Type": "application/json",
};

async function getLatestPrice(symbol) {
  const url = `${process.env.ALPACA_DATA_URL}/v2/stocks/${symbol}/trades/latest?feed=iex`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Price fetch failed: ${res.status}`);
  const data = await res.json();
  return data.trade?.p ?? null;
}

async function getBars(symbol, timeframe = "1Day", limit = 60) {
  const url = `${process.env.ALPACA_DATA_URL}/v2/stocks/${symbol}/bars?timeframe=${timeframe}&limit=${limit}&feed=iex`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Bars fetch failed: ${res.status}`);
  const data = await res.json();
  return data.bars ?? [];
}

async function searchSymbol(query) {
  const url = `${process.env.ALPACA_BASE_URL}/v2/assets?status=active&asset_class=us_equity`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const all = await res.json();
  const q = query.toUpperCase();
  return all
    .filter((a) => a.tradable && (a.symbol.startsWith(q) || a.name?.toUpperCase().includes(q)))
    .slice(0, 10)
    .map((a) => ({ symbol: a.symbol, name: a.name, exchange: a.exchange }));
}

module.exports = { getLatestPrice, getBars, searchSymbol };