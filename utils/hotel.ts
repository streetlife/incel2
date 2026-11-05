/**
 * Normalise a child's age for the backend hotel API.
 *
 * The frontend collects the real age (0 or 1 for infants), but the backend
 * only accepts child ages in the range 2–12. Any age below 2 is reported as
 * 2, and any age above 12 is reported as 12, keeping the value within the
 * accepted range without changing what the user selected in the UI.
 */
export function normalizeChildAge(age: number | null | undefined): number {
  const n = Number(age);
  if (!Number.isFinite(n)) return 2;
  return Math.min(12, Math.max(2, n));
}

/* -------------------------------------------------------------------------- */
/* Hotel cancellation policy & pay-at-hotel fee normalisation                 */
/* -------------------------------------------------------------------------- */

export interface PayAtHotelFee {
  amount: string;
  currency: string;
  description: string;
}

/** Normalise a field name so lookups work for camelCase, PascalCase & XML attrs. */
export function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Case/format-insensitive field lookup. Also checks the `@attributes` object
 * produced by XML-to-JSON conversion.
 */
export function pickField(obj: any, names: string[]): string {
  if (!obj || typeof obj !== "object") return "";
  const wanted = names.map(normalizeKey);
  const sources = [
    obj,
    obj["@attributes"],
    obj._attributes,
    obj.attributes,
  ].filter((source) => source && typeof source === "object");

  for (const source of sources) {
    for (const [key, value] of Object.entries(
      source as Record<string, unknown>,
    )) {
      if (!wanted.includes(normalizeKey(key))) continue;
      if (value === null || value === undefined) continue;
      // Container values (arrays/nested objects) are handled separately.
      if (typeof value === "object") continue;
      const text = String(value).trim();
      if (text !== "") return text;
    }
  }
  return "";
}

export function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  return value === null || value === undefined ? [] : [value as T];
}

export function unescapeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&amp;/gi, "&");
}

export function stripXmlTags(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** Parse simple XML elements' attributes into plain objects. */
export function parseXmlAttributes(
  xml: string,
  tags: string[],
): Record<string, string>[] {
  const results: Record<string, string>[] = [];
  const tagPattern = new RegExp(`<(${tags.join("|")})\\b([^>]*)>`, "gi");
  let tagMatch: RegExpExecArray | null;

  while ((tagMatch = tagPattern.exec(xml))) {
    const attrs: Record<string, string> = {};
    const attrPattern = /([\w:.-]+)\s*=\s*"([^"]*)"/g;
    let attrMatch: RegExpExecArray | null;
    while ((attrMatch = attrPattern.exec(tagMatch[2]))) {
      attrs[attrMatch[1]] = attrMatch[2];
    }
    if (Object.keys(attrs).length > 0) results.push(attrs);
  }

  return results;
}

/** Read the text content of the first matching XML element. */
export function xmlText(xml: string, tags: string[]): string {
  for (const tag of tags) {
    const match = xml.match(
      new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"),
    );
    if (match) {
      const text = stripXmlTags(match[1]);
      if (text) return text;
    }
  }
  return "";
}

function humanizeAmountType(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .trim();
}

/** Coerce a pay-at-hotel fee container (object, array or XML/JSON string) into entries. */
function coerceFeeEntries(raw: any): any[] {
  if (typeof raw === "string") {
    const text = unescapeXmlEntities(raw).trim();
    if (text.startsWith("{") || text.startsWith("[")) {
      try {
        raw = JSON.parse(text);
      } catch {
        // Fall through to the XML parser.
      }
    }
    if (typeof raw === "string") {
      return parseXmlAttributes(text, ["Fee", "PayAtHotelFee"]);
    }
  }

  if (Array.isArray(raw)) return raw;

  if (raw && typeof raw === "object") {
    for (const [key, value] of Object.entries(raw)) {
      if (
        /^(fee|fees|payathotelfee|payathotelfees|hotelfee|hotelfees)$/i.test(
          normalizeKey(key),
        )
      ) {
        return coerceFeeEntries(value);
      }
    }
    if (pickField(raw, ["amount", "feeAmount"])) return [raw];
  }

  return [];
}

/** Find the pay-at-hotel fees value inside a hotel/room/cancellation-policy object. */
function findFeeContainer(source: any): any {
  if (typeof source === "string" || Array.isArray(source)) return source;
  if (!source || typeof source !== "object") return null;

  for (const [key, value] of Object.entries(source)) {
    if (
      /^(fee|fees|payathotelfee|payathotelfees|hotelfee|hotelfees)$/i.test(
        normalizeKey(key),
      )
    ) {
      return value;
    }
  }

  // New search API nests fees under `cancellation_policy`.
  const nestedPolicy =
    source.cancellation_policy ??
    source.cancellationPolicy ??
    source.CancellationPolicy;
  if (nestedPolicy && typeof nestedPolicy === "object") {
    const nested = findFeeContainer(nestedPolicy);
    if (nested !== null && nested !== undefined) return nested;
  }

  return null;
}

