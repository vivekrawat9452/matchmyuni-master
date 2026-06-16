import React from 'react';
import {View, Text, TextInput, FlatList, Pressable, StyleSheet, ListRenderItem} from 'react-native';
import {Check} from 'lucide-react-native';
import {WaveHeader} from '../../../components/WaveHeader';
import {StepIndicator} from '../../../components/StepIndicator';
import {PrimaryButton} from '../../../components/PrimaryButton';
import {colors} from '../../../utils/colors';
import {en} from '../../../utils/strings/en';
import {FontSizes, Weights, Styles} from '../../../utils';
import {hPad, touch} from '../../../utils/sizes';
import {inputStyles} from '../../../utils/theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {CountryDto} from '../../../api/types';

type Props = {
  search: string;
  onSearch: (t: string) => void;
  countries: CountryDto[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  onBack: () => void;
  onSkip: () => void;
  onContinue: () => void;
  canSubmit: boolean;
};

export function LocationSelectScreen({
  search,
  onSearch,
  countries,
  selectedIds,
  onToggle,
  onBack,
  onSkip,
  onContinue,
  canSubmit,
}: Props) {
  const insets = useSafeAreaInsets();
  const lower = search.toLowerCase();
  const data = countries.filter(
    c => c.name.toLowerCase().includes(lower) || c.location?.toLowerCase().includes(lower),
  );

  const renderItem: ListRenderItem<(typeof data)[0]> = ({item}) => {
    const on = selectedIds.includes(item.id);
    return (
      <Pressable
        onPress={() => onToggle(item.id)}
        style={[styles.tile, on && styles.tileOn]}>
        {on && (
          <View style={styles.checkBadge}>
            <Check color={colors.white} size={10} strokeWidth={3.5} />
          </View>
        )}
        <Text style={styles.tileFlag}>{item.flag ?? '🌍'}</Text>
        <Text style={[styles.tileT, on && styles.tileTOn]} numberOfLines={2}>
          {item.name}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={Styles.screen}>
      <FlatList
        data={data}
        keyExtractor={c => String(c.id)}
        numColumns={2}
        keyboardShouldPersistTaps="handled"
        columnWrapperStyle={styles.colWrap}
        contentContainerStyle={{paddingBottom: insets.bottom + 90, backgroundColor: colors.background}}
        ListHeaderComponent={
          <>
            <WaveHeader
              title={en.location.title}
              subtitle={en.location.subtitle}
              onBack={onBack}
              rightLabel="Skip"
              onRight={onSkip}
            />
            <StepIndicator currentStep={3} />
            <View style={styles.pad}>
              <TextInput
                style={[inputStyles.search, styles.searchOverride]}
                placeholder={en.location.search}
                value={search}
                onChangeText={onSearch}
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </>
        }
        renderItem={renderItem}
      />
      <View style={[Styles.footBar, {paddingBottom: insets.bottom + 8}]}>
        <PrimaryButton
          label={en.continue}
          onPress={onContinue}
          disabled={!canSubmit}
          variant={!canSubmit ? 'muted' : 'solid'}
          style={{minHeight: touch.minHButton}}
        />
      </View>
    </View>
  );
}

const H_PAD = hPad(5);

const styles = StyleSheet.create({
  pad: {paddingHorizontal: H_PAD, marginBottom: 10},
  searchOverride: {minHeight: 48},
  colWrap: {
    paddingHorizontal: H_PAD,
    marginBottom: 10,
    justifyContent: 'space-between',
    gap: 10,
  },
  tile: {
    flex: 1,
    maxWidth: '48%',
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 14,
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  tileOn: {
    borderColor: colors.primary,
    backgroundColor: '#FFF4EE',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tileFlag: {fontSize: FontSizes.title, marginBottom: 8},
  tileT: {fontSize: FontSizes.caption, fontWeight: Weights.bold, color: colors.navy, textAlign: 'center'},
  tileTOn: {color: colors.primary},
});
