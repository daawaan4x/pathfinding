/**
 * Helper function for coalescing "falsy" values to undefined
 */
export function maybe(value: unknown) {
	// null
	if (value === null) return undefined;

	// empty array
	if (Array.isArray(value) && value.length == 0) return undefined;

	// empty string or whitespace string
	if (typeof value === "string" && value.trim() === "") return undefined;

	// empty object
	if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) return undefined;

	// NaN
	if (Number.isNaN(value)) return undefined;

	return value;
}
