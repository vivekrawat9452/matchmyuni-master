import React, {memo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import type {PartnerMilestoneDto} from '../../../api/partnerTypes';
import {colors} from '../../../utils/colors';
import {agentType} from '../agentStyles';

type Props = {
  milestones: PartnerMilestoneDto[];
};

/**
 * Career milestone row — Figma node 855:1636 (First App → First Offer).
 */
export const MilestoneTracker = memo(function MilestoneTracker({milestones}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {milestones.map((m, i) => {
          const achieved = m.status === 'achieved';
          const active = m.status === 'in_progress';
          const locked = m.status === 'locked';
          const last = i === milestones.length - 1;
          const segmentDone = achieved || active;

          return (
            <View key={m.id} style={styles.step}>
              <View style={styles.dotRow}>
                {i > 0 ? (
                  <View
                    style={[
                      styles.lineLeft,
                      segmentDone ? styles.lineDone : styles.lineLocked,
                    ]}
                  />
                ) : null}
                <View
                  style={[
                    styles.dot,
                    achieved && styles.dotAchieved,
                    active && styles.dotActive,
                    locked && styles.dotLocked,
                  ]}
                />
                {!last ? (
                  <View
                    style={[
                      styles.lineRight,
                      milestones[i + 1]?.status === 'achieved' ||
                      milestones[i + 1]?.status === 'in_progress'
                        ? styles.lineDone
                        : segmentDone
                          ? styles.lineDone
                          : styles.lineLocked,
                    ]}
                  />
                ) : null}
              </View>
              <Text
                style={[
                  styles.label,
                  (achieved || active) && styles.labelActive,
                ]}
                numberOfLines={1}>
                {m.label}
              </Text>
              {active ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>In-progress</Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    paddingVertical: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  step: {
    flex: 1,
    alignItems: 'center',
    minHeight: 52,
  },
  dotRow: {
    width: '100%',
    height: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    borderWidth: 2,
    borderColor: colors.textMuted,
    backgroundColor: colors.white,
    zIndex: 1,
  },
  dotAchieved: {
    borderColor: colors.agentMint,
    backgroundColor: colors.agentMint,
  },
  dotActive: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  dotLocked: {
    borderColor: colors.textMuted,
    borderStyle: 'dashed',
    backgroundColor: colors.white,
  },
  lineLeft: {
    flex: 1,
    height: 2,
    marginRight: -2,
  },
  lineRight: {
    flex: 1,
    height: 2,
    marginLeft: -2,
  },
  lineDone: {
    backgroundColor: colors.primary,
  },
  lineLocked: {
    backgroundColor: colors.textMuted,
  },
  label: {
    ...agentType.pill,
    color: colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  labelActive: {
    color: colors.navy,
  },
  badge: {
    marginTop: 4,
    backgroundColor: colors.matchBadgeBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.matchBadgeText,
  },
});
