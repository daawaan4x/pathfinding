class BinaryNode<T> {
	constructor(public value: T) {}
	public left?: BinaryNode<T>;
	public right?: BinaryNode<T>;
}

/** A Binary-Tree based implementation of a Priority Queue  */
export class PriorityQueue<T> {
	private root?: BinaryNode<T>;

	constructor(private readonly comparator: (a: T, b: T) => number) {
		this.comparator = comparator;
	}

	/** Traverses the tree in a preorder manner */
	public preorder(callback: (value: T) => unknown) {
		_preorder(this.root);

		function _preorder(node: BinaryNode<T> | undefined) {
			if (!node) return;
			callback(node.value);
			_preorder(node.left);
			_preorder(node.right);
		}
	}

	/** Inserts the value in the priority queue */
	public insert(value: T) {
		this.root = this.insertnode(this.root, value);
	}

	private insertnode(node: BinaryNode<T> | undefined, value: T): BinaryNode<T> {
		if (!node) return new BinaryNode(value);
		if (this.comparator(value, node.value) < 0) node.left = this.insertnode(node.left, value);
		else node.right = this.insertnode(node.right, value);
		return node;
	}

	/** Removes the smallest value in the priority queue */
	public popmin(): T | undefined {
		if (!this.root) return undefined;
		const { minnode, parent } = this.findmin(this.root, undefined);
		if (!parent) this.root = minnode.right;
		else parent.left = minnode.right;
		return minnode.value;
	}

	private findmin(
		node: BinaryNode<T>,
		parent: BinaryNode<T> | undefined,
	): { minnode: BinaryNode<T>; parent?: BinaryNode<T> } {
		if (!node.left) return { minnode: node, parent };
		return this.findmin(node.left, node);
	}

	/** Finds the node that satisfies the predicate in a preorder manner */
	public find(predicate: (value: T) => boolean) {
		return _find(this.root);

		function _find(node: BinaryNode<T> | undefined): T | undefined {
			if (!node) return undefined;
			else if (predicate(node.value)) return node.value;
			else return _find(node.left) ?? _find(node.right);
		}
	}

	/** Checks if the queue is empty */
	isempty() {
		return !this.root;
	}
}
