import { PUBLIC_LITE_VERSION } from "$env/static/public";

export function islite() {
	return !!PUBLIC_LITE_VERSION;
}
