import postgres from "postgres";
import { env } from "./env";

if (!env.DATABASE_HOST) throw new Error("`DATABASE_HOST` environment variable required for postgres");

/** Postgres Database Connection */
export const sql = postgres(env.DATABASE_HOST);
