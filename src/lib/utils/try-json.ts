export function tryJSON(value: string) {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return JSON.parse(value);
	} catch (_) {
		return undefined;
	}
}
