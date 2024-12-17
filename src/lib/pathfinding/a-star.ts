import { GridNode } from "$lib/types/grid-service";
import { PriorityQueue } from "./priority-queue";

type Point = readonly [number, number];

interface Node {
	point: Point;
	f: number;
	g: number;
	h: number;
	previous?: Node;
}

export class AStar {
	constructor(
		public readonly size: number,
		public readonly grid: GridNode[],
	) {
		if (size * size != grid.length) throw new Error("Provided size and grid data does not match.");

		this.end = [size - 1, size - 1];

		if (grid[0] == GridNode.empty)
			this.openlist.insert({
				point: this.start,
				f: this.heuristic(this.start, this.end),
				g: 0,
				h: this.heuristic(this.start, this.end),
			});
	}

	status: "no-solution" | "ongoing" | "finished" | undefined;
	start = [0, 0] as Point;
	end: Point;
	lastnode: Node | undefined;
	openlist = new PriorityQueue<Node>((a, b) => a.f - b.f);
	closedset = new Map<string, Point>();

	private serialize([x, y]: Point) {
		return `${x},${y}`;
	}

	private equals([ax, ay]: Point, [bx, by]: Point) {
		return ax == bx && ay == by;
	}

	private heuristic([ax, ay]: Point, [bx, by]: Point) {
		return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2); // Euclidean Distance
	}

	private isvacant([x, y]: Point) {
		if (x < 0 || this.size <= x) return false;
		if (y < 0 || this.size <= y) return false;
		if (this.grid[x + y * this.size] != GridNode.empty) return false;
		return true;
	}

	private neighbors([x, y]: Point): Point[] {
		const neighbors: Point[] = [
			[x + 0, y - 1], // up
			[x - 1, y - 1], // up-left
			[x - 1, y + 0], // left
			[x - 1, y + 1], // down-left
			[x + 0, y + 1], // down
			[x + 1, y + 1], // down-right
			[x + 1, y + 0], // right
			[x + 1, y - 1], // up-right
		];

		return neighbors.filter((point) => this.isvacant(point));
	}

	public currentpath() {
		const path: Point[] = [];
		let current = this.lastnode;
		while (current) {
			path.unshift(current.point);
			current = current.previous;
		}
		return path;
	}

	public step() {
		if (this.status == "finished" || this.status == "no-solution") return;

		if (this.openlist.isempty()) {
			this.status = "no-solution";
			return;
		}

		// Move best guess from open list to closed set (smallest accumulated and heuristic cost)
		const current = this.openlist.popmin()!;
		this.lastnode = current;
		this.closedset.set(this.serialize(current.point), current.point);

		// Check if goal has been reached
		if (this.equals(current.point, this.end)) {
			this.status = "finished";
			return;
		}

		// Process neighbors
		for (const neighbor_point of this.neighbors(current.point)) {
			// Skip if neighbor has been visited
			if (this.closedset.has(this.serialize(neighbor_point))) continue;

			// Compute neighbor node weights
			const g = current.g + this.heuristic(current.point, neighbor_point);
			const h = this.heuristic(neighbor_point, this.end);
			const neighbor_node: Node = {
				point: neighbor_point,
				previous: current,
				f: g + h,
				g,
				h,
			};

			// Check if node is already listed:
			// - add if not yet
			// - update accumulated cost if new discovered path has lower cost
			const node = this.openlist.find((node) => this.equals(node.point, neighbor_point));
			if (!node) this.openlist.insert(neighbor_node);
			else if (g < node.g) {
				node.g = g;
				node.h = h;
				node.f = g + h;
				node.previous = current;
			}
		}

		this.status = "ongoing";
	}
}
