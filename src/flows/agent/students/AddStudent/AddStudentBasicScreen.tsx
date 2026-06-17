/**
 * Add Student — Step 1 Basic Detail (screens 1.0–1.3)
 * API: POST /partner/students (on continue)
 */
import React, {memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import {ChevronLeft, ChevronDown, X} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {AgentCountryItem} from './agentCountries';
import {CountryPickerModal} from './CountryPickerModal';
import {colors} from '../../../../utils/colors';
import {agentLayout} from '../../agentStyles';
import {FontSizes, Weights, inputStyles} from '../../../../utils';
import {hPad, rad} from '../../../../utils/sizes';

const H_PAD = hPad(5);

type Props = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  selectedCountry: AgentCountryItem;
  phoneCountry: AgentCountryItem;
  courseCategory: string;
  categories: string[];
  categoriesLoading: boolean;
  countryPickerVisible: boolean;
  countrySearch: string;
  filteredCountries: AgentCountryItem[];
  categoryPickerVisible: boolean;
  loading: boolean;
  onChangeFirstName: (v: string) => void;
  onChangeLastName: (v: string) => void;
  onChangeEmail: (v: string) => void;
  onChangePhone: (v: string) => void;
  onOpenCountryPicker: () => void;
  onCloseCountryPicker: () => void;
  onCountrySearch: (q: string) => void;
  onSelectCountry: (c: AgentCountryItem) => void;
  onOpenCategoryPicker: () => void;
  onCloseCategoryPicker: () => void;
  onSelectCategory: (c: string) => void;
  onContinue: () => void;
  onBack: () => void;
};

function StepIndicator() {
  return (
    <View style={styles.steps}>
      <View style={styles.stepItem}>
        <View style={[styles.stepDot, styles.stepDotActive]} />
        <Text style={[styles.stepLabel, styles.stepLabelActive]}>Basic Detail</Text>
      </View>
      <View style={styles.stepLine} />
      <View style={styles.stepItem}>
        <View style={styles.stepDot} />
        <Text style={styles.stepLabel}>Choose Program</Text>
      </View>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words';
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'sentences'}
      />
    </View>
  );
}

