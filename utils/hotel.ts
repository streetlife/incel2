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
