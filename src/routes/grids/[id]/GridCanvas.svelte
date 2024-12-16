<script lang="ts">
	import { GridNode, type GridRecord } from "$lib/types/grid-service";
	import { drawGrid, mouseToCell, rescaleCanvas, type PointerType } from "./GridCanvasHelpers";

	let {
		data = $bindable(undefined),
		pointer = $bindable(undefined),
	}: {
		data?: GridRecord;
		pointer?: PointerType;
	} = $props();

	let mousexy: [number, number] | undefined = $state(undefined);
	let mousedown: boolean = $state(false);

	function setup(canvas: HTMLCanvasElement) {
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Cannot get '2d' canvas context");

		rescaleCanvas({ ctx });

		// Update mousexy & mousedown on mouse movements
		document.addEventListener("mouseup", () => (mousedown = false));
		document.addEventListener("mousedown", () => (mousedown = true));
		canvas.addEventListener("mouseleave", () => (mousexy = undefined));
		canvas.addEventListener("mousemove", (event) => {
			const rect = canvas.getBoundingClientRect();
			mousexy = [event.clientX - rect.left, event.clientY - rect.top];
		});

		// Edit Grid Data on click and hold
		canvas.addEventListener("click", () => editPointedCell());
		canvas.addEventListener("mousemove", () => {
			if (mousedown) editPointedCell()
		});

		requestAnimationFrame(function callback() {
			draw(ctx);
			requestAnimationFrame(callback);
		});

		// Alters the Cell at the current pointer position
		function editPointedCell() {
			if (!data || !mousexy || !pointer) return;

			const node = { pen: GridNode.block, eraser: GridNode.empty }[pointer];
			const [xi, yi] = mouseToCell({
				canvas_size: canvas.clientWidth,
				grid_size: data.size,
				mousexy,
			});

			data.data[xi + yi * data.size] = node;
		}
	}

	function draw(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

		if (!data) return;

		drawGrid({ ctx, grid: data, pointer, mousexy });
	}
</script>

<section class="rounded-md border shadow-sm">
	<canvas use:setup class="rounded-md {pointer ? 'cursor-pointer' : ''}" width="600" height="600"> </canvas>
</section>
