// See https://kit.svelte.dev/docs/types#app

import type { ZodIssue } from "zod";

// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message: string;
			error?: string;
			_zod_issues_?: ZodIssue[];
		}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
