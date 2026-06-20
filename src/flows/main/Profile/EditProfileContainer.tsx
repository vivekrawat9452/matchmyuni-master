import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {EditProfileScreen} from './EditProfileScreen';
import {getUserDetails, patchStudentProfile} from '../../../api/userApi';
import {getApiErrorMessage} from '../../../api/client';
import {withLoader} from '../../../utils/loader';
import {useAuthStore} from '../../../stores/authStore';
import type {ProfileStackList} from '../../../navigation/ProfileStackNavigator';

type Nav = NativeStackNavigationProp<ProfileStackList, 'EditProfile'>;

function countryFlagFor(name: string): string {
  const flags: Record<string, string> = {
    Nigeria: '🇳🇬',
    India: '🇮🇳',
    Ghana: '🇬🇭',
    'United Kingdom': '🇬🇧',
    UK: '🇬🇧',
    USA: '🇺🇸',
    'United States': '🇺🇸',
    Canada: '🇨🇦',
  };
  return flags[name] ?? '🌍';
}

export function EditProfileContainer() {
  const navigation = useNavigation<Nav>();
  const qc = useQueryClient();
  const storeUser = useAuthStore(s => s.user);

  const {data: details} = useQuery({
    queryKey: ['user', 'details'],
    queryFn: getUserDetails,
    staleTime: 5 * 60 * 1000,
  });

  const u = details?.user ?? storeUser;
  const sp = details?.studentProfile;

  const [firstName, setFirstName] = useState(u?.firstName ?? '');
  const [lastName, setLastName] = useState(u?.lastName ?? '');
  const [email, setEmail] = useState(u?.email ?? '');
  const [countryCode, setCountryCode] = useState(u?.countryCode ?? '+1');
  const [contact, setContact] = useState(u?.contact ?? '');
  const [country, setCountry] = useState(u?.country ?? sp?.nationality ?? '');
  const [saving, setSaving] = useState(false);

  const countryFlag = useMemo(
    () => countryFlagFor(country || sp?.nationality || 'Nigeria'),
    [country, sp?.nationality],
  );

  useEffect(() => {
    if (!u) return;
    setFirstName(u.firstName ?? '');
    setLastName(u.lastName ?? '');
    setEmail(u.email ?? '');
    setCountryCode(u.countryCode ?? '+1');
    setContact(u.contact ?? '');
    setCountry(u.country ?? sp?.nationality ?? '');
  }, [u, sp?.nationality]);

  const onEditAvatar = useCallback(() => {
    // Avatar upload API not available yet — keep handler for later wiring
    Alert.alert('Coming soon', 'Profile photo upload will be available in a future update.');
  }, []);

  const onSave = useCallback(async () => {
    setSaving(true);
    try {
      await withLoader(async () => {
        // PATCH /student-profiles/update — contact fields only today.
        // firstName, lastName, country: UI kept per Figma; wire when user-update API exists.
        await patchStudentProfile({
          countryCode,
          contact,
        });
        await qc.invalidateQueries({queryKey: ['user', 'details']});
      }, 'Saving…');
      Alert.alert('Profile updated', 'Your changes have been saved.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Update failed', getApiErrorMessage(e, 'Could not save profile.'));
    } finally {
      setSaving(false);
    }
  }, [countryCode, contact, navigation, qc]);

  return (
    <EditProfileScreen
      firstName={firstName}
      lastName={lastName}
      email={email}
      countryCode={countryCode}
      contact={contact}
      country={country}
      countryFlag={countryFlag}
      avatarInitial={firstName.charAt(0).toUpperCase() || '?'}
      onChangeFirstName={setFirstName}
      onChangeLastName={setLastName}
      onChangeEmail={setEmail}
      onChangeCountryCode={setCountryCode}
      onChangeContact={setContact}
      onChangeCountry={setCountry}
      onEditAvatar={onEditAvatar}
      onBack={() => navigation.goBack()}
      onSave={onSave}
      saving={saving}
    />
  );
}
