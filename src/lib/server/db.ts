import postgres from "postgres";
import { env } from "./env";

/** Postgres Database Connection */
export function db() {
	if (!env.DATABASE_HOST) throw new Error("`DATABASE_HOST` environment variable required for postgres");
	return postgres(env.DATABASE_HOST);
}

export type Db = ReturnType<typeof db>;
