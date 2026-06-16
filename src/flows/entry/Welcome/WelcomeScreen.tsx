/**
 * WelcomeScreen — pixel-perfect Figma match with Reanimated floating animations.
 *
 * Assets used (downloaded from Figma API):
 *   assets/images/logo_circle.png     — orange 124×124 circle with origami bird
 *   assets/images/avatar1/2/3.png     — social proof real face avatars
 *
 * Figma absolute positions (relative to hero frame x=6765, y=-1184):
 *   Ellipse 97 (blob):     x=-154  y=-81   w=550.5 h=487.1  fill=#E8613A
 *     → blob center: (121.2, 162.9), semi-axes rx=275.3 ry=243.5
 *     → blob bottom (max-y):  406.4  ← set HERO_H to this, not 381
 *     → at y=381: blob is still 244px wide → hard cut visible
 *     → at y=406: blob tapers to ~33px wide → smooth arch visible ✓
 *   logo_circle PNG:       left=113  top=226  (20px shadow pad → PNG is 164×164)
 *     → orange circle appears at frame x=133, y=242
 *   Stellenbosch card:     x=25    y=96
 *   UCT card:              x=203   y=121
 *   94% Match badge:       x=30    y=211
 *   247 universities:      x=243   y=213
 *   "Match My Uni" title:  x=16    y=413  (7px below blob bottom 406)
 *   Arrow (102×12):        x=144   y=458  → left-aligned under title
 *   Tagline:               x=16    y=478
 */

