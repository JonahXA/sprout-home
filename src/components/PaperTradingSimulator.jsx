import React, { useEffect, useMemo, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, RefreshCw, Search, Plus, Minus, AlertCircle } from "lucide-react";

const C = {
  navy:"#1F3A64", navyMid:"#172E52", navyLight:"#264D82", navyGlow:"rgba(31,58,100,0.12)",
  accent:"#3B82F6", accentSoft:"#E8F0FE", accentMid:"#BFDBFE",
  green:"#22C55E", greenSoft:"#E8F8F0", greenMid:"#BBF7D0",
  red:"#EF4444", redSoft:"#FEF2F2", redMid:"#FECACA",
  amber:"#F59E0B", amberSoft:"#FFF3E0",
  bg:"#FFFFFF", bgSoft:"#F8FAFC", bgMid:"#F1F5F9",
  border:"#E5E7EB", borderMid:"#D1D5DB",
  text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
};

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

  const card = { background:C.bg, border:`1px solid ${C.border}`, borderRadius:16, boxShadow:"0 1px 4px rgba(0,0,0,0.05)", overflow:"hidden" };
  const cardPad = { padding:"20px 22px" };
  const cardHead = { padding:"16px 22px", borderBottom:`1px solid ${C.border}` };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20, fontFamily:"'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif", color:C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .pt-input:focus { border-color: ${C.accent} !important; outline: none; box-shadow: 0 0 0 3px ${C.accentSoft}; }
        .pt-chip { cursor:pointer; transition: all 0.15s ease; }
        .pt-chip:hover { border-color: ${C.borderMid} !important; background: ${C.bgMid} !important; }
        .pt-pos-row { cursor:pointer; transition: all 0.15s ease; }
        .pt-pos-row:hover { border-color: ${C.borderMid} !important; background: ${C.bgSoft} !important; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed", top:24, right:24, zIndex:9999,
          background: toast.isError ? C.redSoft : C.greenSoft,
          border: `1px solid ${toast.isError ? C.redMid : C.greenMid}`,
          color: toast.isError ? "#DC2626" : "#16A34A",
          padding:"12px 20px", borderRadius:12, fontWeight:600, fontSize:14,
          boxShadow:`0 8px 28px ${C.navyGlow}`
        }}>
          {toast.msg}
        </div>
      )}

      {/* Error */}
      {err && (
        <div style={{ ...card, background:C.redSoft, border:`1px solid ${C.redMid}` }}>
          <div style={{ ...cardPad, display:"flex", alignItems:"center", gap:12, color:"#DC2626" }}>
            <AlertCircle style={{ width:18, height:18, flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:700, margin:0, fontSize:14 }}>Error</p>
              <p style={{ margin:"2px 0 0", fontSize:13 }}>{err}</p>
            </div>
            <button onClick={() => setErr(null)} style={{ background:"none", border:"none", color:"#DC2626", fontSize:18, fontWeight:700, cursor:"pointer", opacity:0.6, lineHeight:1 }}>×</button>
          </div>
        </div>
      )}

      {/* Portfolio Overview */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }} className="pt-stat-grid">
        {[
          { label:"Portfolio Value", value: portfolio ? `$${Number(portfolio.portfolio_value).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}` : "—", iconBg:C.accentSoft, iconColor:C.accent },
          { label:"Cash Balance",    value: portfolio ? `$${Number(portfolio.cash_balance).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}` : "—", iconBg:C.bgMid, iconColor:C.textSub },
          { label:"Open Positions",  value: positions.length, iconBg:C.amberSoft, iconColor:C.amber },
          { label:"Total P&L",       value: portfolio ? `$${(portfolio.portfolio_value - portfolio.starting_balance).toFixed(2)}` : "—",
            color: portfolio ? (portfolio.portfolio_value >= portfolio.starting_balance ? C.green : C.red) : undefined,
            iconBg: portfolio ? (portfolio.portfolio_value >= portfolio.starting_balance ? C.greenSoft : C.redSoft) : C.bgMid,
            iconColor: portfolio ? (portfolio.portfolio_value >= portfolio.starting_balance ? C.green : C.red) : C.textSub },
        ].map((s) => (
          <div key={s.label} style={card}>
            <div style={{ background:s.iconBg, padding:"14px 18px 12px", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ fontSize:10, fontWeight:700, color:s.iconColor, textTransform:"uppercase", letterSpacing:"0.07em" }}>{s.label}</div>
            </div>
            <div style={{ padding:"14px 18px 16px" }}>
              <div style={{ fontSize:22, fontWeight:900, color:s.color || C.text, letterSpacing:"-0.5px", lineHeight:1 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:18 }} className="pt-main-grid">
        {/* Left col spans 2 */}
        <div style={{ gridColumn:"span 2", display:"flex", flexDirection:"column", gap:18 }}>

          {/* Search bar */}
          <div style={card}>
            <div style={cardPad}>
              <div style={{ display:"flex", gap:10, marginBottom:14 }}>
                <div style={{ position:"relative", flex:1 }}>
                  <Search style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", width:15, height:15, color:C.textMuted }} />
                  <input
                    placeholder="Enter symbol (e.g. AAPL, TSLA, SPY)"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => { if (e.key === "Enter" && searchInput) { changeSymbol(searchInput); setSearchInput(""); } }}
                    className="pt-input"
                    style={{ width:"100%", height:40, paddingLeft:34, paddingRight:12, border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:14, fontWeight:500, color:C.text, background:C.bg, boxSizing:"border-box", fontFamily:"inherit" }}
                  />
                </div>
                <button
                  onClick={() => { if (searchInput) { changeSymbol(searchInput); setSearchInput(""); } }}
                  style={{ padding:"0 20px", height:40, borderRadius:999, background:C.navy, color:"#fff", fontSize:14, fontWeight:700, border:"none", cursor:"pointer", transition:"all 0.15s ease", whiteSpace:"nowrap" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = C.navyMid; e.currentTarget.style.boxShadow = `0 4px 14px ${C.navyGlow}`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = C.navy; e.currentTarget.style.boxShadow = "none"; }}
                >Go</button>
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {DEFAULT_WATCHLIST.map((s) => (
                  <button key={s} className="pt-chip"
                    onClick={() => changeSymbol(s)}
                    style={{ padding:"5px 11px", borderRadius:999, border:`1.5px solid ${symbol === s ? C.navy : C.border}`, background:symbol === s ? C.navy : C.bg, color:symbol === s ? "#fff" : C.textSub, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s ease" }}
                  >{s}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div style={card}>
            <div style={{ ...cardHead, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:22, fontWeight:900, color:C.text, letterSpacing:"-0.5px" }}>{symbol}</div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:6, flexWrap:"wrap" }}>
                  <span style={{ fontSize:28, fontWeight:900, color:C.text, letterSpacing:"-0.8px" }}>{price ? `$${price.toFixed(2)}` : "—"}</span>
                  {change != null && changePct != null && (
                    <span style={{ display:"inline-flex", alignItems:"center", gap:3, padding:"4px 10px", borderRadius:999, background:change >= 0 ? C.greenSoft : C.redSoft, border:`1px solid ${change >= 0 ? C.greenMid : C.redMid}`, color:change >= 0 ? "#16A34A" : "#DC2626", fontSize:12, fontWeight:700 }}>
                      {change >= 0 ? <ArrowUpRight style={{width:13,height:13}}/> : <ArrowDownRight style={{width:13,height:13}}/>}
                      ${Math.abs(change).toFixed(2)} ({changePct.toFixed(2)}%)
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => loadChart(symbol)} disabled={loading}
                style={{ width:34, height:34, borderRadius:10, border:`1px solid ${C.border}`, background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.15s ease", color:C.textSub, flexShrink:0 }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.borderMid; e.currentTarget.style.background = C.bgMid; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg; }}
              ><RefreshCw style={{ width:14, height:14, animation: loading ? "spin 1s linear infinite" : "none" }} /></button>
            </div>
            <div style={cardPad}>
              <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
                {TIMEFRAMES.map((t, idx) => (
                  <button key={t.label}
                    onClick={() => setTimeframeIdx(idx)}
                    style={{ padding:"5px 14px", borderRadius:999, border:`1.5px solid ${timeframeIdx === idx ? C.navy : C.border}`, background:timeframeIdx === idx ? C.navy : C.bg, color:timeframeIdx === idx ? "#fff" : C.textSub, fontSize:12, fontWeight:700, cursor:"pointer", transition:"all 0.15s ease" }}
                  >{t.label}</button>
                ))}
              </div>
              <div style={{ height:300 }}>
                {chart.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chart}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.bgMid} />
                      <XAxis dataKey="time" hide />
                      <YAxis domain={["auto","auto"]} tickFormatter={(v) => `$${Number(v).toFixed(0)}`} tick={{ fontSize:11, fill:C.textMuted }} />
                      <Tooltip contentStyle={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, fontSize:13, boxShadow:`0 4px 20px ${C.navyGlow}` }} formatter={(v) => [`$${Number(v).toFixed(2)}`, "Price"]} />
                      <Line type="monotone" dataKey="close" stroke={C.navy} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", color:C.textMuted, fontSize:13 }}>
                    {loading ? "Loading chart…" : "No chart data"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trade panel */}
          <div style={card}>
            <div style={cardHead}>
              <div style={{ fontSize:15, fontWeight:800, color:C.text, letterSpacing:"-0.3px" }}>Place Order — {symbol}</div>
            </div>
            <div style={{ ...cardPad, display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <button onClick={() => setSide("buy")}
                  style={{ height:46, borderRadius:999, border:`2px solid ${side==="buy" ? C.green : C.border}`, background:side==="buy" ? C.green : C.bg, color:side==="buy" ? "#fff" : C.textSub, fontSize:14, fontWeight:700, cursor:"pointer", transition:"all 0.15s ease", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}
                  onMouseEnter={(e) => { if(side!=="buy"){ e.currentTarget.style.borderColor = C.green; e.currentTarget.style.color = C.green; } }}
                  onMouseLeave={(e) => { if(side!=="buy"){ e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSub; } }}
                ><Plus style={{width:15,height:15}}/>Buy</button>
                <button onClick={() => setSide("sell")}
                  style={{ height:46, borderRadius:999, border:`2px solid ${side==="sell" ? C.red : C.border}`, background:side==="sell" ? C.red : C.bg, color:side==="sell" ? "#fff" : C.textSub, fontSize:14, fontWeight:700, cursor:"pointer", transition:"all 0.15s ease", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}
                  onMouseEnter={(e) => { if(side!=="sell"){ e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red; } }}
                  onMouseLeave={(e) => { if(side!=="sell"){ e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSub; } }}
                ><Minus style={{width:15,height:15}}/>Sell</button>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:C.textSub, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>Shares</label>
                <input type="number" min="1" value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value||"1",10)))}
                  className="pt-input"
                  style={{ width:"100%", height:40, padding:"0 12px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:16, fontWeight:700, color:C.text, background:C.bg, boxSizing:"border-box", fontFamily:"inherit", textAlign:"center" }}
                />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:C.textSub, padding:"0 2px" }}>
                <span>Estimated {side === "buy" ? "cost" : "proceeds"}</span>
                <span style={{ fontWeight:700, color:C.text }}>${estimatedCost}</span>
              </div>
              {currentPosition && (
                <div style={{ fontSize:13, color:C.textSub, padding:"0 2px" }}>
                  You hold <span style={{ fontWeight:700, color:C.text }}>{currentPosition.quantity} shares</span> of {symbol}
                </div>
              )}
              <button onClick={executeOrder} disabled={orderLoading}
                style={{ width:"100%", height:46, borderRadius:999, background:side==="buy" ? C.green : C.red, color:"#fff", fontSize:14, fontWeight:800, border:"none", cursor:orderLoading?"not-allowed":"pointer", transition:"all 0.15s ease", opacity:orderLoading?0.7:1, letterSpacing:"-0.2px" }}
                onMouseEnter={(e) => { if(!orderLoading){ e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.2)"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >{orderLoading ? "Processing…" : `${side==="buy"?"Buy":"Sell"} ${qty} share${qty>1?"s":""} of ${symbol}`}</button>
              <button onClick={resetPortfolio}
                style={{ width:"100%", height:36, borderRadius:999, background:"none", border:`1px solid ${C.border}`, color:C.textMuted, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted; }}
              >Reset Portfolio to $10,000</button>
            </div>
          </div>
        </div>

        {/* Right: positions + history */}
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <div style={card}>
            <div style={cardHead}>
              <div style={{ fontSize:15, fontWeight:800, color:C.text, letterSpacing:"-0.3px" }}>Open Positions</div>
            </div>
            <div style={cardPad}>
              {!positions.length ? (
                <p style={{ color:C.textMuted, fontSize:13, textAlign:"center", padding:"20px 0", lineHeight:1.6 }}>No positions yet.<br/>Place a buy order to get started.</p>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {positions.map((p) => (
                    <div key={p.symbol} onClick={() => changeSymbol(p.symbol)}
                      className="pt-pos-row"
                      style={{ padding:"12px 14px", border:`1px solid ${C.border}`, borderRadius:12, cursor:"pointer", transition:"all 0.15s ease" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                        <span style={{ fontWeight:800, fontSize:14, color:C.text }}>{p.symbol}</span>
                        <span style={{ fontSize:11, fontWeight:700, color:C.textSub, background:C.bgMid, border:`1px solid ${C.border}`, borderRadius:999, padding:"2px 8px" }}>{p.quantity} sh</span>
                      </div>
                      <div style={{ fontSize:11, color:C.textSub }}>Avg ${Number(p.avg_price).toFixed(2)} · Now ${Number(p.current_price).toFixed(2)}</div>
                      <div style={{ fontSize:12, fontWeight:700, marginTop:4, color:p.pnl >= 0 ? "#16A34A" : C.red }}>
                        {p.pnl >= 0 ? "+" : ""}${Number(p.pnl).toFixed(2)} ({p.pnl >= 0 ? "+" : ""}{Number(p.pnl_pct).toFixed(2)}%)
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={card}>
            <div style={cardHead}>
              <div style={{ fontSize:15, fontWeight:800, color:C.text, letterSpacing:"-0.3px" }}>Order History</div>
            </div>
            <div style={cardPad}>
              {!orders.length ? (
                <p style={{ color:C.textMuted, fontSize:13, textAlign:"center", padding:"20px 0" }}>No orders yet.</p>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                  {orders.slice(0,10).map((o, i) => (
                    <div key={o.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom: i < Math.min(orders.length,10)-1 ? `1px solid ${C.bgMid}` : "none" }}>
                      <div>
                        <span style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", marginRight:6, color:o.side==="buy" ? "#16A34A" : C.red }}>{o.side}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{o.symbol}</span>
                        <span style={{ fontSize:11, color:C.textMuted, marginLeft:4 }}>×{o.quantity}</span>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:13, fontWeight:700, color:C.text }}>${Number(o.total).toFixed(2)}</div>
                        <div style={{ fontSize:11, color:C.textMuted }}>@${Number(o.price).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 1024px) { .pt-main-grid { grid-template-columns: 1fr !important; } .pt-main-grid > div:first-child { grid-column: span 1 !important; } }
        @media (max-width: 768px) { .pt-stat-grid { grid-template-columns: repeat(2,1fr) !important; } }
      `}</style>
    </div>
  );
}