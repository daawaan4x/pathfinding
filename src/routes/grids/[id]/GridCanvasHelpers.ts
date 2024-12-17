import type { AStar } from "$lib/pathfinding/a-star";
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
	ctx.save();

	const canvas_size = ctx.canvas.clientWidth;
	const cell_size = canvas_size / size;

	ctx.strokeStyle = "rgb(208, 208, 211)";
	ctx.lineWidth = 1;

	ctx.beginPath();

	// draw vertical lines left-to-right
	for (let x = cell_size; x < canvas_size - 1; x += cell_size) {
		ctx.moveTo(x, 0);
		ctx.lineTo(x, canvas_size);
	}

	// draw horizontal lines top-to-bottom
	for (let y = cell_size; y < canvas_size - 1; y += cell_size) {
		ctx.moveTo(0, y);
		ctx.lineTo(canvas_size, y);
	}

	ctx.stroke();

	ctx.restore();
}

/**
 * Draws the grid cells
 */
export function drawGridCells({ ctx, data, size }: { ctx: CanvasRenderingContext2D; data: GridNode[]; size: number }) {
	ctx.save();

	const canvas_size = ctx.canvas.clientWidth;
	const cell_size = canvas_size / size;
	const inset = cell_size * 0.25;

	for (let xi = 0; xi < size; xi++) {
		for (let yi = 0; yi < size; yi++) {
			const node = data[xi + yi * size];
			if (node == GridNode.block) {
				ctx.fillStyle = "rgb(208, 208, 211)";
				ctx.fillRect(xi * cell_size + inset, yi * cell_size + inset, cell_size - inset * 2, cell_size - inset * 2);
			}
		}
	}

	ctx.restore();
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
	ctx.save();

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

	ctx.restore();
}

export function drawMarkers({ ctx, grid_size }: { ctx: CanvasRenderingContext2D; grid_size: number }) {
	ctx.save();

	const canvas_size = ctx.canvas.clientWidth;
	const cell_size = canvas_size / grid_size;
	ctx.fillStyle = "rgb(60, 60, 62)";
	ctx.font = `bold ${cell_size / 2}px 'Arial'`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	// Draw Start
	ctx.fillText("S", cell_size * 0.5, cell_size * 0.5);

	// Draw Finish
	ctx.fillText("F", canvas_size - cell_size * 0.5, canvas_size - cell_size * 0.5);

	ctx.restore();
}

export function drawAStar({
	ctx,
	grid_size,
	astar,
}: {
	ctx: CanvasRenderingContext2D;
	grid_size: number;
	astar: AStar;
}) {
	ctx.save();
	const canvas_size = ctx.canvas.clientWidth;
	const cell_size = canvas_size / grid_size;

	// Open List
	ctx.fillStyle = "rgba(254, 240, 138, 0.25)";
	astar.openlist.preorder(({ point }) => {
		ctx.fillRect(point[0] * cell_size, point[1] * cell_size, cell_size, cell_size);
	});

	// Closed Set
	ctx.fillStyle = "rgba(165, 243, 252, 0.25)";
	for (const [x, y] of astar.closedset.values()) {
		ctx.fillRect(x * cell_size, y * cell_size, cell_size, cell_size);
	}

	path: {
		ctx.strokeStyle = "rgb(254, 240, 138)";
		if (astar.status == "no-solution") ctx.strokeStyle = "rgb(252, 165, 165)";
		if (astar.status == "finished") ctx.strokeStyle = "rgb(134, 239, 172)";

		ctx.lineWidth = cell_size * 0.2;
		ctx.lineCap = "round";
		const path = astar.currentpath();
		if (path.length == 0) break path;

		ctx.beginPath();
		ctx.moveTo(path[0][0] * cell_size + cell_size / 2, path[0][1] * cell_size + cell_size / 2);
		for (let i = 1; i < path.length; i++) {
			ctx.lineTo(path[i][0] * cell_size + cell_size / 2, path[i][1] * cell_size + cell_size / 2);
		}
		ctx.stroke();
	}

	ctx.restore();
}

/**
 * Draws the grid
 */
export function drawGrid({
	ctx,
	grid,
	pointer,
	mousexy,
	astar,
}: {
	ctx: CanvasRenderingContext2D;
	grid: GridRecord;
	pointer?: PointerType;
	mousexy?: [number, number];
	astar?: AStar;
}) {
	ctx.save();

	drawGridCells({ ctx, data: grid.data, size: grid.size });
	drawGridLines({ ctx, size: grid.size });

	drawMarkers({ ctx, grid_size: grid.size });

	if (astar) drawAStar({ ctx, grid_size: grid.size, astar });

	if (mousexy)
		drawPointer({
			ctx,
			grid_size: grid.size,
			pointer,
			mousexy,
		});

	ctx.restore();
}
