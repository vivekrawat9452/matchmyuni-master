import React, {memo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors} from '../../../utils/colors';
import {PIPELINE_LABELS} from '../agentUtils';

type Props = {
  activeIndex: number;
  compact?: boolean;
};

export const PipelineProgress = memo(function PipelineProgress({activeIndex, compact}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        {PIPELINE_LABELS.map((label, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          const last = i === PIPELINE_LABELS.length - 1;
          return (
            <View key={label} style={styles.step}>
              <View style={styles.dotRow}>
                <View
                  style={[
                    styles.dot,
                    compact && styles.dotCompact,
                    done && styles.dotDone,
                    active && styles.dotActive,
                  ]}
                />
                {!last ? (
                  <View style={[styles.line, done && styles.lineDone, compact && styles.lineCompact]} />
                ) : null}
              </View>
              <Text
                style={[
                  styles.label,
                  compact && styles.labelCompact,
                  (done || active) && styles.labelActive,
                ]}
                numberOfLines={1}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {width: '100%'},
  track: {flexDirection: 'row'},
  step: {flex: 1, alignItems: 'center'},
  dotRow: {flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center'},
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.profileProgressTrack,
    borderWidth: 2,
    borderColor: colors.border,
  },
  dotCompact: {width: 8, height: 8, borderRadius: 4},
  dotDone: {backgroundColor: colors.agentMint, borderColor: colors.agentMint},
  dotActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  line: {
    flex: 1,
    height: 2,
    backgroundColor: colors.profileProgressTrack,
    marginHorizontal: 2,
  },
  lineCompact: {height: 1.5},
  lineDone: {backgroundColor: colors.agentMint},
  label: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  labelCompact: {fontSize: 8},
  labelActive: {color: colors.navy, fontWeight: '700'},
});
