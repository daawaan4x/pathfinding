import { DateTime } from "luxon";

/**
 * Adjusts the `Date` values recursively in an object from UTC to Local timezone
 */
export function shiftFromUTC<T extends object>(object: T) {
	const keys = Object.keys(object);
	for (const key of keys) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
		const property: unknown = (object as any)[key];
		if (!property) continue;
		if (property && typeof property == "object") shiftFromUTC(property);
		if (!(property instanceof Date)) continue;

		const datetime = DateTime.fromJSDate(property);
		if (!datetime.isValid) continue;

		const converted = datetime.setZone("UTC", { keepLocalTime: true }).toLocal().toJSDate();

		// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
		(object as any)[key] = converted;
	}
}
