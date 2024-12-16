import { GridNode, type GridRecord } from "$lib/types/grid-service";

export type PointerType = "pen" | "eraser";

/**
 * Rescales the Canvas for High-Resolution Screens
 */
export function rescaleCanvas({ ctx }: { ctx: CanvasRenderingContext2D }) {
	const canvas = ctx.canvas;

	// Get the DPR and size of the canvas
	const dpr = window.devicePixelRatio;
	const width = canvas.width;
	const height = canvas.height;

	// Set the "actual" size of the canvas
	canvas.width = width * dpr;
	canvas.height = height * dpr;

	// Scale the context to ensure correct drawing operations
	ctx.scale(dpr, dpr);

	// Set the "drawn" size of the canvas
	canvas.style.width = `${width}px`;
	canvas.style.height = `${height}px`;
}

/**
 * Maps the current mouse position to the cell index
 */
export function mouseToCell({
	canvas_size,
	grid_size,
	mousexy,
}: {
	canvas_size: number;
	grid_size: number;
	mousexy: [number, number];
}) {
	const mousexy_normal = [mousexy[0] / canvas_size, mousexy[1] / canvas_size];
	const cell_index = [Math.floor(mousexy_normal[0] * grid_size), Math.floor(mousexy_normal[1] * grid_size)];
	return cell_index;
}

/**
 * Draws the grid lines
 */
export function drawGridLines({ ctx, size }: { ctx: CanvasRenderingContext2D; size: number }) {
	const canvas_size = ctx.canvas.clientWidth;
	const cell_size = canvas_size / size;

	ctx.strokeStyle = "rgb(208, 208, 211)";
	ctx.lineWidth = 1;

	ctx.beginPath();

	// draw vertical lines left-to-right
	for (let x = cell_size; x < canvas_size; x += cell_size) {
		ctx.moveTo(x, 0);
		ctx.lineTo(x, canvas_size);
	}

	// draw horizontal lines top-to-bottom
	for (let y = cell_size; y < canvas_size; y += cell_size) {
		ctx.moveTo(0, y);
		ctx.lineTo(canvas_size, y);
	}

	ctx.stroke();
}

/**
 * Draws the grid cells
 */
export function drawGridCells({ ctx, data, size }: { ctx: CanvasRenderingContext2D; data: GridNode[]; size: number }) {
	const canvas_size = ctx.canvas.clientWidth;
	const cell_size = canvas_size / size;

	for (let xi = 0; xi < size; xi++) {
		for (let yi = 0; yi < size; yi++) {
			const node = data[xi + yi * size];
			if (node == GridNode.block) {
				ctx.fillStyle = "rgb(208, 208, 211)";
				ctx.fillRect(xi * cell_size, yi * cell_size, cell_size, cell_size);
			}
		}
	}
}

/**
 * Draws the pointer
 */
export function drawPointer({
	ctx,
	grid_size,
	pointer,
	mousexy,
}: {
	ctx: CanvasRenderingContext2D;
	grid_size: number;
	pointer?: PointerType;
	mousexy: [number, number];
}) {
	const canvas_size = ctx.canvas.clientWidth;
	const cell_size = canvas_size / grid_size;
	const [xi, yi] = mouseToCell({ canvas_size, grid_size, mousexy });
	const x = xi * cell_size;
	const y = yi * cell_size;

	ctx.lineWidth = cell_size * 0.15;
	ctx.lineCap = "round";

	// Draw + sign
	if (pointer == "pen") {
		ctx.strokeStyle = "rgb(138, 237, 195)";
		ctx.beginPath();
		ctx.moveTo(x + cell_size * 0.5, y + cell_size * 0.25);
		ctx.lineTo(x + cell_size * 0.5, y + cell_size * 0.75);
		ctx.moveTo(x + cell_size * 0.25, y + cell_size * 0.5);
		ctx.lineTo(x + cell_size * 0.75, y + cell_size * 0.5);
		ctx.stroke();
	}

	// Draw x sign
	if (pointer == "eraser") {
		ctx.strokeStyle = "rgb(251, 113, 133)";
		ctx.beginPath();
		ctx.moveTo(x + cell_size * 0.25, y + cell_size * 0.25);
		ctx.lineTo(x + cell_size * 0.75, y + cell_size * 0.75);
		ctx.moveTo(x + cell_size * 0.25, y + cell_size * 0.75);
		ctx.lineTo(x + cell_size * 0.75, y + cell_size * 0.25);
		ctx.stroke();
	}
}

/**
 * Draws the grid
 */
export function drawGrid({
	ctx,
	grid,
	pointer,
	mousexy,
}: {
	ctx: CanvasRenderingContext2D;
	grid: GridRecord;
	pointer?: PointerType;
	mousexy?: [number, number];
}) {
	drawGridCells({ ctx, data: grid.data, size: grid.size });
	drawGridLines({ ctx, size: grid.size });

	if (mousexy)
		drawPointer({
			ctx,
			grid_size: grid.size,
			pointer,
			mousexy,
		});
}
