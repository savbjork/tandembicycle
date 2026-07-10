export const HUE_FAMILIES = ['mint', 'peach', 'lilac', 'butter', 'blush', 'coral'] as const;

export type HueFamily = (typeof HUE_FAMILIES)[number];

// Stable hash of the domain name → one of six sherbet families.
// Pure function of the name: both partners see identical colors with no
// persistence or sync. Char codes weighted by position so single-letter
// swaps ("Pets" vs "Sets") don't collide constantly.
export const domainHue = (name: string): HueFamily => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return HUE_FAMILIES[hash % HUE_FAMILIES.length];
};
