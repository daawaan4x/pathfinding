import { tryJSON } from "$lib/utils/try-json";
import type { Handle, HandleServerError } from "@sveltejs/kit";
import { ZodError } from "zod";

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	handle_errors: if (response.status == 500) {
		const body = await response.text();

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const json = tryJSON(body);
		if (!json) break handle_errors;

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		if (json._zod_issues_) {
			return new Response(body, {
				headers: response.headers,
				status: 400,
				statusText: response.statusText,
			});
		}
	}

	return response;
};

export const handleError: HandleServerError = ({ error, message }) => {
	if (error instanceof ZodError) {
		return {
			message,
			error: "Failed to validate input",
			_zod_issues_: error.issues,
		};
	}

	return {
		message,
	};
};
