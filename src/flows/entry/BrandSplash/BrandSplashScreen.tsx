import React, {memo, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {colors} from '../../../utils/colors';
import {en} from '../../../utils/strings/en';
import {FontSizes, Weights} from '../../../utils';
import {font, hp} from '../../../utils/sizes';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export const BrandSplashScreen = memo(function BrandSplashScreen() {
  const insets = useSafeAreaInsets();
  const lineWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(lineWidth, {
      toValue: 1,
      duration: 700,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, [lineWidth]);

  return (
    <View style={[styles.flex, {paddingTop: insets.top, paddingBottom: insets.bottom}]}>
      <View style={styles.center}>
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.brandText}>{'Match '}</Text>
            {/* Only the underline animates left → right */}
            <Animated.View
              style={[
                styles.underline,
                {
                  width: lineWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 48],
                  }),
                },
              ]}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.brandText}>My Uni</Text>
            <Text style={styles.bird}> </Text>
            <Text style={styles.birdIcon}>🕊</Text>
          </View>
        </View>
      </View>
      <Text style={styles.footer}>
        {en.poweredBy.split(' ').slice(0, 2).join(' ')}{' '}
        <Text style={styles.footB}>EDUDITE</Text>
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.backgroundAlt, justifyContent: 'space-between'},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24},
  brandRow: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start'},
  row: {flexDirection: 'row', alignItems: 'center'},
  brandText: {fontSize: font.hero, fontStyle: 'italic', fontWeight: Weights.extrabold, color: colors.brandBlue},
  underline: {height: 3, backgroundColor: colors.accentCoral, marginTop: 4, borderRadius: 2},
  bird: {width: 4},
  birdIcon: {fontSize: hp(3), color: colors.brandBlue},
  footer: {textAlign: 'center', color: colors.textFooter, fontSize: FontSizes.micro, letterSpacing: 1, marginBottom: 16},
  footB: {fontWeight: Weights.extrabold, color: colors.textPrimary},
});
