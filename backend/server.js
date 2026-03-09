require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const alpaca = require("./alpaca");

const app = express();
app.use(cors());
app.use(express.json());

function ensurePortfolio(email) {
  let p = db.prepare("SELECT * FROM portfolios WHERE user_email = ?").get(email);
  if (!p) {
    db.prepare("INSERT INTO portfolios (user_email) VALUES (?)").run(email);
    p = db.prepare("SELECT * FROM portfolios WHERE user_email = ?").get(email);
  }
  return p;
}

app.get("/api/market/search", async (req, res) => {
  try {
    const results = await alpaca.searchSymbol(req.query.symbol || "");
    res.json(results);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/market/price", async (req, res) => {
  try {
    const price = await alpaca.getLatestPrice(req.query.symbol);
    res.json({ symbol: req.query.symbol, price });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/market/bars", async (req, res) => {
  try {
    const bars = await alpaca.getBars(req.query.symbol, req.query.timeframe || "1Day", req.query.limit || 60);
    res.json(bars);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/portfolio", async (req, res) => {
  try {
    const { email } = req.query;
    const portfolio = ensurePortfolio(email);
    const positions = db.prepare("SELECT * FROM positions WHERE user_email = ?").all(email);
    const enriched = await Promise.all(positions.map(async (pos) => {
      try {
        const currentPrice = await alpaca.getLatestPrice(pos.symbol);
        return {
          ...pos,
          current_price: currentPrice,
          market_value: currentPrice * pos.quantity,
          pnl: (currentPrice - pos.avg_price) * pos.quantity,
          pnl_pct: ((currentPrice - pos.avg_price) / pos.avg_price) * 100,
        };
      } catch {
        return { ...pos, current_price: pos.avg_price, market_value: pos.avg_price * pos.quantity, pnl: 0, pnl_pct: 0 };
      }
    }));
    const portfolio_value = portfolio.cash_balance + enriched.reduce((sum, p) => sum + p.market_value, 0);
    res.json({ ...portfolio, portfolio_value, positions: enriched });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/orders", (req, res) => {
  const orders = db.prepare("SELECT * FROM orders WHERE user_email = ? ORDER BY timestamp DESC LIMIT 50").all(req.query.email);
  res.json(orders);
});

app.post("/api/trade/buy", async (req, res) => {
  try {
    const { email, symbol, quantity } = req.body;
    if (!email || !symbol || !quantity || quantity <= 0)
      return res.status(400).json({ error: "Invalid request" });
    const price = await alpaca.getLatestPrice(symbol.toUpperCase());
    if (!price) return res.status(400).json({ error: "Could not fetch price" });
    const total = price * quantity;
    const portfolio = ensurePortfolio(email);
    if (portfolio.cash_balance < total)
      return res.status(400).json({ error: "Insufficient funds" });
    db.prepare("UPDATE portfolios SET cash_balance = cash_balance - ? WHERE user_email = ?").run(total, email);
    const existing = db.prepare("SELECT * FROM positions WHERE user_email = ? AND symbol = ?").get(email, symbol.toUpperCase());
    if (existing) {
      const newQty = existing.quantity + quantity;
      const newAvg = (existing.avg_price * existing.quantity + price * quantity) / newQty;
      db.prepare("UPDATE positions SET quantity = ?, avg_price = ? WHERE user_email = ? AND symbol = ?").run(newQty, newAvg, email, symbol.toUpperCase());
    } else {
      db.prepare("INSERT INTO positions (user_email, symbol, quantity, avg_price) VALUES (?,?,?,?)").run(email, symbol.toUpperCase(), quantity, price);
    }
    db.prepare("INSERT INTO orders (user_email, symbol, side, quantity, price, total) VALUES (?,?,?,?,?,?)").run(email, symbol.toUpperCase(), "buy", quantity, price, total);
    res.json({ success: true, price, total, message: `Bought ${quantity} ${symbol} @ $${price.toFixed(2)}` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/trade/sell", async (req, res) => {
  try {
    const { email, symbol, quantity } = req.body;
    if (!email || !symbol || !quantity || quantity <= 0)
      return res.status(400).json({ error: "Invalid request" });
    const existing = db.prepare("SELECT * FROM positions WHERE user_email = ? AND symbol = ?").get(email, symbol.toUpperCase());
    if (!existing || existing.quantity < quantity)
      return res.status(400).json({ error: "Insufficient shares" });
    const price = await alpaca.getLatestPrice(symbol.toUpperCase());
    if (!price) return res.status(400).json({ error: "Could not fetch price" });
    const total = price * quantity;
    db.prepare("UPDATE portfolios SET cash_balance = cash_balance + ? WHERE user_email = ?").run(total, email);
    const newQty = existing.quantity - quantity;
    if (newQty === 0) {
      db.prepare("DELETE FROM positions WHERE user_email = ? AND symbol = ?").run(email, symbol.toUpperCase());
    } else {
      db.prepare("UPDATE positions SET quantity = ? WHERE user_email = ? AND symbol = ?").run(newQty, email, symbol.toUpperCase());
    }
    db.prepare("INSERT INTO orders (user_email, symbol, side, quantity, price, total) VALUES (?,?,?,?,?,?)").run(email, symbol.toUpperCase(), "sell", quantity, price, total);
    res.json({ success: true, price, total, message: `Sold ${quantity} ${symbol} @ $${price.toFixed(2)}` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/portfolio/reset", (req, res) => {
  const { email } = req.body;
  db.prepare("UPDATE portfolios SET cash_balance = starting_balance WHERE user_email = ?").run(email);
  db.prepare("DELETE FROM positions WHERE user_email = ?").run(email);
  db.prepare("DELETE FROM orders WHERE user_email = ?").run(email);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Sprout backend running on port ${PORT}`));