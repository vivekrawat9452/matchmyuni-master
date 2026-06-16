/**
 * PhoneEntryScreen — Figma: "Get going with phone number"
 *
 * Layout (Figma node 303:25033 / 334:7246):
 *   • WaveHeader: title + subtitle
 *   • StepIndicator: step 1 active
 *   • Phone row: [CountryCodeButton] [PhoneInput]  — side-by-side, same height 54
 *   • Sticky footer: PrimaryButton (muted when disabled, solid when ready)
 *
 * CountryCodeButton (Figma 303:25860 / 334:7593):
 *   • bg #EFEAE2  r=14  border #E7E1D9  h=54  w=~80
 *   • Flag emoji in circle (22×22 r=11)  +  "+1" text
 *   • Tapping opens CountryPickerModal
 *
 * CountryPickerModal (Figma 321:19321 / 321:19322):
 *   • Bottom sheet — slide-up, dark semi-transparent backdrop
 *   • Header: "Select country code" + ✕ close
 *   • Search input
 *   • FlatList: gray circle | country name | +dial code
 */
import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Modal,
  FlatList,
  ListRenderItem,
} from 'react-native';
import {X} from 'lucide-react-native';
import {WaveHeader} from '../../../components/WaveHeader';
import {StepIndicator} from '../../../components/StepIndicator';
import {PrimaryButton} from '../../../components/PrimaryButton';
import {colors} from '../../../utils/colors';
import {en} from '../../../utils/strings/en';
import {FontSizes, Weights, Styles} from '../../../utils';
import {hPad, space, rad, touch} from '../../../utils/sizes';
import {inputStyles} from '../../../utils/theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export type CountryItem = {name: string; dialCode: string; flag: string};

type Props = {
  selectedCountry: CountryItem;
  phone: string;
  onChangePhone: (t: string) => void;
  onOpenPicker: () => void;
  pickerVisible: boolean;
  pickerSearch: string;
  onPickerSearch: (t: string) => void;
  onSelectCountry: (c: CountryItem) => void;
  onClosePicker: () => void;
  filteredCountries: CountryItem[];
  onContinue: () => void;
  onBack: () => void;
  disabled: boolean;
  stepTotal: number;
};

