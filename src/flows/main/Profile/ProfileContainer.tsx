import React, {useCallback, useMemo} from 'react';
import {Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {errorCodes, isErrorWithCode, pick} from '@react-native-documents/picker';
import {ProfileScreen} from './ProfileScreen';
import {DOCUMENT_TYPES} from './profileConstants';
import {useAuthStore} from '../../../stores/authStore';
import {postSignOut} from '../../../api/authApi';
import {
  documentMatchesUiKey,
  uiKeyToApiDocumentType,
  uploadFilenameForUiKey,
} from '../../../api/documentTypes';
import {
  getUserDetails,
  getUserDocuments,
  uploadDocuments,
} from '../../../api/userApi';
import {getApiErrorMessage} from '../../../api/client';
import {resolvePickedFileForUpload} from '../../../utils/pickedFile';
import {withLoader} from '../../../utils/loader';
import type {ProfileStackList} from '../../../navigation/ProfileStackNavigator';
import type {UserDocumentDto} from '../../../api/types';

type Nav = NativeStackNavigationProp<ProfileStackList, 'ProfileMain'>;

function mapDocuments(docs: UserDocumentDto[] | undefined) {
  return DOCUMENT_TYPES.map(def => {
    const match = (docs ?? []).find(d =>
      documentMatchesUiKey(d.documentType, def.key, d.filename),
    );
    const uploaded = !!match;
    return {
      key: def.key,
      label: def.label,
      uploaded,
      status: uploaded ? 'Uploaded PDF' : 'Not uploaded',
    };
  });
}

function calcCompletion(profile: {
  qualification?: string;
  grades?: string;
  destinations?: string;
}): number {
  const checks = [
    !!profile.qualification,
    !!profile.grades,
    !!profile.destinations,
  ];
  const done = checks.filter(Boolean).length;
  if (done === 0) return 65;
  return Math.round((done / checks.length) * 100);
}

export function ProfileContainer() {
  const navigation = useNavigation<Nav>();
  const qc = useQueryClient();
  const {user, signOut} = useAuthStore();
  const isAuth = !!user;

  const {data: details} = useQuery({
    queryKey: ['user', 'details'],
    queryFn: getUserDetails,
    enabled: isAuth,
    staleTime: 5 * 60 * 1000,
  });

  const {data: documents, refetch: refetchDocs} = useQuery({
    queryKey: ['user', 'documents'],
    queryFn: getUserDocuments,
    enabled: isAuth,
    staleTime: 2 * 60 * 1000,
  });

  const u = details?.user ?? user;
  const sp = details?.studentProfile;

  const fullName = useMemo(
    () => [u?.firstName, u?.lastName].filter(Boolean).join(' ') || 'Student',
    [u?.firstName, u?.lastName],
  );

  const avatarInitial = u?.firstName?.charAt(0)?.toUpperCase() ?? '?';

  const countryLabel = useMemo(() => {
    const c = u?.country ?? sp?.nationality ?? '';
    return c ? `🇳🇬 ${c}` : '🇳🇬 Nigeria';
  }, [u?.country, sp?.nationality]);

  const academic = useMemo(
    () => ({
      qualification: sp?.highestQualification ?? 'A - Levels',
      subjects: sp?.gradesObtained?.split('|')[0] ?? 'CS, Maths, Physics',
      grades: sp?.gradesObtained?.includes('/')
        ? sp.gradesObtained
        : sp?.gradesObtained
          ? undefined
          : '3.8/4.0',
      graduationYear: sp?.preferredIntake?.slice(0, 4) ?? '2024',
    }),
    [sp],
  );

  const studyPrefs = useMemo(
    () => ({
      countries: sp?.preferredDestination ?? '🇺🇸 USA, 🇬🇧 UK, 🇨🇦 CA',
      field: sp?.gradesObtained?.split('|')[1] ?? 'CS, Maths, Physics',
      budget: sp?.budgetCurrency
        ? `${sp.budgetCurrency} tier`
        : '$6000-$12000/yr',
    }),
    [sp],
  );

  const completionPct = useMemo(
    () =>
      calcCompletion({
        qualification: sp?.highestQualification,
        grades: sp?.gradesObtained,
        destinations: sp?.preferredDestination,
      }),
    [sp],
  );

  const completionHint = useMemo(() => {
    if (completionPct >= 100) return 'Profile complete — great job!';
    return `Profile ${completionPct}% completed- and add grades to unlock more matches`;
  }, [completionPct]);

  const docRows = useMemo(() => mapDocuments(documents), [documents]);

  const counselor = useMemo(
    () => ({
      name: 'Kwame Mensah',
      role: 'MatchMyUni Verified Agent',
      location: 'Accra, Ghana',
      rating: '4.9',
      placed: '47 students placed',
      initials: 'KM',
    }),
    [],
  );

  const onSignOut = useCallback(async () => {
    await withLoader(async () => {
      try {
        await postSignOut();
      } catch (e) {
        Alert.alert(
          'Sign out',
          getApiErrorMessage(e, 'Could not reach server — signed out locally.'),
        );
      } finally {
        await signOut();
        qc.clear();
      }
    }, 'Signing out…');
  }, [qc, signOut]);

  const onUploadDocument = useCallback(
    async (key: string) => {
      const apiType = uiKeyToApiDocumentType(key);
      if (!apiType) {
        Alert.alert('Upload failed', 'Unsupported document type.');
        return;
      }
      try {
        const result = await pick({
          allowMultiSelection: false,
          type: ['application/pdf', 'image/jpeg', 'image/png'],
        });
        const picked = result[0];
        if (!picked?.uri) {
          return;
        }
        const local = await resolvePickedFileForUpload(picked);
        await withLoader(async () => {
          await uploadDocuments(apiType, [
            {
              uri: local.uri,
              name: uploadFilenameForUiKey(key, local.name),
              type: local.type,
            },
          ]);
          await refetchDocs();
        }, 'Uploading…');
        Alert.alert('Uploaded', 'Document uploaded successfully.');
      } catch (err) {
        if (!(isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED)) {
          Alert.alert('Upload failed', getApiErrorMessage(err, 'Could not upload file.'));
        }
      }
    },
    [refetchDocs],
  );

  return (
    <ProfileScreen
      fullName={fullName}
      email={u?.email ?? ''}
      countryLabel={countryLabel}
      avatarInitial={avatarInitial}
      completionPct={completionPct}
      completionHint={completionHint}
      academic={academic}
      studyPrefs={studyPrefs}
      documents={docRows}
      counselor={counselor}
      onEditProfile={() => navigation.navigate('EditProfile')}
      onStudyPreferences={() => navigation.navigate('StudyPreferences')}
      onUploadDocument={onUploadDocument}
      onNotifications={() => navigation.navigate('ProfileNotifications')}
      onAbout={() => navigation.navigate('ProfileAbout')}
      onAccount={() => navigation.navigate('ProfileAccount')}
      onHelp={() => navigation.navigate('ProfileHelp')}
      onLogout={onSignOut}
    />
  );
}
