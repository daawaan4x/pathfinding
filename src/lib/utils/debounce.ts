export function debounce(cb: () => void, t: number) {
	let timer: NodeJS.Timeout;
	return () => {
		clearTimeout(timer);
		timer = setTimeout(() => cb(), t);
	};
}
