const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const STARTING_COINS = 1000;
const MAX_PLAYERS = 4;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const users = new Map();
const matches = new Map();
const transactions = [];

function id(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function publicUser(user) {
  return { id: user.id, username: user.username, coins: user.coins };
}

function publicMatch(match) {
  return {
    ...match,
    players: match.players.map((playerId) => {
      const user = users.get(playerId);
      return user ? { id: user.id, username: user.username } : { id: playerId };
    })
  };
}

function getUser(userId) {
  return users.get(String(userId));
}

function addTransaction(userId, type, amount, note) {
  transactions.push({ id: id("txn"), userId, type, amount, note, createdAt: new Date().toISOString() });
}

app.post("/api/register", (req, res) => {
  const username = String(req.body?.username || "").trim();
  if (username.length < 3 || username.length > 24) {
    return res.status(400).json({ error: "Username must be 3-24 characters" });
  }
  if ([...users.values()].some((user) => user.username.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ error: "Username already exists" });
  }

  const user = { id: id("user"), username, coins: STARTING_COINS };
  users.set(user.id, user);
  addTransaction(user.id, "bonus", STARTING_COINS, "Welcome virtual coins");
  res.status(201).json({ user: publicUser(user) });
});

app.post("/api/login", (req, res) => {
  const username = String(req.body?.username || "").trim().toLowerCase();
  const user = [...users.values()].find((candidate) => candidate.username.toLowerCase() === username);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicUser(user) });
});

app.get("/api/users/:userId", (req, res) => {
  const user = getUser(req.params.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicUser(user) });
});

app.get("/api/users/:userId/transactions", (req, res) => {
  if (!getUser(req.params.userId)) return res.status(404).json({ error: "User not found" });
  res.json({ transactions: transactions.filter((txn) => txn.userId === req.params.userId).slice(-50).reverse() });
});

app.post("/api/wallet/claim-demo-coins", (req, res) => {
  const user = getUser(req.body?.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  const amount = 500;
  user.coins += amount;
  addTransaction(user.id, "credit", amount, "Demo virtual coins");
  res.json({ user: publicUser(user) });
});

app.get("/api/matches", (req, res) => {
  res.json({ matches: [...matches.values()].map(publicMatch) });
});

app.post("/api/matches", (req, res) => {
  const user = getUser(req.body?.userId);
  const entryFee = Number(req.body?.entryFee);
  const title = String(req.body?.title || "Ludo Arena").trim().slice(0, 60);

  if (!user) return res.status(404).json({ error: "User not found" });
  if (!Number.isInteger(entryFee) || entryFee < 10 || entryFee > 10000) {
    return res.status(400).json({ error: "Entry fee must be an integer between 10 and 10000 virtual coins" });
  }
  if (user.coins < entryFee) return res.status(400).json({ error: "Not enough virtual coins" });

  user.coins -= entryFee;
  const match = {
    id: id("match"), title: title || "Ludo Arena", entryFee, maxPlayers: MAX_PLAYERS,
    status: "open", players: [user.id], prizePool: entryFee, winnerId: null, createdAt: new Date().toISOString()
  };
  matches.set(match.id, match);
  addTransaction(user.id, "stake", -entryFee, `Joined ${match.title}`);
  res.status(201).json({ match: publicMatch(match), user: publicUser(user) });
});

app.post("/api/matches/:matchId/join", (req, res) => {
  const user = getUser(req.body?.userId);
  const match = matches.get(req.params.matchId);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!match) return res.status(404).json({ error: "Match not found" });
  if (match.status !== "open") return res.status(400).json({ error: "Match is not open" });
  if (match.players.includes(user.id)) return res.status(400).json({ error: "Already joined" });
  if (match.players.length >= match.maxPlayers) return res.status(400).json({ error: "Match is full" });
  if (user.coins < match.entryFee) return res.status(400).json({ error: "Not enough virtual coins" });

  user.coins -= match.entryFee;
  match.players.push(user.id);
  match.prizePool += match.entryFee;
  addTransaction(user.id, "stake", -match.entryFee, `Joined ${match.title}`);
  if (match.players.length === match.maxPlayers) match.status = "ready";
  res.json({ match: publicMatch(match), user: publicUser(user) });
});

app.post("/api/matches/:matchId/demo-result", (req, res) => {
  const match = matches.get(req.params.matchId);
  if (!match) return res.status(404).json({ error: "Match not found" });
  if (!['open', 'ready'].includes(match.status)) return res.status(400).json({ error: "Match already resolved" });
  if (match.players.length < 2) return res.status(400).json({ error: "At least two players are required" });
  if (!match.players.includes(req.body?.winnerId)) return res.status(400).json({ error: "Winner is not in this match" });

  // Demo-only resolution: no real money, deposits, withdrawals, or cash prizes.
  const winner = getUser(req.body.winnerId);
  winner.coins += match.prizePool;
  addTransaction(winner.id, "reward", match.prizePool, `Won ${match.title}`);
  match.status = "finished";
  match.winnerId = winner.id;
  res.json({ match: publicMatch(match), user: publicUser(winner) });
});

app.get("/api/health", (_req, res) => res.json({ ok: true, mode: "virtual-coins-only" }));
app.get(/.*/, (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`4XGAME running at http://localhost:${PORT}`));
