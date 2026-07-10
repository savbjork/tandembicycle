import type { HueFamily } from './domainHue';

// Complete literal class strings — NativeWind's JIT scans source text and
// cannot see dynamically-built class names.
export const HUE_CARD_CLASS: Record<HueFamily, string> = {
  mint: 'bg-sherbet-mint-fill border-sherbet-mint-line',
  peach: 'bg-sherbet-peach-fill border-sherbet-peach-line',
  lilac: 'bg-sherbet-lilac-fill border-sherbet-lilac-line',
  butter: 'bg-sherbet-butter-fill border-sherbet-butter-line',
  blush: 'bg-sherbet-blush-fill border-sherbet-blush-line',
  coral: 'bg-sherbet-coral-fill border-sherbet-coral-line',
};

export const HUE_TITLE_CLASS: Record<HueFamily, string> = {
  mint: 'text-sherbet-mint-title',
  peach: 'text-sherbet-peach-title',
  lilac: 'text-sherbet-lilac-title',
  butter: 'text-sherbet-butter-title',
  blush: 'text-sherbet-blush-title',
  coral: 'text-sherbet-coral-title',
};

export const HUE_SUB_CLASS: Record<HueFamily, string> = {
  mint: 'text-sherbet-mint-sub',
  peach: 'text-sherbet-peach-sub',
  lilac: 'text-sherbet-lilac-sub',
  butter: 'text-sherbet-butter-sub',
  blush: 'text-sherbet-blush-sub',
  coral: 'text-sherbet-coral-sub',
};

export const HUE_CHIP_CLASS: Record<HueFamily, string> = {
  mint: 'bg-sherbet-mint-fill text-sherbet-mint-title',
  peach: 'bg-sherbet-peach-fill text-sherbet-peach-title',
  lilac: 'bg-sherbet-lilac-fill text-sherbet-lilac-title',
  butter: 'bg-sherbet-butter-fill text-sherbet-butter-title',
  blush: 'bg-sherbet-blush-fill text-sherbet-blush-title',
  coral: 'bg-sherbet-coral-fill text-sherbet-coral-title',
};
