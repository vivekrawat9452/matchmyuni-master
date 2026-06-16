import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Alert} from 'react-native';
import {useNavigation, CommonActions} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PreparingScreen} from './PreparingScreen';
import {postSignupWithPreferences} from '../../../api/authApi';
import {patchStudentProfile} from '../../../api/userApi';
import {getApiErrorMessage} from '../../../api/client';
import {getHealth} from '../../../api/publicApi';
import {getStudyDestinationCountries} from '../../../api/studyDestinationCountries';
import {buildPreferencesFromOnboarding} from '../../../utils/recommendationMappers';
import {useAuthStore} from '../../../stores/authStore';
import {useOnboardingStore} from '../../../stores/onboardingStore';
import {en} from '../../../utils/strings/en';
import {SIGNUP_TUTORIAL_PENDING_KEY} from '../../tutorial/tutorialConstants';

const STUDY_KEY = 'mm_study_interests';
const BUDGET_KEY = 'mm_budget_tier';
/** Minimum time on preparing UI before entering app + tutorial */
const PREPARING_MIN_MS = 2500;

export function PreparingContainer() {
  const navigation = useNavigation();
  const setSession = useAuthStore(s => s.setSession);
  const resetOnboarding = useOnboardingStore(s => s.reset);
  const [msg, setMsg] = useState<string | undefined>(undefined);
  const ran = useRef(false);
  const mountedAt = useRef(Date.now());

  const handleError = useCallback(
    (e: unknown) => {
      const m = getApiErrorMessage(e, en.errors.generic);
      Alert.alert('Sign up', m, [
        {
          text: 'OK',
          onPress: () => {
            ran.current = false;
            navigation.dispatch(CommonActions.goBack());
          },
        },
      ]);
    },
    [navigation],
  );

  useEffect(() => {
    if (ran.current) {
      return;
    }
    ran.current = true;

    (async () => {
      try {
        setMsg('Verifying service…');
        const draft = useOnboardingStore.getState();

        // Health check is optional — never block signup on it
        try {
          await getHealth();
        } catch(e) {
          console.log('error_001', e);

          /* non-critical */
        }

        const countries = await getStudyDestinationCountries();

        const prefsPayload = buildPreferencesFromOnboarding(draft, countries);
        if (!prefsPayload) {
          throw new Error('Complete study interests, destinations, timeline, and budget to continue.');
        }

        setMsg('Creating your account…');
        const {user, session} = await postSignupWithPreferences(
          {
            email: draft.email,
            firstName: draft.firstName,
            lastName: draft.lastName,
            country: draft.countryName,
            countryCode: draft.countryCode,
            contact: draft.contact,
            password: draft.password,
          },
          prefsPayload,
        );

        const idToName = new Map(countries.map(c => [c.id, c.name] as const));
        const dest = draft.countryIds
          .map(i => idToName.get(i))
          .filter(Boolean)
          .join(', ');

        setMsg('Saving your profile…');
        try {
          await patchStudentProfile({
            preferredDestination: dest || undefined,
            preferredIntake: draft.timeline ?? undefined,
            budgetTier: draft.budgetTier ?? undefined,
            budgetCurrency: 'USD',
            contact: draft.contact,
            countryCode: draft.countryCode,
          });
        } catch (profileErr) {
          // Profile update is optional — account is already created
          console.warn('[Preparing] Profile update failed (non-fatal):', profileErr);
        }

        await Promise.all([
          AsyncStorage.setItem(STUDY_KEY, JSON.stringify(draft.studyTags)),
          AsyncStorage.setItem(BUDGET_KEY, draft.budgetTier ?? ''),
          AsyncStorage.setItem(SIGNUP_TUTORIAL_PENDING_KEY, '1'),
        ]);

        const remaining = PREPARING_MIN_MS - (Date.now() - mountedAt.current);
        if (remaining > 0) {
          await new Promise<void>(resolve => setTimeout(resolve, remaining));
        }

        resetOnboarding();

        await setSession({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          user,
        });
      } catch (e) {
        handleError(e);
        console.log('error_009', e);
      }
    })();
  }, [handleError, resetOnboarding, setSession]);

  return <PreparingScreen message={msg} />;
}
