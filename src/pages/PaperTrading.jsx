import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/** ---------- local helpers ---------- */
const safeParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const getLocalUser = () => safeParse(localStorage.getItem("sprout_user"), null);
const setLocalUser = (u) => localStorage.setItem("sprout_user", JSON.stringify(u));

export default function PaperTrading() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [searchSymbol, setSearchSymbol] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [tradeType, setTradeType] = useState("buy");
  const [shares, setShares] = useState(1);

  const [stockData, setStockData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load user (local)
  useEffect(() => {
    const currentUser = getLocalUser();
    if (!currentUser) {
      navigate(createPageUrl("Login"));
      return;
    }

    // Initialize paper trading account if doesn't exist
    const hasAccount =
      typeof currentUser.paper_trading_balance === "number" &&
      Array.isArray(currentUser.paper_trading_positions);

    if (!hasAccount) {
      const updated = {
        ...currentUser,
        paper_trading_balance: 100000,
        paper_trading_positions: [],
      };
      setLocalUser(updated);
      setUser(updated);
      return;
    }

    setUser(currentUser);
  }, [navigate]);

  // Fetch stock data when symbol changes
  useEffect(() => {
    if (selectedSymbol) fetchStockData(selectedSymbol);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSymbol]);

  const fetchStockData = async (symbol) => {
    setLoading(true);

    try {
      // NOTE: These are placeholders — don’t ship real keys in frontend code.
      const quoteResponse = await fetch(
        `https://data.alpaca.markets/v2/stocks/${symbol}/quotes/latest`,
        {
          headers: {
            "APCA-API-KEY-ID": "YOUR_ALPACA_API_KEY",
            "APCA-API-SECRET-KEY": "YOUR_ALPACA_SECRET_KEY",
          },
        }
      );

      const barsResponse = await fetch(
        `https://data.alpaca.markets/v2/stocks/${symbol}/bars?timeframe=1Day&limit=30`,
        {
          headers: {
            "APCA-API-KEY-ID": "YOUR_ALPACA_API_KEY",
            "APCA-API-SECRET-KEY": "YOUR_ALPACA_SECRET_KEY",
          },
        }
      );

      if (quoteResponse.ok && barsResponse.ok) {
        const quote = await quoteResponse.json();
        const bars = await barsResponse.json();

        const last = bars.bars[bars.bars.length - 1];
        const prev = bars.bars[bars.bars.length - 2] || last;

        setStockData({
          symbol,
          price: quote.quote.ap, // ask price
          bid: quote.quote.bp,
          ask: quote.quote.ap,
          change: last.c - prev.c,
          changePercent: ((last.c - prev.c) / prev.c) * 100,
        });

        setChartData(
          bars.bars.map((bar) => ({
            time: new Date(bar.t).toLocaleDateString(),
            price: bar.c,
          }))
        );

        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }

    // Fallback demo data
    const price = 150 + Math.random() * 50;
    const change = Math.random() * 10 - 5;

    setStockData({
      symbol,
      price,
      bid: price - 0.05,
      ask: price + 0.05,
      change,
      changePercent: Math.random() * 4 - 2,
    });

    const demoData = [];
    let basePrice = 150;
    for (let i = 30; i >= 0; i--) {
      basePrice += (Math.random() - 0.5) * 5;
      demoData.push({
        time: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
        price: basePrice,
      });
    }
    setChartData(demoData);
    setLoading(false);
  };

  const executeTrade = async () => {
    if (!user || !stockData || shares <= 0) return;

    const totalCost = stockData.price * shares;
    const positions = Array.isArray(user.paper_trading_positions)
      ? [...user.paper_trading_positions]
      : [];

    if (tradeType === "buy") {
      if ((user.paper_trading_balance || 0) < totalCost) {
        alert("Insufficient funds!");
        return;
      }

      const idx = positions.findIndex((p) => p.symbol === selectedSymbol);
      if (idx >= 0) {
        const existing = positions[idx];
        const newShares = existing.shares + shares;
        const newAvg =
          ((existing.avgPrice * existing.shares) + (stockData.price * shares)) / newShares;

        positions[idx] = { ...existing, shares: newShares, avgPrice: newAvg };
      } else {
        positions.push({
          symbol: selectedSymbol,
          shares,
          avgPrice: stockData.price,
          purchaseDate: new Date().toISOString(),
        });
      }

      const updatedUser = {
        ...user,
        paper_trading_balance: (user.paper_trading_balance || 0) - totalCost,
        paper_trading_positions: positions,
      };

      setLocalUser(updatedUser);
      setUser(updatedUser);

      alert(`Bought ${shares} shares of ${selectedSymbol} at $${stockData.price.toFixed(2)}`);
      return;
    }

    // Sell
    const idx = positions.findIndex((p) => p.symbol === selectedSymbol);
    if (idx < 0 || positions[idx].shares < shares) {
      alert("Insufficient shares!");
      return;
    }

    const updatedPos = { ...positions[idx], shares: positions[idx].shares - shares };
    if (updatedPos.shares <= 0) positions.splice(idx, 1);
    else positions[idx] = updatedPos;

    const updatedUser = {
      ...user,
      paper_trading_balance: (user.paper_trading_balance || 0) + totalCost,
      paper_trading_positions: positions,
    };

    setLocalUser(updatedUser);
    setUser(updatedUser);

    alert(`Sold ${shares} shares of ${selectedSymbol} at $${stockData.price.toFixed(2)}`);
  };

  const popularSymbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "SPY", "QQQ", "DIA"];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#2D9B6F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const positionsValue = (user.paper_trading_positions || []).reduce((sum, pos) => {
    const currentPrice =
      stockData?.symbol === pos.symbol ? stockData.price : pos.avgPrice;
    return sum + pos.shares * currentPrice;
  }, 0);

  const totalPortfolioValue = (user.paper_trading_balance || 0) + positionsValue;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Paper Trading</h1>
            <p className="text-gray-600">Practice investing with virtual money</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Portfolio Value</p>
            <p className="text-3xl font-bold text-[#2D9B6F]">
              ${totalPortfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Account Overview */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Cash Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                ${(user.paper_trading_balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Positions Value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                ${positionsValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Total Gain/Loss</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${totalPortfolioValue >= 100000 ? "text-[#2D9B6F]" : "text-red-600"}`}>
                {totalPortfolioValue >= 100000 ? "+" : ""}${(totalPortfolioValue - 100000).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart & Trading */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <Card className="border-none shadow-lg">
              <CardContent className="pt-6">
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Search symbol (e.g., AAPL, TSLA)"
                      value={searchSymbol}
                      onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && searchSymbol && setSelectedSymbol(searchSymbol)}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={() => searchSymbol && setSelectedSymbol(searchSymbol)} className="bg-green-600 hover:bg-green-700">
                    Search
                  </Button>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {popularSymbols.map((symbol) => (
                    <Button
                      key={symbol}
                      variant={selectedSymbol === symbol ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSymbol(symbol)}
                      className={selectedSymbol === symbol ? "bg-green-600" : ""}
                    >
                      {symbol}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Price Chart */}
            {stockData && (
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{stockData.symbol}</CardTitle>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-3xl font-bold">${stockData.price.toFixed(2)}</span>
                        <Badge className={`${stockData.change >= 0 ? "bg-green-100 text-[#2D9B6F]" : "bg-red-100 text-red-700"}`}>
                          {stockData.change >= 0 ? (
                            <ArrowUpRight className="w-4 h-4 inline mr-1" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 inline mr-1" />
                          )}
                          {stockData.changePercent.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#999" />
                      <YAxis domain={["dataMin - 5", "dataMax + 5"]} tick={{ fontSize: 12 }} stroke="#999" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "8px" }}
                        formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={stockData.change >= 0 ? "#10b981" : "#ef4444"}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Bid</p>
                      <p className="text-lg font-semibold">${stockData.bid.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ask</p>
                      <p className="text-lg font-semibold">${stockData.ask.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trade Panel */}
            {stockData && (
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle>Execute Trade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => setTradeType("buy")}
                      variant={tradeType === "buy" ? "default" : "outline"}
                      className={`h-14 ${tradeType === "buy" ? "bg-green-600 hover:bg-green-700" : ""}`}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Buy
                    </Button>
                    <Button
                      onClick={() => setTradeType("sell")}
                      variant={tradeType === "sell" ? "default" : "outline"}
                      className={`h-14 ${tradeType === "sell" ? "bg-red-600 hover:bg-red-700" : ""}`}
                    >
                      <Minus className="w-5 h-5 mr-2" />
                      Sell
                    </Button>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Shares</label>
                    <Input
                      type="number"
                      min="1"
                      value={shares}
                      onChange={(e) => setShares(parseInt(e.target.value, 10) || 1)}
                      className="text-lg"
                    />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per share:</span>
                      <span className="font-semibold">${stockData.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total:</span>
                      <span className="text-xl font-bold">${(stockData.price * shares).toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={executeTrade}
                    className={`w-full h-14 text-lg ${tradeType === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                  >
                    {tradeType === "buy" ? "Buy" : "Sell"} {shares} Share{shares > 1 ? "s" : ""}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Positions */}
          <div>
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Your Positions</CardTitle>
              </CardHeader>
              <CardContent>
                {(!user.paper_trading_positions || user.paper_trading_positions.length === 0) ? (
                  <p className="text-gray-500 text-center py-8">No positions yet</p>
                ) : (
                  <div className="space-y-3">
                    {user.paper_trading_positions.map((position, idx) => {
                      const currentPrice =
                        stockData?.symbol === position.symbol ? stockData.price : position.avgPrice;

                      const totalValue = currentPrice * position.shares;
                      const gainLoss = totalValue - (position.avgPrice * position.shares);
                      const gainLossPercent = (gainLoss / (position.avgPrice * position.shares)) * 100;

                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedSymbol(position.symbol)}
                          className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-400 cursor-pointer transition-all"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-lg">{position.symbol}</span>
                            <Badge className={gainLoss >= 0 ? "bg-green-100 text-[#2D9B6F]" : "bg-red-100 text-red-700"}>
                              {gainLoss >= 0 ? "+" : ""}{gainLossPercent.toFixed(2)}%
                            </Badge>
                          </div>

                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Shares:</span>
                              <span className="font-semibold">{position.shares}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Avg Price:</span>
                              <span className="font-semibold">${position.avgPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Value:</span>
                              <span className="font-semibold">${totalValue.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Gain/Loss:</span>
                              <span className={`font-semibold ${gainLoss >= 0 ? "text-[#2D9B6F]" : "text-red-600"}`}>
                                {gainLoss >= 0 ? "+" : ""}${gainLoss.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {loading && (
          <div className="text-center text-sm text-gray-500">
            Loading market data...
          </div>
        )}
      </div>
    </div>
  );
}
