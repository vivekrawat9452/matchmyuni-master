/**
 * ApplicationSubmittedScreen — Figma node 567-1943
 */
import React, {memo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CheckCircleIcon} from '../../../components/icons/ApplicationIcons';
import {PrimaryButton} from '../../../components/PrimaryButton';
import {colors} from '../../../utils/colors';
import {FontSizes, Weights, Styles} from '../../../utils';
import {hPad, rad} from '../../../utils/sizes';
import {en} from '../../../utils/strings/en';

const H_PAD = hPad(5);

export type ApplicationSubmittedScreenProps = {
  courseName: string;
  universityName?: string;
  onViewApplications: () => void;
  onDone: () => void;
};

export const ApplicationSubmittedScreen = memo(function ApplicationSubmittedScreen({
  courseName,
  universityName,
  onViewApplications,
  onDone,
}: ApplicationSubmittedScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.flex, {paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24}]}>
      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <CheckCircleIcon size={72} color={colors.accentTeal} />
        </View>
        <Text style={styles.title}>{en.applicationFlow.submittedTitle}</Text>
        <Text style={styles.subtitle}>
          {en.applicationFlow.submittedSubtitlePrefix} {courseName}
          {universityName ? ` at ${universityName}` : ''}.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{en.applicationFlow.submittedNextTitle}</Text>
          <Text style={styles.cardBody}>{en.applicationFlow.submittedNextBody}</Text>
        </View>
      </View>

      <View style={[styles.footer, {paddingHorizontal: H_PAD}]}>
        <PrimaryButton
          label={en.applicationFlow.viewApplications}
          onPress={onViewApplications}
        />
        <PrimaryButton
          label={en.applicationFlow.done}
          onPress={onDone}
          variant="outline"
          style={styles.secondaryBtn}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  flex: Styles.screen,
  body: {
    flex: 1,
    paddingHorizontal: H_PAD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F0FFF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: FontSizes.size22,
    fontWeight: Weights.extrabold,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: FontSizes.chip,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 12,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  cardTitle: {
    fontSize: FontSizes.small,
    fontWeight: Weights.extrabold,
    color: colors.navy,
    marginBottom: 6,
  },
  cardBody: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  footer: {gap: 12},
  secondaryBtn: {marginTop: 0},
});
