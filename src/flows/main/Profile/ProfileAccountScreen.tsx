import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ProfileStackHeader} from './components/ProfileStackHeader';
import {colors} from '../../../utils/colors';
import {profileStyles as ps} from './profileStyles';
import {SCREEN_H_PADDING} from '../../../utils/theme';
import type {ProfileStackList} from '../../../navigation/ProfileStackNavigator';

type Nav = NativeStackNavigationProp<ProfileStackList, 'ProfileAccount'>;

/** Figma 683:12385 — placeholder until account settings are built */
export function ProfileAccountScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  return (
    <View style={ps.screen}>
      <ProfileStackHeader
        title="Account & security"
        onBack={() => navigation.goBack()}
      />
      <View style={[styles.body, {paddingBottom: insets.bottom + 24}]}>
        <Text style={styles.placeholder}>
          Account and security settings will be available here soon.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: SCREEN_H_PADDING,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