export const AddStudentBasicScreen = memo(function AddStudentBasicScreen({
  firstName,
  lastName,
  email,
  phone,
  selectedCountry,
  phoneCountry,
  courseCategory,
  categories,
  categoriesLoading,
  countryPickerVisible,
  countrySearch,
  filteredCountries,
  categoryPickerVisible,
  loading,
  onChangeFirstName,
  onChangeLastName,
  onChangeEmail,
  onChangePhone,
  onOpenCountryPicker,
  onCloseCountryPicker,
  onCountrySearch,
  onSelectCountry,
  onOpenCategoryPicker,
  onCloseCategoryPicker,
  onSelectCategory,
  onContinue,
  onBack,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <Pressable style={styles.backRow} onPress={onBack} hitSlop={12}>
          <ChevronLeft size={22} color={colors.navy} />
          <Text style={styles.backLabel}>Add Student</Text>
        </Pressable>
        <StepIndicator />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 100}]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Field
          label="First name"
          value={firstName}
          onChangeText={onChangeFirstName}
          autoCapitalize="words"
        />
        <Field
          label="Last name"
          value={lastName}
          onChangeText={onChangeLastName}
          autoCapitalize="words"
        />
        <Field
          label="Email address"
          value={email}
          onChangeText={onChangeEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.field}>
          <Text style={styles.label}>Phone number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.dialWrap}>
              <Text style={styles.dialFlag}>{phoneCountry.flag}</Text>
              <Text style={styles.dialCode}>{phoneCountry.dialCode}</Text>
            </View>
            <TextInput
              style={[styles.input, styles.phoneInput]}
              value={phone}
              onChangeText={onChangePhone}
              placeholder="(555) 123-4567"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Country</Text>
          <Pressable style={styles.selectField} onPress={onOpenCountryPicker}>
            <Text style={styles.selectFlag}>{selectedCountry.flag}</Text>
            <Text style={styles.selectValue}>{selectedCountry.name}</Text>
            <ChevronDown size={18} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Course Category</Text>
          <Pressable
            style={styles.selectField}
            onPress={onOpenCategoryPicker}
            disabled={categoriesLoading}>
            <Text style={[styles.selectValue, !courseCategory && styles.placeholder]}>
              {courseCategory || 'Select course category'}
            </Text>
            <ChevronDown size={18} color={colors.textMuted} />
          </Pressable>
        </View>

        <Text style={styles.hint}>
          You can complete their full profile and upload documents later.
        </Text>
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + 12}]}>
        <Pressable
          style={[styles.continueBtn, loading && styles.btnDisabled]}
          onPress={onContinue}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.continueText}>Continue →</Text>
          )}
        </Pressable>
      </View>

      <CountryPickerModal
        visible={countryPickerVisible}
        countries={filteredCountries}
        search={countrySearch}
        onSearchChange={onCountrySearch}
        onSelect={onSelectCountry}
        onClose={onCloseCountryPicker}
      />

      <Modal
        visible={categoryPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={onCloseCategoryPicker}>
        <Pressable style={styles.modalBg} onPress={onCloseCategoryPicker}>
          <Pressable style={[styles.categorySheet, {paddingBottom: insets.bottom + 16}]} onPress={() => {}}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>Course category</Text>
              <Pressable onPress={onCloseCategoryPicker} hitSlop={12}>
                <X size={20} color={colors.navy} />
              </Pressable>
            </View>
            {categoriesLoading ? (
              <ActivityIndicator color={colors.primary} style={{marginVertical: 24}} />
            ) : (
              <FlatList
                data={categories}
                keyExtractor={item => item}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({item}) => (
                  <Pressable style={styles.categoryRow} onPress={() => onSelectCategory(item)}>
                    <Text style={styles.categoryLabel}>{item}</Text>
                  </Pressable>
                )}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  fill: {flex: 1, backgroundColor: colors.background},
  header: {
    paddingHorizontal: H_PAD,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16},
  backLabel: {fontSize: 18, fontWeight: '700', color: colors.navy},
  steps: {flexDirection: 'row', alignItems: 'center'},
  stepItem: {alignItems: 'center', width: 100},
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  stepDotActive: {borderColor: colors.primary, backgroundColor: colors.primary},
  stepLabel: {fontSize: 10, fontWeight: '600', color: colors.textMuted, marginTop: 6, textAlign: 'center'},
  stepLabelActive: {color: colors.primary, fontWeight: '700'},
  stepLine: {flex: 1, height: 2, backgroundColor: colors.border, marginBottom: 18},
  content: {paddingHorizontal: H_PAD, paddingTop: 16},
  field: {marginBottom: 14},
  label: {fontSize: FontSizes.caption, fontWeight: Weights.bold, color: colors.navy, marginBottom: 6},
  input: {
    ...inputStyles.field,
    backgroundColor: colors.inputBg,
    borderWidth: 0,
  },
  phoneRow: {flexDirection: 'row', gap: 8},
  dialWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.inputBg,
    borderRadius: rad.lg,
    paddingHorizontal: 12,
    height: 48,
  },
  dialFlag: {fontSize: 18},
  dialCode: {fontSize: 14, fontWeight: Weights.bold, color: colors.navy},
  phoneInput: {flex: 1},
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.inputBg,
    borderRadius: rad.lg,
    paddingHorizontal: 14,
    height: 48,
  },
  selectFlag: {fontSize: 18},
  selectValue: {flex: 1, fontSize: 15, fontWeight: Weights.medium, color: colors.navy},
  placeholder: {color: colors.textMuted, fontWeight: Weights.medium},
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: H_PAD,
    paddingTop: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  continueBtn: {
    backgroundColor: colors.primary,
    height: agentLayout.buttonHeight,
    borderRadius: rad.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {opacity: 0.7},
  continueText: {color: colors.white, fontSize: 16, fontWeight: '700'},
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(27, 42, 74, 0.45)',
    justifyContent: 'flex-end',
  },
  categorySheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: rad.xl,
    borderTopRightRadius: rad.xl,
    maxHeight: '60%',
    paddingTop: 16,
    paddingHorizontal: H_PAD,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {fontSize: 18, fontWeight: '700', color: colors.navy},
  categoryRow: {paddingVertical: 14},
  categoryLabel: {fontSize: 15, fontWeight: '600', color: colors.navy},
  separator: {height: 1, backgroundColor: colors.border},
});
