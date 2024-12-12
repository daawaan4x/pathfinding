import { DeleteGridSchema, GridService, ReadOneGridSchema, UpdateGridSchema } from "$lib/server/grid-service";
import { json, type RequestEvent } from "@sveltejs/kit";

/** GET a grid and its data from the server */
export async function GET(event: RequestEvent) {
	const service = new GridService();
	const dto = ReadOneGridSchema.parse({ id: event.params.id });
	const result = await service.readOne(dto);
	return json(result);
}

/** PATCH a grid and its data in the server */
export async function PATCH(event: RequestEvent) {
	const service = new GridService();
	const dto = UpdateGridSchema.parse({
		id: event.params.id,
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		data: await event.request.json(),
	});
	const result = await service.readOne(dto);
	return json(result);
}

/** DELETE a grid in the server */
export async function DELETE(event: RequestEvent) {
	const service = new GridService();
	const dto = DeleteGridSchema.parse({ id: event.params.id });
	const result = await service.delete(dto);
	return json(result);
}
