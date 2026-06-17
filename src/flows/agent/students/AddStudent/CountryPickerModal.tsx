import React, {memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  TextInput,
} from 'react-native';
import {X, Search} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {AgentCountryItem} from './agentCountries';
import {colors} from '../../../../utils/colors';
import {hPad, rad} from '../../../../utils/sizes';

const H_PAD = hPad(5);

type Props = {
  visible: boolean;
  countries: AgentCountryItem[];
  search: string;
  onSearchChange: (q: string) => void;
  onSelect: (country: AgentCountryItem) => void;
  onClose: () => void;
};

export const CountryPickerModal = memo(function CountryPickerModal({
  visible,
  countries,
  search,
  onSearchChange,
  onSelect,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, {paddingBottom: insets.bottom + 16}]}
          onPress={e => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Select country</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <X size={20} color={colors.navy} />
            </Pressable>
          </View>

          <View style={styles.searchWrap}>
            <Search size={16} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search country"
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={onSearchChange}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          <FlatList
            data={countries}
            keyExtractor={item => item.name}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({item}) => (
              <Pressable style={styles.row} onPress={() => onSelect(item)}>
                <Text style={styles.flag}>{item.flag}</Text>
                <Text style={styles.rowLabel}>{item.name}</Text>
              </Pressable>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(27, 42, 74, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: rad.xl,
    borderTopRightRadius: rad.xl,
    maxHeight: '80%',
    paddingTop: 16,
    paddingHorizontal: H_PAD,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {fontSize: 18, fontWeight: '700', color: colors.navy},
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.inputBg,
    borderRadius: rad.full,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {flex: 1, fontSize: 15, color: colors.textPrimary, padding: 0},
  row: {flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14},
  flag: {fontSize: 22},
  rowLabel: {fontSize: 15, fontWeight: '600', color: colors.navy},
  separator: {height: 1, backgroundColor: colors.border},
});
