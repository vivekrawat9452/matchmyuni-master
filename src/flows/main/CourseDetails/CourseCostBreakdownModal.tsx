import React, {memo} from 'react';
import {View, Text, StyleSheet, Modal, Pressable, ScrollView} from 'react-native';
import {FileText, Info, X} from 'lucide-react-native';
import {colors} from '../../../utils/colors';
import {FontSizes, Weights} from '../../../utils';
import {hPad, rad} from '../../../utils/sizes';
import {CalendarIcon} from '../../../components/icons/ApplicationIcons';
import type {CourseCostBreakdown} from './courseCostBreakdown';

type Props = {
  visible: boolean;
  breakdown: CourseCostBreakdown | null;
  onClose: () => void;
};

function formatAmount(symbol: string, amount: number): string {
  return `${symbol}${amount.toLocaleString()}`;
}

function BreakdownLineItem({
  label,
  subtitle,
  amount,
  symbol,
}: {
  label: string;
  subtitle: string;
  amount: number;
  symbol: string;
}) {
  return (
    <View style={styles.lineItem}>
      <View style={styles.lineLeft}>
        <Text style={styles.lineLabel}>{label}</Text>
        <Text style={styles.lineSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.lineValue}>{formatAmount(symbol, amount)}</Text>
    </View>
  );
}

export const CourseCostBreakdownModal = memo(function CourseCostBreakdownModal({
  visible,
  breakdown,
  onClose,
}: Props) {
  if (!breakdown) {
    return null;
  }

  const {currencySymbol: sym} = breakdown;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}>
                  <FileText size={18} color={colors.primary} />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.title}>How is this calculated?</Text>
                  <Text style={styles.subtitle} numberOfLines={2}>
                    {breakdown.courseSubtitle}
                  </Text>
                </View>
              </View>
              <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
                <X size={18} color={colors.navy} />
              </Pressable>
            </View>

            <View style={styles.firstYearCard}>
              <Text style={styles.sectionLabel}>FIRST-YEAR COST</Text>
              {breakdown.lineItems.map(item => (
                <BreakdownLineItem
                  key={item.label}
                  label={item.label}
                  subtitle={item.subtitle}
                  amount={item.amount}
                  symbol={sym}
                />
              ))}
              <View style={styles.totalDivider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>First-year total</Text>
                <Text style={styles.totalValue}>
                  {formatAmount(sym, breakdown.firstYearTotal)}
                </Text>
              </View>
            </View>

            {breakdown.recurringYearlyCost != null ? (
              <View style={styles.recurringCard}>
                <CalendarIcon size={20} color={colors.primary} />
                <View style={styles.recurringText}>
                  <Text style={styles.recurringTitle}>From 2nd year onward</Text>
                  <Text style={styles.recurringSubtitle}>
                    One-time fees already paid — recurring costs only
                  </Text>
                </View>
                <Text style={styles.recurringValue}>
                  {formatAmount(sym, breakdown.recurringYearlyCost)} /year
                </Text>
              </View>
            ) : null}

            <View style={styles.footerNote}>
              <Info size={14} color={colors.textMuted} />
              <Text style={styles.footerText}>
                Estimates for international students in {breakdown.currency}. Actual amounts may
                vary.
              </Text>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

const H_PAD = hPad(5);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 42, 74, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: H_PAD,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: rad.sm,
    backgroundColor: '#FFF7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {flex: 1, gap: 4},
  title: {
    fontSize: FontSizes.body,
    fontWeight: Weights.extrabold,
    color: colors.navy,
  },
  subtitle: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBg,
  },
  firstYearCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: rad.lg,
    padding: 16,
    marginBottom: 12,
    gap: 14,
  },
  sectionLabel: {
    fontSize: FontSizes.micro,
    fontWeight: Weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.6,
  },
  lineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  lineLeft: {flex: 1, gap: 2},
  lineLabel: {
    fontSize: FontSizes.chip,
    fontWeight: Weights.bold,
    color: colors.navy,
  },
  lineSubtitle: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
  },
  lineValue: {
    fontSize: FontSizes.chip,
    fontWeight: Weights.bold,
    color: colors.navy,
  },
  totalDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginTop: 2,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: FontSizes.chip,
    fontWeight: Weights.extrabold,
    color: colors.navy,
  },
  totalValue: {
    fontSize: FontSizes.size22,
    fontWeight: Weights.extrabold,
    color: colors.primary,
  },
  recurringCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#D6E8FF',
    borderRadius: rad.lg,
    padding: 14,
    marginBottom: 16,
  },
  recurringText: {flex: 1, gap: 2},
  recurringTitle: {
    fontSize: FontSizes.chip,
    fontWeight: Weights.bold,
    color: colors.navy,
  },
  recurringSubtitle: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  recurringValue: {
    fontSize: FontSizes.chip,
    fontWeight: Weights.extrabold,
    color: colors.primary,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  footerText: {
    flex: 1,
    fontSize: FontSizes.caption,
    color: colors.textMuted,
    lineHeight: 16,
  },
});
