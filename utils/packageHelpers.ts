import type { PackageResponse } from "../types/general";

export interface DisplayPackage {
  id: number | string;
  package_name: string;
  location: string;
  category: string;
  description?: string;
  inclusions?: string;
  exclusions?: string;
  terms?: string;
  date_from?: string;
  date_to?: string;
  status?: number;
  price?: number | string;
  currency?: string;
  poster?: string;
  picture1?: string;
  picture2?: string;
  picture3?: string;
  picture4?: string;
  banner?: string;
}

export function toTitleCase(str = ""): string {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function mapPackage(pkg: PackageResponse): DisplayPackage {
  return {
    id: pkg.id,
    package_name: pkg.package_name,
    location: toTitleCase(pkg.location || pkg.country_code || ""),
    category: toTitleCase(pkg.category || ""),
    description: pkg.description,
    inclusions: pkg.inclusions,
    exclusions: pkg.exclusions,
    terms: pkg.terms,
    date_from: pkg.date_from,
    date_to: pkg.date_to,
    status: pkg.status,
    price: pkg.price,
    currency: pkg.currency,
    poster: pkg.poster,
    picture1: pkg.picture1,
    picture2: pkg.picture2,
    picture3: pkg.picture3,
    picture4: pkg.picture4,
    banner: pkg.banner,
  };
}

export function inferFlightIncluded(pkg: { inclusions?: string }): boolean {
  return /flight/i.test(pkg.inclusions || "");
}

export function formatPackageDate(d?: string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function parseInclusionList(text?: string): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
