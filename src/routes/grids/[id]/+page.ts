import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
	return {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
		id: params.id,
	};
};
