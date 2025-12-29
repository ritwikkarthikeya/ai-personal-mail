import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL missing");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL (LOCAL) connected");
});