import React, {useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, {Path, Circle, Polygon, Ellipse as SvgEllipse, Defs, LinearGradient as SvgGradient, Stop} from 'react-native-svg';
import {colors} from '../../../utils/colors';
import {en} from '../../../utils/strings/en';
import {PrimaryButton} from '../../../components/PrimaryButton';

const {width: SW} = Dimensions.get('window');

// Scale factor so layout is proportional on all screen widths (designed for 390pt)
const SCALE = SW / 390;
const s = (px: number) => Math.round(px * SCALE);

type Props = {
  onGetStarted: () => void;
  onLogIn: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
};

/**
 * Brand arrow — exact Figma Frame 121075798 102×12:
 *   Ellipse 101  10×10  fill=#E8613A
 *   Rect 2800    81×3   fill=#E8613A
 *   Polygon arrow       fill=#E8613A
 */
function BrandArrow() {
  return (
    <Svg width={s(102)} height={s(12)} viewBox="0 0 102 12">
      <Circle cx={5} cy={6} r={5} fill={colors.primary} />
      <Path d="M9 4.5 H91 V7.5 H9 Z" fill={colors.primary} />
      <Polygon points="89,0 102,6 89,12" fill={colors.primary} />
    </Svg>
  );
}

// ─── Floating animation hook ──────────────────────────────────────────────────
// Starts at +amp (slightly below rest position) and animates to -amp (above),
// creating a symmetric float of 2×amp total range — much more visible than 0→amp.
function useFloat(amp: number, dur: number, delay = 0) {
  const y = useSharedValue(amp);
  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(
        withTiming(-amp, {duration: dur, easing: Easing.inOut(Easing.sin)}),
        -1,
        true, // reverse: -amp → +amp → -amp forever (gentle bob)
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return useAnimatedStyle(() => ({transform: [{translateY: y.value}]}));
}

export function WelcomeScreen({onGetStarted, onLogIn, onOpenTerms, onOpenPrivacy}: Props) {
  // Tuned: slightly smaller travel, slightly slower period
  const animStellCard = useFloat(12, 2200,  300);
  const animUCTCard   = useFloat(9,  2600,  700);
  const animBadge94   = useFloat(14, 2000,  150);
  const animBadge247  = useFloat(10,  2400,  500);

  const HERO_H = s(406); // Figma blob bottom = y=406.4 → show full arch, not cut at 381

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      bounces={false}
      showsVerticalScrollIndicator={false}>

      {/* ── Hero frame (Frame 121075747: 390×381) ─────────────────────── */}
      <View style={[styles.hero, {height: HERO_H}]}>

        {/* Orange blob — SVG <Ellipse> gives a perfect mathematical oval:
              no flat middle section (unlike View+borderRadius which is a "stadium"),
              so the bottom arch is a smooth continuous curve.
              viewBox=0,0,390,406 matches the hero frame exactly.
              cx=84.5 → right edge at y=149: x=360 (30px cream on right)
              cy=149,  ry=230 → bottom at y=379 (27px cream below within hero h=406) */}
        <Svg
          width={SW}
          height={s(406)}
          viewBox={`0 0 390 406`}
          style={styles.blobSvg}>
          <Defs>
            <SvgGradient id="blobGrad" x1="0.2" y1="0.1" x2="0.9" y2="0.9">
              <Stop offset="0" stopColor="#ED8060" />
              <Stop offset="0.5" stopColor={colors.primary} />
              <Stop offset="1" stopColor="#C44D2A" />
            </SvgGradient>
          </Defs>
          <SvgEllipse
            cx={84.5}
            cy={149}
            rx={275.5}
            ry={230}
            fill="url(#blobGrad)"
          />
        </Svg>

        {/* ── Stellenbosch Uni card  (x=25, y=96, 126×52) ── */}
        <Animated.View style={[styles.card, {left: s(25), top: s(96), minWidth: s(126)}, animStellCard]}>
          <Text style={styles.cardTitle}>Stellenbosch Uni</Text>
          <View style={styles.starsRow}>
            <Text style={styles.starsFilled}>★★★★</Text>
            <Text style={styles.starsEmpty}>☆</Text>
            <Text style={styles.starsScore}> 4.2</Text>
          </View>
        </Animated.View>

        {/* ── UCT card  (x=203, y=121, 166×51) ── */}
        <Animated.View style={[styles.card, {left: s(203), top: s(121), minWidth: s(166)}, animUCTCard]}>
          <Text style={styles.cardTitle} numberOfLines={1}>University of Cape Town</Text>
          <Text style={styles.cardSub}>Cape Town, SA 🇿🇦</Text>
        </Animated.View>

        {/* ── 94% Match badge (x=30, y=211, 99×34 #F3A525) ── */}
        <Animated.View style={[styles.badgeMatch, {left: s(30), top: s(211)}, animBadge94]}>
          <Text style={styles.badgeMatchT}>94% Match ✨</Text>
        </Animated.View>

        {/* ── 247 universities badge (x=243, y=213, 122×32 #FFFFFF) ── */}
        <Animated.View style={[styles.badge247, {left: s(243), top: s(213)}, animBadge247]}>
          <Text style={styles.badge247T}>🎓  247 universities</Text>
        </Animated.View>

      {/* ── Logo circle with bird (x=133, y=242, 124×124) — no float animation */}
        {/* PNG is 164×164 including 20px left/right shadow + 16px top shadow */}
        {/* left=133-20=113, top=242-16=226 → orange circle center at (195, 304) */}
        <View style={[styles.logoBg, {
          left: s(113),
          top:  s(226),
        }]}>
          <Image
            source={require('../../../../assets/images/logo_circle.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* ── Title area (Frame 121075774: y=413, h=88) ─────────────────── */}
      {/* Figma: padL=16, gap=8 between title/arrow/tagline */}
      <View style={styles.titleArea}>
        <Text style={styles.appName}>{en.appName}</Text>
        <BrandArrow />
        <Text style={styles.tagline}>{en.tagline}</Text>
      </View>

      {/* Flex spacer — grows to fill remaining space, pushing body to screen bottom (Figma layout) */}
      <View style={{flex: 1}} />

      {/* ── Body (Frame 121075612: 390×157, pad T8 R16 B0 L16) ─────────── */}
      <View style={styles.body}>
        {/* Social proof row — Frame 121075740 173×25 */}
        <View style={styles.proofRow}>
          <Image source={require('../../../../assets/images/avatar1.png')} style={[styles.av, {marginLeft: 0, zIndex: 3}]} />
          <Image source={require('../../../../assets/images/avatar2.png')} style={[styles.av, {marginLeft: -7, zIndex: 2}]} />
          <Image source={require('../../../../assets/images/avatar3.png')} style={[styles.av, {marginLeft: -7, zIndex: 1}]} />
          <Text style={styles.proofText}>{en.socialProof}</Text>
        </View>

        {/* CTA — Primary Button 358×54 r=1000 bg=#E8613A */}
        <PrimaryButton
          label={en.getStarted}
          onPress={onGetStarted}
          style={styles.cta}
        />

        {/* Login link */}
        <Pressable onPress={onLogIn} style={styles.loginRow} accessibilityRole="button">
          <Text style={styles.loginMuted}>Already have an account? </Text>
          <Text style={styles.loginLink}>{en.logIn}</Text>
        </Pressable>

        {/* Legal text — 12px/400 lh=16 ls=-0.39 color=#677899 */}
        <Text style={styles.legal}>
          {en.terms.prefix}{' '}
          <Text style={styles.legalBold} onPress={onOpenTerms}>{en.terms.tos}</Text>
          {' '}{en.terms.and}{' '}
          <Text style={styles.legalBold} onPress={onOpenPrivacy}>{en.terms.privacy}</Text>.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {flexGrow: 1, backgroundColor: colors.background},

  /* ── Hero ── */
  hero: {
    position: 'relative',
    // No overflow:hidden — blob's natural border-radius ends at y=406 (hero height),
    // so there is NO downward overflow. Removing clip allows the right edge
    // (blob extends only 6.5px beyond frame) to render naturally instead of
    // showing a straight vertical cut line.
    backgroundColor: colors.background,
  },

  /** Figma: Ellipse 97 551×487 #E8613A — overflows left & top */
  blobSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  /** White floating card — r=16, stroke=#F5F5F5 */
  card: {
    position: 'absolute',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: s(9),
    paddingHorizontal: s(12),
    borderWidth: 1.5,
    borderColor: '#F0EFED',
    shadowColor: 'rgba(0,0,0,0.10)',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  /** 14px/600 ls=-0.47 color=#1A1C29 */
  cardTitle: {fontSize: s(13), fontWeight: '600', color: colors.textPrimary, letterSpacing: -0.4},
  cardSub:   {fontSize: s(10), color: colors.textSecondary, marginTop: 1},
  starsRow:  {flexDirection: 'row', alignItems: 'center', marginTop: 2},
  starsFilled:{fontSize: s(10), color: '#F3A525'},
  starsEmpty: {fontSize: s(10), color: '#D4D0C8'},
  starsScore: {fontSize: s(10), color: colors.textSecondary},

  /** 94% Match — r=64 bg=#F3A525 stroke=#FBE9DE sw=1.6 */
  badgeMatch: {
    position: 'absolute',
    backgroundColor: colors.yellowBadge,
    borderRadius: 64,
    paddingVertical: s(7),
    paddingHorizontal: s(10),
    borderWidth: 1.6,
    borderColor: '#FBE9DE',
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  /** 13.6px/600 ls=-0.45 color=#FBF7F3 */
  badgeMatchT: {fontSize: s(13), fontWeight: '600', letterSpacing: -0.45, color: colors.background},

  /** 247 univ — r=62 bg=#FFFFFF stroke=#FAFAFA */
  badge247: {
    position: 'absolute',
    backgroundColor: colors.white,
    borderRadius: 62,
    paddingVertical: s(7),
    paddingHorizontal: s(11),
    borderWidth: 1.5,
    borderColor: '#F0EFED',
    shadowColor: 'rgba(0,0,0,0.07)',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  /** 13.2px/600 ls=-0.44 color=#1A1C29 */
  badge247T: {fontSize: s(13), fontWeight: '600', letterSpacing: -0.44, color: colors.textPrimary},

  /**
   * Logo circle container — logo_circle.png is 164×164 including 20px left/right shadow,
   * 16px top shadow.  The actual orange circle is 124×124 at x=20, y=16 inside the PNG.
   */
  logoBg: {
    position: 'absolute',
    width:  s(164),
    height: s(164),
  },
  logoImage: {
    width:  s(164),
    height: s(164),
  },

  /* ── Title area ── */
  /* ── Title area — centred to match Figma (arrow at x=144 + w=102/2 = 195 = screen centre) ── */
  titleArea: {
    paddingHorizontal: 16,
    paddingTop: s(7),       // Figma title y=413, blob bottom y=406 → 7px gap
    alignItems: 'center',   // all three items (title/arrow/tagline) are horizontally centred
    gap: s(6),
  },
  /** 32px/800 lh=36 ls=-0.64 color=#1B2A4A — centred in Figma */
  appName: {
    fontSize: s(32),
    fontWeight: '800',
    color: colors.navy,
    lineHeight: s(36),
    letterSpacing: -0.64,
    textAlign: 'center',
  },
  /** 16px/500 lh=22 ls=-0.16 color=#677899 — centred in Figma */
  tagline: {
    fontSize: s(16),
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: s(22),
    letterSpacing: -0.16,
    marginTop: s(2),
    textAlign: 'center',
  },

  /* ── Body ── */
  body: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 12,
    alignItems: 'center',  // centred to match Figma
  },
  /** Social proof row — centred */
  proofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  av: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    borderWidth: 1.1,
    borderColor: colors.background,
  },
  /** 11.65px/600 lh=16 ls=-0.39 color=#677899 */
  proofText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.39,
    color: colors.textSecondary,
  },
  cta: {width: SW - 32},
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingVertical: 4,
  },
  loginMuted: {fontSize: 14, fontWeight: '700', color: colors.navy},
  loginLink:  {fontSize: 14, fontWeight: '700', color: colors.primary},
  /** 12px/400 lh=16 ls=-0.39 color=#677899 */
  legal: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.39,
    paddingHorizontal: 8,
  },
  legalBold: {fontWeight: '700', color: colors.navy, fontSize: 12},
});
