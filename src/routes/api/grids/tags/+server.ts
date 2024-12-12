import { maybe } from "$lib/utils/maybe";
import { GridService, ReadGridTagsSchema } from "$lib/server/grid-service";
import { json, type RequestEvent } from "@sveltejs/kit";

/** GET tags used by the grids from the server */
export async function GET(event: RequestEvent) {
	const service = new GridService();

	const dto = ReadGridTagsSchema.parse({
		page: maybe(event.url.searchParams.get("page")),
		page_size: maybe(event.url.searchParams.get("page_size")),
	});

	const result = await service.readTags(dto);

	return json(result);
}
