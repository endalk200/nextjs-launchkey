/**
 * Parses OTLP exporter header env values of the form
 * `Key=Value,Key2=Value2` (for example
 * `Authorization=Bearer phc_xxx,X-Tenant=acme`) into a headers record.
 *
 * Values may themselves contain `=` (only the first `=` per pair is treated
 * as the key/value separator). Malformed pairs (no key or no `=`) are
 * skipped. Returns `undefined` when nothing usable is present so exporter
 * config can omit the `headers` key entirely.
 */
export function parseOtlpHeaders(
	raw: string | undefined,
): Record<string, string> | undefined {
	if (raw === undefined || raw.trim() === "") {
		return undefined;
	}

	const headers: Record<string, string> = {};

	for (const pair of raw.split(",")) {
		const separatorIndex = pair.indexOf("=");

		if (separatorIndex <= 0) {
			continue;
		}

		const key = pair.slice(0, separatorIndex).trim();
		const value = pair.slice(separatorIndex + 1).trim();

		if (key === "" || value === "") {
			continue;
		}

		headers[key] = value;
	}

	return Object.keys(headers).length > 0 ? headers : undefined;
}
