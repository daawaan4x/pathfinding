class BinaryNode<T> {
	constructor(public value: T) {}
	public left?: BinaryNode<T>;
	public right?: BinaryNode<T>;
}

export class PriorityQueue<T> {
	private root?: BinaryNode<T>;

	constructor(private readonly comparator: (a: T, b: T) => number) {
		this.comparator = comparator;
	}

	public preorder(callback: (value: T) => unknown) {
		_preorder(this.root);

		function _preorder(node: BinaryNode<T> | undefined) {
			if (!node) return;
			callback(node.value);
			_preorder(node.left);
			_preorder(node.right);
		}
	}

	public insert(value: T) {
		this.root = this.insertnode(this.root, value);
	}

	private insertnode(node: BinaryNode<T> | undefined, value: T): BinaryNode<T> {
		if (!node) return new BinaryNode(value);
		if (this.comparator(value, node.value) < 0) node.left = this.insertnode(node.left, value);
		else node.right = this.insertnode(node.right, value);
		return node;
	}

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

	public find(predicate: (value: T) => boolean) {
		return _find(this.root);

		function _find(node: BinaryNode<T> | undefined): T | undefined {
			if (!node) return undefined;
			else if (predicate(node.value)) return node.value;
			else return _find(node.left) ?? _find(node.right);
		}
	}

	isempty() {
		return !this.root;
	}
}
