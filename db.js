import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not set in environment variables");
}else {
  console.log("POSTGRES_URL is set");
}

export const db = drizzle(pool);