export function PhoneEntryScreen({
  selectedCountry,
  phone,
  onChangePhone,
  onOpenPicker,
  pickerVisible,
  pickerSearch,
  onPickerSearch,
  onSelectCountry,
  onClosePicker,
  filteredCountries,
  onContinue,
  onBack,
  disabled,
  stepTotal,
}: Props) {
  const insets = useSafeAreaInsets();

  const renderCountryRow: ListRenderItem<CountryItem> = ({item}) => (
    <Pressable
      onPress={() => onSelectCountry(item)}
      style={styles.pickerRow}
      android_ripple={{color: colors.inputBg}}>
      <View style={styles.radioCircle} />
      <Text style={styles.pickerCountryName}>{item.name}</Text>
      <Text style={styles.pickerDialCode}>{item.dialCode}</Text>
    </Pressable>
  );

  return (
    <>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{flexGrow: 1, paddingBottom: insets.bottom + 12}}
          keyboardShouldPersistTaps="handled">
          <WaveHeader
            title={en.phoneEntry.title}
            subtitle={en.phoneEntry.subtitle}
            onBack={onBack}
          />
          <StepIndicator currentStep={1} total={stepTotal} />

          <View style={styles.body}>
            {/* ── Phone row: country button + phone input ── */}
            <View style={styles.phoneRow}>
              {/* Country code selector */}
              <Pressable
                onPress={onOpenPicker}
                style={styles.codeBtn}
                accessibilityRole="button"
                accessibilityLabel={`Country code ${selectedCountry.dialCode}`}>
                <View style={styles.flagCircle}>
                  <Text style={styles.flagEmoji}>{selectedCountry.flag}</Text>
                </View>
                <Text style={styles.dialCodeText}>{selectedCountry.dialCode}</Text>
              </Pressable>

              {/* Phone number input */}
              <TextInput
                value={phone}
                onChangeText={onChangePhone}
                style={[inputStyles.field, styles.phoneInput]}
                keyboardType="phone-pad"
                placeholder={en.phoneEntry.placeholder}
                placeholderTextColor={colors.textMuted}
                returnKeyType="done"
              />
            </View>
          </View>

          <View style={[styles.footer, {paddingBottom: insets.bottom + 8}]}>
            <PrimaryButton
              label={en.continue}
              onPress={onContinue}
              disabled={disabled}
              variant={disabled ? 'muted' : 'solid'}
              style={{minHeight: touch.minHButton}}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Country picker bottom-sheet modal ── */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={onClosePicker}>
        <Pressable style={styles.backdrop} onPress={onClosePicker}>
          {/* stop propagation so taps inside sheet don't close modal */}
          <Pressable style={[styles.sheet, {paddingBottom: insets.bottom + 16}]} onPress={() => {}}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{en.phoneEntry.pickerTitle}</Text>
              <Pressable onPress={onClosePicker} style={styles.closeBtn} hitSlop={12}>
                <X color={colors.textPrimary} size={18} strokeWidth={2.5} />
              </Pressable>
            </View>

            {/* Search */}
            <View style={styles.searchWrap}>
              <TextInput
                style={[inputStyles.search, styles.searchOverride]}
                placeholder={en.phoneEntry.pickerSearch}
                value={pickerSearch}
                onChangeText={onPickerSearch}
                placeholderTextColor={colors.textMuted}
                clearButtonMode="while-editing"
              />
            </View>

            {/* Country list */}
            <FlatList
              data={filteredCountries}
              keyExtractor={item => `${item.name}-${item.dialCode}`}
              renderItem={renderCountryRow}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={{paddingBottom: 8}}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const H_PAD = hPad(5);

const styles = StyleSheet.create({
  flex: Styles.screen,
  body: {paddingHorizontal: H_PAD, paddingTop: space.md, flex: 1},

  /* ── Phone input row ── */
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },

  /**
   * Figma: country code button — bg #EFEAE2, r=14, stroke #E7E1D9, h=54, w≈80
   * Contains flag circle (22×22) + dial code text
   */
  codeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.inputBg,   // #EFEAE2
    borderRadius: rad.md,               // 14
    borderWidth: 1,
    borderColor: colors.borderLight,    // #E7E1D9
    height: 54,
    paddingHorizontal: 12,
    minWidth: 78,
  },

  /** Flag emoji inside a small circle */
  flagCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryMuted, // salmon placeholder if emoji fails
  },
  flagEmoji: {fontSize: 16, lineHeight: 20},

  dialCodeText: {
    fontSize: FontSizes.small,
    fontWeight: Weights.semibold,
    color: colors.textPrimary,
    letterSpacing: -0.14,
  },

  /**
   * Phone number text input — fills remaining row space
   * Inherits inputStyles.field (h=54, bg=#EFEAE2, r=14, border)
   */
  phoneInput: {flex: 1},

  footer: {paddingHorizontal: H_PAD, marginTop: 'auto'},

  /* ── Country Picker Modal ── */
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: rad.xl,   // 24
    borderTopRightRadius: rad.xl,
    maxHeight: '78%',
    paddingTop: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: H_PAD,
    marginBottom: 16,
    position: 'relative',
  },
  sheetTitle: {
    fontSize: FontSizes.body,
    fontWeight: Weights.bold,
    color: colors.navy,
    textAlign: 'center',
  },
  closeBtn: {
    position: 'absolute',
    right: H_PAD,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    paddingHorizontal: H_PAD,
    marginBottom: 12,
  },
  searchOverride: {
    height: 48,
    borderRadius: rad.md,
  },

  /**
   * Figma picker row: 15dp vertical padding, gray circle radio, country name, dial code right
   */
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: H_PAD,
    paddingVertical: 14,
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.inputBg,  // #EFEAE2 — plain gray circle (unselected)
  },
  pickerCountryName: {
    flex: 1,
    fontSize: FontSizes.size15,
    fontWeight: Weights.medium,
    color: colors.textPrimary,
    letterSpacing: -0.15,
  },
  pickerDialCode: {
    fontSize: FontSizes.small,
    fontWeight: Weights.medium,
    color: colors.textSecondary,
    letterSpacing: -0.14,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
    marginHorizontal: H_PAD,
  },
});
