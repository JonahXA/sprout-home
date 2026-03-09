import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, RefreshCw, Search, Plus, Minus, AlertCircle } from "lucide-react";

const API = "https://sprout-home-production.up.railway.app/api";

const safeParse = (raw, fallback) => { try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
const getLocalUser = () => safeParse(localStorage.getItem("sprout_user"), null);

const DEFAULT_WATCHLIST = [
  "AAPL","MSFT","NVDA","AMZN","GOOGL","META","TSLA",
  "JPM","BAC","V","MA","COST","SPY","QQQ","DIA","IWM","VTI"
];

const TIMEFRAMES = [
  { label: "1D",  timeframe: "1Min",  limit: 390 },
  { label: "5D",  timeframe: "5Min",  limit: 500 },
  { label: "1M",  timeframe: "15Min", limit: 600 },
  { label: "6M",  timeframe: "1Hour", limit: 600 },
  { label: "1Y",  timeframe: "1Day",  limit: 365 },
];

export default function PaperTradingSimulator() {
  const user = getLocalUser();
  const email = user?.email || "guest@sprout.app";

  const [symbol, setSymbol]           = useState("AAPL");
  const [searchInput, setSearchInput] = useState("");
  const [timeframeIdx, setTimeframeIdx] = useState(0);

  const [chart, setChart]         = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [orders, setOrders]       = useState([]);

  const [qty, setQty]   = useState(1);
  const [side, setSide] = useState("buy");

  const [loading, setLoading]     = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [err, setErr]             = useState(null);
  const [toast, setToast]         = useState(null);

  const tf = TIMEFRAMES[timeframeIdx];

  // ── Helpers ──────────────────────────────────────────────────────────────

  function showToast(msg, isError = false) {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  }

  async function loadPortfolio() {
    try {
      const res = await fetch(`${API}/portfolio?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPortfolio(data);
    } catch (e) {
      setErr(e.message);
    }
  }

  async function loadOrders() {
    try {
      const res = await fetch(`${API}/orders?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {}
  }

  async function loadChart(sym) {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(
        `${API}/market/bars?symbol=${sym}&timeframe=${tf.timeframe}&limit=${tf.limit}`
      );
      const bars = await res.json();
      if (bars.error) throw new Error(bars.error);
      const rows = (Array.isArray(bars) ? bars : []).map((b) => ({
        t: b.t,
        time: new Date(b.t).toLocaleString([], { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" }),
        open: b.o, high: b.h, low: b.l, close: b.c, volume: b.v,
      }));
      setChart(rows);
    } catch (e) {
      setErr(e.message);
      setChart([]);
    } finally {
      setLoading(false);
    }
  }

  async function executeOrder() {
    setErr(null);
    setOrderLoading(true);
    try {
      const res = await fetch(`${API}/trade/${side}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, symbol, quantity: qty }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      showToast(data.message);
      await Promise.all([loadPortfolio(), loadOrders()]);
    } catch (e) {
      setErr(e.message);
    } finally {
      setOrderLoading(false);
    }
  }

  async function resetPortfolio() {
    if (!window.confirm("Reset your portfolio to $10,000? This cannot be undone.")) return;
    await fetch(`${API}/portfolio/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    showToast("Portfolio reset to $10,000");
    await loadPortfolio();
    await loadOrders();
  }

  function changeSymbol(s) {
    const sym = s.toUpperCase().trim();
    if (!sym) return;
    setSymbol(sym);
    loadChart(sym);
  }

  // ── Initial load ─────────────────────────────────────────────────────────

  useEffect(() => {
    loadPortfolio();
    loadOrders();
    loadChart(symbol);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadChart(symbol);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframeIdx]);

  // ── Derived values ────────────────────────────────────────────────────────

  const price = useMemo(() => {
    if (!chart.length) return null;
    return chart[chart.length - 1]?.close ?? null;
  }, [chart]);

  const change = useMemo(() => {
    if (!chart.length || !price) return null;
    return price - chart[0].close;
  }, [chart, price]);

  const changePct = useMemo(() => {
    if (!chart.length || !price || !chart[0].close) return null;
    return (price / chart[0].close - 1) * 100;
  }, [chart, price]);

  const positions = portfolio?.positions ?? [];
  const currentPosition = positions.find((p) => p.symbol === symbol);
  const estimatedCost = price ? (price * qty).toFixed(2) : "—";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed", top:24, right:24, zIndex:9999,
          background: toast.isError ? "#FEF2F2" : "#F0FDF4",
          border: `1px solid ${toast.isError ? "#FECACA" : "#BBF7D0"}`,
          color: toast.isError ? "#DC2626" : "#16A34A",
          padding:"12px 20px", borderRadius:10, fontWeight:600, fontSize:14,
          boxShadow:"0 4px 20px rgba(0,0,0,0.1)"
        }}>
          {toast.msg}
        </div>
      )}

      {/* Error */}
      {err && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Error</p>
                <p className="text-sm">{err}</p>
              </div>
              <button onClick={() => setErr(null)} className="ml-auto text-red-400 hover:text-red-600 text-lg font-bold">×</button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label:"Portfolio Value", value: portfolio ? `$${Number(portfolio.portfolio_value).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}` : "—" },
          { label:"Cash Balance",    value: portfolio ? `$${Number(portfolio.cash_balance).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}` : "—" },
          { label:"Open Positions",  value: positions.length },
          { label:"Total P&L",       value: portfolio ? `$${(portfolio.portfolio_value - portfolio.starting_balance).toFixed(2)}` : "—",
            color: portfolio ? (portfolio.portfolio_value >= portfolio.starting_balance ? "#22C55E" : "#EF4444") : undefined },
        ].map((s) => (
          <Card key={s.label} className="border border-gray-100 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: s.color || "#0F172A" }}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: chart + trade */}
        <div className="lg:col-span-2 space-y-6">

          {/* Search bar */}
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Enter symbol (e.g. AAPL, TSLA, SPY)"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => { if (e.key === "Enter" && searchInput) { changeSymbol(searchInput); setSearchInput(""); } }}
                    className="pl-9"
                  />
                </div>
                <Button onClick={() => { if (searchInput) { changeSymbol(searchInput); setSearchInput(""); } }} style={{ background:"#1F3A64" }} className="text-white hover:opacity-90">
                  Go
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {DEFAULT_WATCHLIST.map((s) => (
                  <Button key={s} variant={symbol === s ? "default" : "outline"} size="sm"
                    onClick={() => changeSymbol(s)}
                    style={symbol === s ? { background:"#1F3A64", color:"#fff" } : {}}
                  >{s}</Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold">{symbol}</CardTitle>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-3xl font-bold">{price ? `$${price.toFixed(2)}` : "—"}</span>
                    {change != null && changePct != null && (
                      <Badge className={change >= 0 ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
                        {change >= 0 ? <ArrowUpRight className="w-3 h-3 inline mr-1"/> : <ArrowDownRight className="w-3 h-3 inline mr-1"/>}
                        ${Math.abs(change).toFixed(2)} ({changePct.toFixed(2)}%)
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => loadChart(symbol)} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4 flex-wrap">
                {TIMEFRAMES.map((t, idx) => (
                  <Button key={t.label} variant={timeframeIdx === idx ? "default" : "outline"} size="sm"
                    onClick={() => setTimeframeIdx(idx)}
                    style={timeframeIdx === idx ? { background:"#1F3A64", color:"#fff" } : {}}
                  >{t.label}</Button>
                ))}
              </div>
              <div className="h-[300px]">
                {chart.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="time" hide />
                      <YAxis domain={["auto","auto"]} tickFormatter={(v) => `$${Number(v).toFixed(0)}`} tick={{ fontSize:11 }} />
                      <Tooltip formatter={(v) => [`$${Number(v).toFixed(2)}`, "Price"]} />
                      <Line type="monotone" dataKey="close" stroke="#1F3A64" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    {loading ? "Loading chart…" : "No chart data"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Trade panel */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader><CardTitle>Place Order — {symbol}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => setSide("buy")} variant={side==="buy"?"default":"outline"}
                  className="h-12" style={side==="buy"?{background:"#22C55E",color:"#fff"}:{}}>
                  <Plus className="w-4 h-4 mr-2"/>Buy
                </Button>
                <Button onClick={() => setSide("sell")} variant={side==="sell"?"default":"outline"}
                  className="h-12" style={side==="sell"?{background:"#EF4444",color:"#fff"}:{}}>
                  <Minus className="w-4 h-4 mr-2"/>Sell
                </Button>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Shares</label>
                <Input type="number" min="1" value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value||"1",10)))}
                  className="text-lg" />
              </div>
              <div className="flex justify-between text-sm text-gray-500 px-1">
                <span>Estimated {side === "buy" ? "cost" : "proceeds"}</span>
                <span className="font-semibold text-gray-800">${estimatedCost}</span>
              </div>
              {currentPosition && (
                <div className="text-sm text-gray-500 px-1">
                  You hold <span className="font-semibold text-gray-800">{currentPosition.quantity} shares</span> of {symbol}
                </div>
              )}
              <Button onClick={executeOrder} disabled={orderLoading} className="w-full h-12 text-base font-bold"
                style={{ background: side==="buy" ? "#22C55E" : "#EF4444", color:"#fff" }}>
                {orderLoading ? "Processing…" : `${side==="buy"?"Buy":"Sell"} ${qty} share${qty>1?"s":""} of ${symbol}`}
              </Button>
              <Button variant="outline" size="sm" className="w-full text-gray-400 hover:text-red-500" onClick={resetPortfolio}>
                Reset Portfolio to $10,000
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: positions + history */}
        <div className="space-y-6">
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader><CardTitle>Open Positions</CardTitle></CardHeader>
            <CardContent>
              {!positions.length ? (
                <p className="text-gray-400 text-sm text-center py-6">No positions yet.<br/>Place a buy order to get started.</p>
              ) : (
                <div className="space-y-3">
                  {positions.map((p) => (
                    <div key={p.symbol} onClick={() => changeSymbol(p.symbol)}
                      className="p-3 border border-gray-100 rounded-xl cursor-pointer hover:border-gray-300 transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold">{p.symbol}</span>
                        <Badge variant="outline">{p.quantity} sh</Badge>
                      </div>
                      <div className="text-xs text-gray-500">Avg ${Number(p.avg_price).toFixed(2)} · Now ${Number(p.current_price).toFixed(2)}</div>
                      <div className={`text-xs font-semibold mt-1 ${p.pnl >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {p.pnl >= 0 ? "+" : ""}${Number(p.pnl).toFixed(2)} ({p.pnl >= 0 ? "+" : ""}{Number(p.pnl_pct).toFixed(2)}%)
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm">
            <CardHeader><CardTitle>Order History</CardTitle></CardHeader>
            <CardContent>
              {!orders.length ? (
                <p className="text-gray-400 text-sm text-center py-6">No orders yet.</p>
              ) : (
                <div className="space-y-2">
                  {orders.slice(0,10).map((o) => (
                    <div key={o.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <span className={`text-xs font-bold uppercase mr-2 ${o.side==="buy"?"text-green-600":"text-red-500"}`}>{o.side}</span>
                        <span className="text-sm font-semibold">{o.symbol}</span>
                        <span className="text-xs text-gray-400 ml-1">×{o.quantity}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">${Number(o.total).toFixed(2)}</div>
                        <div className="text-xs text-gray-400">@${Number(o.price).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}