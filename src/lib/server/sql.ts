import postgres from "postgres";
import { env } from "./env";

/** Postgres Database Connection */
export const sql = postgres(env.DATABASE_HOST);
