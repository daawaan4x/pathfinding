import { z } from "zod";
import { config } from "dotenv";

config();

const EnvSchema = z.object({
	DATABASE_HOST: z.string().optional(),
	PUBLIC_LITE_VERSION: z.coerce.boolean().optional(),
});

/** Typed environment variables */
export const env = EnvSchema.parse(process.env);
