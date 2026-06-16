import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {PrimaryButton} from '../../../components/PrimaryButton';
import {colors} from '../../../utils/colors';
import {SCREEN_H_PADDING} from '../../../utils/theme';
import {
  BUDGET_OPTIONS,
  DESTINATION_OPTIONS,
  FIELD_OPTIONS,
} from './profileConstants';

export type StudyPreferencesScreenProps = {
  destinations: string[];
  budget: string;
  fields: string[];
  onToggleDestination: (d: string) => void;
  onSelectBudget: (b: string) => void;
  onToggleField: (f: string) => void;
  onClose: () => void;
  onApply: () => void;
  saving: boolean;
};

function Chip({
  label,
  selected,
  onPress,
  large,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  large?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        large && styles.chipLarge,
        selected && styles.chipSelected,
      ]}>
      <Text style={[styles.chipLabel, large && styles.chipLabelLarge, selected && styles.chipLabelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function StudyPreferencesScreen({
  destinations,
  budget,
  fields,
  onToggleDestination,
  onSelectBudget,
  onToggleField,
  onClose,
  onApply,
  saving,
}: StudyPreferencesScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, {paddingBottom: insets.bottom + 16}]}>
        <View style={styles.handle} />
        <Text style={styles.title}>Study preferences</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>
          <Text style={styles.sectionTitle}>Destination</Text>
          <View style={styles.chipGrid}>
            {DESTINATION_OPTIONS.map(d => (
              <Chip
                key={d}
                label={d}
                selected={destinations.includes(d)}
                onPress={() => onToggleDestination(d)}
              />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Budget range</Text>
          <View style={styles.budgetList}>
            {BUDGET_OPTIONS.map(b => (
              <Chip
                key={b}
                label={b}
                selected={budget === b}
                onPress={() => onSelectBudget(b)}
                large
              />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Field of study</Text>
          <View style={styles.chipGrid}>
            {FIELD_OPTIONS.map(f => (
              <Chip
                key={f}
                label={f}
                selected={fields.includes(f)}
                onPress={() => onToggleField(f)}
              />
            ))}
          </View>
        </ScrollView>

        <PrimaryButton
          label="Apply"
          onPress={onApply}
          loading={saving}
          disabled={saving}
          style={styles.applyBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(27, 42, 74, 0.45)',
  },
  backdrop: {flex: 1},
  sheet: {
    maxHeight: '88%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SCREEN_H_PADDING,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.navy,
    lineHeight: 26,
    marginBottom: 16,
  },
  scroll: {paddingBottom: 12},
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
    lineHeight: 24,
    marginBottom: 12,
    marginTop: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  budgetList: {gap: 8, marginBottom: 8},
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 1000,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipLarge: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'stretch',
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFF4EE',
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.navy,
    lineHeight: 18,
  },
  chipLabelLarge: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  chipLabelSelected: {color: colors.primary},
  applyBtn: {marginTop: 8},
});
