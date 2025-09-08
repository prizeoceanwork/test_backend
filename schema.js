import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

// Games table
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Registrations table
export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  videoWatched: boolean("video_watched").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


