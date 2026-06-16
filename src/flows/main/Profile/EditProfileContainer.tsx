import React, {useCallback, useEffect, useState} from 'react';
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

  const [firstName, setFirstName] = useState(u?.firstName ?? '');
  const [lastName, setLastName] = useState(u?.lastName ?? '');
  const [email, setEmail] = useState(u?.email ?? '');
  const [countryCode, setCountryCode] = useState(u?.countryCode ?? '+1');
  const [contact, setContact] = useState(u?.contact ?? '');
  const [country, setCountry] = useState(u?.country ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!u) return;
    setFirstName(u.firstName ?? '');
    setLastName(u.lastName ?? '');
    setEmail(u.email ?? '');
    setCountryCode(u.countryCode ?? '+1');
    setContact(u.contact ?? '');
    setCountry(u.country ?? '');
  }, [u]);

  const onSave = useCallback(async () => {
    setSaving(true);
    try {
      await withLoader(async () => {
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
      avatarInitial={firstName.charAt(0).toUpperCase() || '?'}
      onChangeFirstName={setFirstName}
      onChangeLastName={setLastName}
      onChangeEmail={setEmail}
      onChangeCountryCode={setCountryCode}
      onChangeContact={setContact}
      onChangeCountry={setCountry}
      onBack={() => navigation.goBack()}
      onSave={onSave}
      saving={saving}
    />
  );
}
