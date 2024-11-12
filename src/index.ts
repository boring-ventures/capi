import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is not defined");
    return;
  }

  const client = postgres(databaseUrl, { prepare: false });
  const db = drizzle(client);

  console.log("db: ", db);
}

main();
