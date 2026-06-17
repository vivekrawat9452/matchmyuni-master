/**
 * StepIndicator — pixel-perfect match to Figma "Progress bar" component.
 *
 * Figma node data (file pHnQspQkvUJvE9TyiQN5Zv):
 *   Container:  358 × 30
 *   Dot:        19 × 19  borderRadius=120 (fully round)
 *   Connector:  68 × 3
 *   ACTIVE dot:   stroke=#E8613A  strokeWidth=5.2  NO fill
 *   DONE dot:     fill=#3CC09F   stroke=#3CC09F   strokeWidth=10.2  + white ✓
 *   TODO dot:     stroke=#E7E1D9 strokeWidth=2.2  NO fill
 *   ACTIVE line:  #E8613A   DONE line: #3CC09F   TODO line: #E7E1D9
 */

import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Check} from 'lucide-react-native';
import {colors} from '../utils/colors';

/** Total steps in the student onboarding flow (email/pw → 4 questions) */
export const ONBOARDING_TOTAL_STEPS = 5;

/** Total steps in the agent onboarding flow (email/pw → personal → country) */
export const AGENT_TOTAL_STEPS = 3;

interface Props {
  currentStep: number; // 1-based; steps < currentStep are "done"
  total?: number;
}

const DOT = 19;   // Figma: 19 × 19
const SEG = 68;   // Figma: 68 wide connector
const LINE_H = 3; // Figma: 3 px high connector

const StepIndicator: React.FC<Props> = ({currentStep, total = ONBOARDING_TOTAL_STEPS}) => {
  return (
    <View style={styles.row}>
      {Array.from({length: total}, (_, i) => {
        const step = i + 1;
        const done   = step < currentStep;
        const active = step === currentStep;
        const isLast = step === total;

        return (
          <React.Fragment key={step}>
            {/* ── Dot ── */}
            {done ? (
              // DONE: filled teal circle with white check
              <View style={styles.dotDone}>
                {done && <Check color={colors.white} size={9} strokeWidth={2.2} />}
              </View>
            ) : active ? (
              // ACTIVE: orange ring (NO inner fill)
              <View style={styles.dotActive} />
            ) : (
              // TODO: light gray ring
              <View style={styles.dotTodo} />
            )}

            {/* ── Connector ── */}
            {!isLast && (
              <View
                style={[
                  styles.seg,
                  done   ? styles.segDone
                  : active ? styles.segActive
                           : styles.segTodo,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 358,
    alignSelf: 'center',
    marginVertical: 12,
  },

  /* ── Dot variants ── */
  dotBase: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: colors.white,  // transparent center, orange ring
    borderWidth: 5,
    borderColor: colors.primary,    // #E8613A
  },
  dotDone: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: colors.accentTeal,   // #3CC09F
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotTodo: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: colors.white,  // transparent center, gray ring
    borderWidth: 2,
    borderColor: colors.border,     // #E7E1D9
  },

  /* ── Connector variants ── */
  seg: {
    width: SEG,
    height: LINE_H,
    marginHorizontal: -1,  // slight overlap to remove gap
  },
  segActive: {backgroundColor: colors.primary},    // #E8613A
  segDone:   {backgroundColor: colors.accentTeal}, // #3CC09F
  segTodo:   {backgroundColor: colors.border},     // #E7E1D9
});

export {StepIndicator};
export default StepIndicator;