/**
 * Extract the fees payable directly to the hotel at check-in.
 *
 * Supports the new search shape
 * `cancellation_policy.pay_at_hotel_fees.Fee["@attributes"]`, legacy
 * `hotelFees` arrays, parsed objects and raw XML/JSON strings.
 */
export function extractPayAtHotelFees(source: any): PayAtHotelFee[] {
  if (source === null || source === undefined || source === "") return [];

  const container = findFeeContainer(source);
  if (container === null || container === undefined || container === "") {
    return [];
  }

  const fees: PayAtHotelFee[] = [];

  for (const entry of coerceFeeEntries(container)) {
    const amount = pickField(entry, ["amount", "feeAmount", "value"]);
    if (!amount) continue;

    let description =
      pickField(entry, ["description", "type", "name"]) || "Hotel fee";
    const amountType = pickField(entry, [
      "amountType",
      "amounttype",
      "chargeType",
    ]);
    if (amountType && !/^amount$/i.test(amountType)) {
      description += ` (${humanizeAmountType(amountType)})`;
    }

    fees.push({
      amount,
      currency: pickField(entry, ["currency", "currencyCode"]),
      description,
    });
  }

  return fees;
}

/** Find the terms-and-conditions value inside a hotel/room/cancellation-policy object. */
function findTermsValue(source: any): any {
  if (!source || typeof source !== "object") return null;
  for (const [key, value] of Object.entries(source)) {
    if (
      ["termsandconditions", "terms"].includes(normalizeKey(key)) &&
      value !== null &&
      value !== undefined &&
      value !== ""
    ) {
      return value;
    }
  }
  return null;
}

function termsValueToString(raw: any): string {
  if (raw === null || raw === undefined) return "";
  if (typeof raw === "string") return raw.trim();
  if (Array.isArray(raw)) {
    return raw.map(termsValueToString).filter(Boolean).join("");
  }
  if (typeof raw === "object") {
    return termsValueToString(
      (raw as any).text ??
        (raw as any).Text ??
        (raw as any).description ??
        (raw as any).Description ??
        (raw as any).value ??
        (raw as any)["#text"] ??
        (raw as any)._text ??
        "",
    );
  }
  return "";
}

/**
 * Extract room terms & conditions from any of the API shapes:
 * `terms`, `terms_and_conditions`, or the new nested
 * `cancellation_policy.terms_and_conditions`.
 */
export function extractTermsAndConditions(source: any): string {
  if (!source) return "";

  if (typeof source === "string") return source.trim();

  if (source.room) {
    const fromRoom = extractTermsAndConditions(source.room);
    if (fromRoom) return fromRoom;
  }

  const direct = termsValueToString(findTermsValue(source));
  if (direct) return direct;

  const cancellationPolicy =
    source.cancellation_policy ??
    source.cancellationPolicy ??
    source.CancellationPolicy;
  if (cancellationPolicy) {
    return termsValueToString(findTermsValue(cancellationPolicy));
  }

  return "";
}

/**
 * Unwrap the actual refundable/till-date policy from the API shapes:
 *   { Refundable: "Yes", TillDate: "..." }
 *   { policy: { Refundable: "Yes", TillDate: "..." }, ... }
 */
export function unwrapCancellationPolicy(raw: any): Record<string, any> | null {
  if (!raw) return null;

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{")) {
      try {
        return unwrapCancellationPolicy(JSON.parse(trimmed));
      } catch {
        return null;
      }
    }
    return null;
  }

  if (typeof raw !== "object") return null;

  const nested = (raw as any).policy ?? (raw as any).Policy;
  if (nested && typeof nested === "object") {
    return unwrapCancellationPolicy(nested) ?? (nested as Record<string, any>);
  }

  return raw as Record<string, any>;
}

/**
 * Convert a cancellation policy (flat or wrapped) into display text.
 * Returns "" when no usable policy is present.
 */
export function cancellationPolicyToText(raw: any): string {
  if (raw === null || raw === undefined) return "";

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.toLowerCase() === "see cancellation policy") {
      return "";
    }
    if (trimmed.startsWith("{")) {
      try {
        return cancellationPolicyToText(JSON.parse(trimmed));
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }

  if (typeof raw !== "object") return "";

  // Some responses use `{ policy: "Free cancellation" }`.
  const nestedPolicy = (raw as any).policy ?? (raw as any).Policy;
  if (typeof nestedPolicy === "string" && nestedPolicy.trim()) {
    return cancellationPolicyToText(nestedPolicy);
  }

  const policy = unwrapCancellationPolicy(raw);
  if (!policy) return "";

  const refundable = pickField(policy, [
    "refundable",
    "Refundable",
  ]).toLowerCase();
  const tillDate = pickField(policy, ["tillDate", "TillDate", "till_date"]);

  if (refundable === "no" || refundable === "false") {
    return "Non-refundable";
  }
  if (refundable === "yes" || refundable === "true") {
    return tillDate ? `Free cancellation until ${tillDate}` : "Free cancellation";
  }

  return "";
}
