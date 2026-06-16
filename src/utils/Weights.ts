/**
 * Named font-weight constants.
 * Usage: fontWeight: Weights.bold
 * Change one value here → updates every component that references it.
 */
export const Weights = {
  regular:   '400',
  medium:    '500',
  semibold:  '600',
  bold:      '700',
  extrabold: '800',

  // Direct numeric aliases for destructured usage
  weight400: '400',
  weight500: '500',
  weight600: '600',
  weight700: '700',
  weight800: '800',
} as const;

export type Weight = (typeof Weights)[keyof typeof Weights];
