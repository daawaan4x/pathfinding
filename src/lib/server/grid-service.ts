import { z } from "zod";
import { sql } from "./sql";

/** Represents the state of the node in the Grid */
export enum GridNode {
	empty = 0,
	block = 1,
}

/** Schema for the state of the node in the Grid */
export const GridNodeEnum = z.nativeEnum(GridNode);

/** Schema for the inputs for creating a grid */
export const CreateGridSchema = z
	.object({
		name: z.string().max(30),
		tags: z.string().max(30).array().default([]),
		size: z.number().int().min(1).max(1000),
		data: GridNodeEnum.array().max(1000),
	})
	.superRefine((value, ctx) => {
		if (value.size ** 2 != value.data.length) {
			ctx.addIssue({
				code: "custom",
				fatal: true,
				message: "Grid data and grid size does not match.",
			});
		}
	});

/** Type for the inputs for creating a grid */
export type CreateGridDto = z.input<typeof CreateGridSchema>;

/** Schema for the inputs for reading many grids */
export const ReadManyGridSchema = z.object({
	page: z.coerce.number().min(1).default(1),
	page_size: z.coerce.number().min(1).max(50).default(1),
	name: z.string().optional(),
	size: z.tuple([z.coerce.number(), z.coerce.number()]).optional(),
	tags: z.string().array().optional(),
});

/** Type for the inputs for reading many grids */
export type ReadManyGridDto = z.input<typeof ReadManyGridSchema>;

/** Schema for the inputs for reading one grid */
export const ReadOneGridSchema = z.object({
	id: z.string().uuid(),
});

/** Type for the inputs for reading one grid */
export type ReadOneGridDto = z.input<typeof ReadOneGridSchema>;

/** Schema for the inputs for reading grid tags */
export const ReadGridTagsSchema = z.object({
	page: z.coerce.number().min(1).default(1),
	page_size: z.coerce.number().min(1).max(50).default(1),
});

/** Type for the inputs for reading grid tags */
export type ReadGridTagsDto = z.input<typeof ReadGridTagsSchema>;

/** Schema for the inputs for updating one grid */
export const UpdateGridSchema = z
	.object({
		id: z.string().uuid(),
		data: z
			.object({
				name: z.string().max(30),
				tags: z.string().max(30).array(),
				size: z.number().int().min(1).max(1000),
				data: GridNodeEnum.array().max(1000),
			})
			.partial(),
	})
	.superRefine((value, ctx) => {
		const grid = value.data;
		if (!grid.size != !grid.data) {
			ctx.addIssue({
				code: "custom",
				fatal: true,
				message: "Both grid data and size must exist when updating either.",
			});
		}

		if (grid.size && grid.data) {
			if (grid.size ** 2 != grid.data.length) {
				ctx.addIssue({
					code: "custom",
					fatal: true,
					message: "Grid data and grid size does not match.",
				});
			}
		}
	});

/** Type for the inputs for updating one grid */
export type UpdateGridDto = z.input<typeof UpdateGridSchema>;

/** Schema for the inputs for deleting one grid */
export const DeleteGridSchema = z.object({
	id: z.string().uuid(),
});

/** Type for the inputs for deleting one grid */
export type DeleteGridDto = z.input<typeof DeleteGridSchema>;

/** Schema for the returned record of many grids */
export const GridListSchema = z
	.object({
		id: z.string().uuid(),
		name: z.string(),
		tags: z.string().array(),
		size: z.number(),
		created_at: z.date(),
		updated_at: z.date(),
	})
	.array();

/** Type for the returned record of many grids */
export type GridList = z.output<typeof GridListSchema>;

/** Schema for the returned record of one grid */
export const GridRecordSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	tags: z.string().array(),
	size: z.number(),
	data: GridNodeEnum.array(),
	created_at: z.date(),
	updated_at: z.date(),
});

/** Type for the returned record of one grid */
export type GridRecord = z.output<typeof GridRecordSchema>;

/** Service for performing CRUD on the stored grids in the database */
export class GridService {
	/** Inserts a grid record into the database */
	async create(dto: CreateGridDto) {
		const params = CreateGridSchema.parse(dto);
		const columns = Object.keys(params) as (keyof typeof params)[];
		const result: GridRecord[] = await sql`
			INSERT INTO "grids" ${sql(params, ...columns)}
			RETURNING "id", "name", "tags", "size", "data", "created_at", "updated_at"
		`;

		return result[0];
	}

	/** Selects and filters grid records from the database */
	async readMany(dto: ReadManyGridDto) {
		const params = ReadManyGridSchema.parse(dto);
		const { page, page_size, name, size } = params;
		const tags = [...new Set(params.tags)];

		const where_name = name ? sql` AND "name" LIKE ${"%" + name + "%"}` : sql``;
		const where_size = size ? sql` AND ${size[0]} <= "size" AND "size" <= ${size[1]}` : sql``;
		const where_tags = tags ? sql` AND "tags" @> ${tags}` : sql``;

		const result: GridList = await sql`
			SELECT ${sql(GridListSchema.element.keyof().options)} 
			FROM "grids" 
			WHERE TRUE${where_name}${where_size}${where_tags}
			LIMIT ${page_size}
			OFFSET ${(page - 1) * page_size}
		`;

		return result;
	}

	/** Reads a grid record from the database */
	async readOne(dto: ReadOneGridDto) {
		const { id } = ReadOneGridSchema.parse(dto);
		const result: GridRecord[] = await sql`
			SELECT ${sql(GridRecordSchema.keyof().options)} 
			FROM "grids"
			WHERE "id" = ${id}
		`;

		return result[0];
	}

	/** Reads current tags of grids from the database */
	async readTags(dto: ReadGridTagsDto) {
		const { page, page_size } = ReadGridTagsSchema.parse(dto);
		const result: { tags: string[] }[] = await sql`
			WITH "tags_cte" AS (
				SELECT DISTINCT unnest("tags") as "tag"
				FROM "grids"
				LIMIT ${page_size}
				OFFSET ${(page - 1) * page_size}
			)
			SELECT ARRAY_AGG("tag") as "tags"
			FROM "tags_cte"
		`;

		return result[0].tags;
	}

	/** Updates a grid record in the database */
	async update(dto: UpdateGridDto) {
		const params = UpdateGridSchema.parse(dto);
		const columns = Object.keys(params) as (keyof typeof params)[];
		const result: GridRecord[] = await sql`
			UPDATE grids 
			SET ${sql(params, ...columns)}
			WHERE "id" = ${params.id}
			RETURNING ${sql(GridRecordSchema.keyof().options)}
		`;

		return result[0];
	}

	/** Deletes a grid record in the database */
	async delete(dto: DeleteGridDto) {
		const { id } = DeleteGridSchema.parse(dto);
		const result: GridRecord[] = await sql`
			DELETE FROM "grids"
			WHERE "id" = ${id}
			RETURNING ${sql(GridRecordSchema.keyof().options)}
		`;

		return result[0];
	}
}
