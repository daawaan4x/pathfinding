import { maybe } from "$lib/utils/maybe";
import { CreateGridSchema, GridService, ReadManyGridSchema } from "$lib/server/grid-service";
import { json, type RequestEvent } from "@sveltejs/kit";

/** GET list of grids from the server */
export async function GET(event: RequestEvent) {
	const service = new GridService();

	const dto = ReadManyGridSchema.parse({
		page: maybe(event.url.searchParams.get("page")),
		page_size: maybe(event.url.searchParams.get("page_size")),
		name: maybe(event.url.searchParams.get("name")),
		size: maybe(event.url.searchParams.getAll("size")),
		tags: maybe(event.url.searchParams.getAll("tags")),
	});

	const result = await service.readMany(dto);

	return json(result);
}

/** POST a new grid into the server */
export async function POST(event: RequestEvent) {
	const service = new GridService();
	const dto = CreateGridSchema.parse(await event.request.json());
	const result = service.create(dto);
	return json(result);
}
