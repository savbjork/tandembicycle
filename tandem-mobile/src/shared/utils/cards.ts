/**
 * Card name is the identity key throughout the app (list keys, lookups,
 * reassignment), so the card list must never contain two entries with the
 * same name. Keeps the first occurrence — loads are ordered by created_at,
 * so the original row wins over any accidental duplicate.
 */
export const dedupeByName = <T extends { name: string }>(items: T[]): T[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });
};
