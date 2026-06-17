/**
 * Shortlist confirmation — Figma node 887:3591
 */
import React, {memo} from 'react';
import {View, Text, StyleSheet, Pressable, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../../../utils/colors';
import {agentLayout} from '../../agentStyles';
import {hPad, rad} from '../../../../utils/sizes';

const H_PAD = hPad(5);

type Props = {
  courseName: string;
  matchScore?: number;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const AgentMatchesShortlistScreen = memo(function AgentMatchesShortlistScreen({
  courseName,
  matchScore,
  loading,
  onConfirm,
  onCancel,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.fill, {paddingBottom: insets.bottom + 16}]}>
      <Pressable style={styles.backdrop} onPress={onCancel} />
      <View style={styles.sheet}>
        <Text style={styles.title}>Add to shortlist?</Text>
        <Text style={styles.course} numberOfLines={3}>
          {courseName}
        </Text>
        {matchScore != null ? (
          <Text style={styles.match}>{matchScore}% match score</Text>
        ) : null}
        <Text style={styles.note}>
          The student will see this course on their shortlist. You can start an application from
          the Applications tab.
        </Text>
        <Pressable
          style={[styles.confirmBtn, loading && styles.btnDisabled]}
          onPress={onConfirm}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.confirmText}>Add to shortlist →</Text>
          )}
        </Pressable>
        <Pressable style={styles.cancelBtn} onPress={onCancel} disabled={loading}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  fill: {flex: 1, justifyContent: 'flex-end'},
  backdrop: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)'},
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: rad.xl,
    borderTopRightRadius: rad.xl,
    padding: 24,
    marginHorizontal: 0,
    gap: 10,
  },
  title: {fontSize: 20, fontWeight: '800', color: colors.navy},
  course: {fontSize: 15, fontWeight: '700', color: colors.navy},
  match: {fontSize: 13, fontWeight: '700', color: colors.matchBadgeText},
  note: {fontSize: 13, fontWeight: '500', color: colors.textSecondary, lineHeight: 18},
  confirmBtn: {
    backgroundColor: colors.primary,
    borderRadius: agentLayout.cardRadiusSm,
    height: agentLayout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnDisabled: {opacity: 0.7},
  confirmText: {fontSize: 15, fontWeight: '700', color: colors.white},
  cancelBtn: {alignItems: 'center', paddingVertical: 12},
  cancelText: {fontSize: 14, fontWeight: '600', color: colors.textSecondary},
});
