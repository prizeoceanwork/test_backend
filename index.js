import express from "express";
import { ensureGame, registerForGame, getStatsForGame } from "./controller.js";
import { db } from "./db.js";
import { eq, sql } from "drizzle-orm";
import { games, registrations } from "./schema.js";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
const allowedOrigins = [
  "https://game1-production-351f.up.railway.app",
  "https://game2-production.up.railway.app",
  "http://localhost:5173" // add for local dev
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.options("*", cors());

// Make sure 3 games exist at startup
 ensureGame("game1", "Game 1");
 ensureGame("game2", "Game 2");
 ensureGame("game3", "Game 3");

// Dynamic register route
app.post("/:slug/register", async (req, res) => {
  try {
    const reg = await registerForGame(req.params.slug, req.body);
    res.json({ message: "Registered successfully", registration: reg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
});

// Dynamic stats route
app.get("/:slug/stats", async (req, res) => {
  try {
    const count = await getStatsForGame(req.params.slug);
    res.json({ registrations: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Stats fetch failed" });
  }
});

// GET /dashboard/admin
app.get("/dashboard/admin", async (req, res) => {
  try {
    // Total registrations across all games
    const totalRegs = await db
      .select({ count: sql`COUNT(*)`.mapWith(Number) })
      .from(registrations);
    console
    // Registrations per game
    const perGame = await db
      .select({
        game: games.name,
        slug: games.slug,
        count: sql`COUNT(${registrations.id})`.mapWith(Number),
      })
      .from(games)
      .leftJoin(registrations, eq(games.id, registrations.gameId))
      .groupBy(games.id);

    // Total number of games
    const gameCount = await db
      .select({ count: sql`COUNT(*)`.mapWith(Number) })
      .from(games);

    res.json({
      totalGames: gameCount[0].count,
      totalRegistrations: totalRegs[0].count,
      perGame,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Admin dashboard fetch failed" });
  }
});



app.get("/dashboard/admin/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    // Find the game
    const game = await db
      .select()
      .from(games)
      .where(eq(games.slug, slug))
      .limit(1);

    if (game.length === 0) {
      return res.status(404).json({ message: "Game not found" });
    }
    const selectedGame = game[0];

    // Count registrations for this game
    const result = await db
      .select({ count: sql`COUNT(*)`.mapWith(Number) })
      .from(registrations)
      .where(eq(registrations.gameId, selectedGame.id));

    res.json({
      game: selectedGame.name,
      registrations: result[0].count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
});





app.get("/seed" , async (req , res ) => {
const perGame = await db
  .select({
    game: games.name,
    slug: games.slug,
    count: sql`COUNT(${registrations.id})`.mapWith(Number),
  })
  .from(games)
  .leftJoin(registrations, eq(games.id, registrations.gameId))
  .groupBy(games.id);

  res.json(perGame)

})

app.use( "/" , (req ,res ) => {
    res.send("Server is up and running")
})

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
