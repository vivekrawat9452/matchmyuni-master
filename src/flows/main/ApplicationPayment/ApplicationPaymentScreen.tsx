/**
 * ApplicationPaymentScreen — placeholder for payment flow (Figma payment screens TBD)
 */
import React, {memo} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ChevronLeftIcon} from '../../../components/icons/ApplicationIcons';
import {PrimaryButton} from '../../../components/PrimaryButton';
import {colors} from '../../../utils/colors';
import {FontSizes, Weights, Styles} from '../../../utils';
import {hPad, rad} from '../../../utils/sizes';
import {en} from '../../../utils/strings/en';

const H_PAD = hPad(5);

export type ApplicationPaymentScreenProps = {
  courseName: string;
  feeLabel: string;
  onBack: () => void;
  onContinue: () => void;
};

export const ApplicationPaymentScreen = memo(function ApplicationPaymentScreen({
  courseName,
  feeLabel,
  onBack,
  onContinue,
}: ApplicationPaymentScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.flex}>
      <View style={[styles.header, {paddingTop: insets.top + 10}]}>
        <Pressable onPress={onBack} style={styles.backBtn} hitSlop={12}>
          <ChevronLeftIcon size={22} color={colors.white} />
          <Text style={styles.backLabel}>{en.back}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{en.applicationFlow.paymentTitle}</Text>
        <Text style={styles.headerSub} numberOfLines={1}>
          {courseName}
        </Text>
      </View>

      <View style={[styles.body, {paddingHorizontal: H_PAD}]}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{en.applicationFlow.paymentDue}</Text>
          <Text style={styles.fee}>{feeLabel}</Text>
          <Text style={styles.cardBody}>{en.applicationFlow.paymentPlaceholder}</Text>
        </View>
      </View>

      <View style={[styles.footer, {paddingBottom: insets.bottom + 16, paddingHorizontal: H_PAD}]}>
        <PrimaryButton
          label={en.applicationFlow.paymentContinue}
          onPress={onContinue}
          variant="muted"
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  flex: Styles.screen,
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: H_PAD,
    paddingBottom: 16,
  },
  backBtn: {flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10},
  backLabel: {fontSize: FontSizes.size15, color: colors.white, fontWeight: Weights.medium},
  headerTitle: {
    fontSize: FontSizes.size22,
    fontWeight: Weights.extrabold,
    color: colors.white,
  },
  headerSub: {
    fontSize: FontSizes.chip,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  body: {flex: 1, paddingTop: 24, justifyContent: 'center'},
  card: {
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: FontSizes.size15,
    fontWeight: Weights.extrabold,
    color: colors.navy,
    marginBottom: 8,
  },
  fee: {
    fontSize: FontSizes.size22,
    fontWeight: Weights.extrabold,
    color: colors.primary,
    marginBottom: 12,
  },
  cardBody: {
    fontSize: FontSizes.chip,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {paddingTop: 12},
});
