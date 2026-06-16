import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

/** Horizontal padding for screen body */
export const hPad = (pct = 5) => wp(pct);
/** Rounded "16–20" style radius */
export const rad = {sm: 10, md: 14, lg: 18, xl: 24, full: 9999} as const;
/** Minimum touch / button height */
export const touch = {minH: 52, minHButton: 56} as const;
export const space = {xs: hp(0.5), sm: hp(1), md: hp(1.5), lg: hp(2), xl: hp(3)} as const;
export const font = {
  hero: hp(3.2),
  title: hp(2.6),
  subtitle: hp(1.9),
  body: hp(1.7),
  caption: hp(1.4),
} as const;
export {wp, hp};
