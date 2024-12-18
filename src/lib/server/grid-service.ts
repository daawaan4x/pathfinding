import {
	CreateGridSchema,
	DeleteGridSchema,
	GridListSchema,
	GridRecordSchema,
	ReadGridTagsSchema,
	ReadManyGridSchema,
	ReadOneGridSchema,
	UpdateGridSchema,
	type CreateGridDto,
	type DeleteGridDto,
	type GridList,
	type GridRecord,
	type ReadGridTagsDto,
	type ReadManyGridDto,
	type ReadOneGridDto,
	type UpdateGridDto,
} from "$lib/types/grid-service";
import { shiftFromUTC } from "$lib/utils/shift-from-utc";
import { sql } from "./sql";

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

		const where_name = name ? sql` OR "name" LIKE ${"%" + name + "%"}` : sql``;
		const where_size = size ? sql` OR ${size[0]} <= "size" AND "size" <= ${size[1]}` : sql``;
		const where_tags = tags ? sql` OR ARRAY_TO_STRING("tags", ',') LIKE  ${"%" + tags.join(",") + "%"}` : sql``;
		const where = name || size || tags ? sql`WHERE FALSE${where_name}${where_size}${where_tags}` : sql``;

		const [data, count] = await sql.begin(async (sql) => {
			const data: GridList["data"] = await sql`
				SELECT ${sql(GridListSchema.shape.data.element.keyof().options)} 
				FROM "grids" 
				${where}
				ORDER BY "updated_at" DESC
				LIMIT ${page_size}
				OFFSET ${(page - 1) * page_size}
			`;

			const count: [{ count: number }] = await sql`
				SELECT COUNT(id)
				FROM "grids"
				${where}
			`;

			return [data, Number(count[0].count)];
		});

		const result: GridList = {
			data,
			count,
			page,
			page_size,
			page_last: Math.ceil(count / page_size),
		};

		shiftFromUTC(result);
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
		shiftFromUTC(result);
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
		shiftFromUTC(result);
		return result[0].tags;
	}

	/** Updates a grid record in the database */
	async update(dto: UpdateGridDto) {
		const { id, data } = UpdateGridSchema.parse(dto);
		const columns = Object.keys(data) as (keyof typeof data)[];
		const result: GridRecord[] = await sql`
			UPDATE grids 
			SET ${sql({ ...data, updated_at: sql`CURRENT_TIMESTAMP` }, ...columns, "updated_at")}
			WHERE "id" = ${id}
			RETURNING ${sql(GridRecordSchema.keyof().options)}
		`;
		shiftFromUTC(result);
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
		shiftFromUTC(result);
		return result[0];
	}
}
