import { z } from "zod";
import { config } from "dotenv";

config();

const EnvSchema = z.object({
	DATABASE_HOST: z.string(),
});

/** Typed environment variables */
export const env = EnvSchema.parse(process.env);
