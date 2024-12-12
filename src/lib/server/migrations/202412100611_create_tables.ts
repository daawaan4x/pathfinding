import { sql } from "../sql";

export async function up() {
	await sql`CREATE EXTENSION "pgcrypto"`;

	await sql`
		CREATE TABLE "grids" (
			"id" uuid NOT NULL DEFAULT gen_random_uuid(),
			"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
			"updated_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
		
			"name" VARCHAR(30) NOT NULL,
			"tags" VARCHAR(30)[] NOT NULL,
			"size" INT NOT NULL,
			"data" INT[] NOT NULL,

			CONSTRAINT "grids_pk" PRIMARY KEY ("id")
		);
	`;
}

export async function down() {
	await sql`DROP TABLE IF EXISTS "grids"`;

	await sql`DROP EXTENSION IF EXISTS "pgcrypto"`;
}
