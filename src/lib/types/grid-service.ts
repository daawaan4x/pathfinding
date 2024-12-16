import { z } from "zod";

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
		tags: z.string().max(30).array().max(10).default([]),
		size: z.number().int().min(1).max(30),
		data: GridNodeEnum.array().max(900),
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
				tags: z.string().max(30).array().max(10),
				size: z.number().int().min(1).max(30),
				data: GridNodeEnum.array().max(900),
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
export const GridListSchema = z.object({
	page: z.number(),
	page_size: z.number(),
	page_last: z.number(),
	count: z.number(),
	data: z
		.object({
			id: z.string().uuid(),
			name: z.string(),
			tags: z.string().array(),
			size: z.number(),
			created_at: z.date(),
			updated_at: z.date(),
		})
		.array(),
});

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
