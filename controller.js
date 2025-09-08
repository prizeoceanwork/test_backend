import { db } from "./db.js";
import { games, registrations } from "./schema.js";
import { eq, count } from "drizzle-orm";

// Ensure a game exists by slug (creates if not found)
export async function ensureGame(slug, name) {
  const existing = await db.select().from(games).where(eq(games.slug, slug));
  if (existing.length === 0) {
    await db.insert(games).values({ name, slug });
  }
}

// Register for a given game
export async function registerForGame(slug, data) {
 let game = (await db.select().from(games).where(eq(games.slug, slug)))[0];

     if (!game) {
    const inserted = await db
      .insert(games)
      .values({ name: `${slug}`, slug })
      .returning();
    game = inserted[0];
  }

  const [reg] = await db
    .insert(registrations)
    .values({ ...data, gameId: game.id })
    .returning();
  return reg;
}

// Get stats for a given game
export async function getStatsForGame(slug) {
  const [game] = await db.select().from(games).where(eq(games.slug, slug));
  if (!game) throw new Error("Game not found");

  const [res] = await db
    .select({ count: count() })
    .from(registrations)
    .where(eq(registrations.gameId, game.id));
  return Number(res.count);
}