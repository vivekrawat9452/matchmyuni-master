import React, {useCallback, useMemo, useState} from 'react';
import {Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {AddStudentBasicScreen} from './AddStudentBasicScreen';
import {AddStudentProgramsScreen, type StudentDraft} from './AddStudentProgramsScreen';
import {AddStudentSuccessScreen} from './AddStudentSuccessScreen';
import {
  addPartnerStudentShortlist,
  createPartnerStudent,
  createPartnerStudentApplication,
  getPartnerApplication,
  getPartnerStudentRecommendations,
} from '../../../../api/partnerApi';
import {getCourseFilters} from '../../../../api/publicApi';
import {getApiErrorMessage} from '../../../../api/client';
import type {AgentStudentsStackList} from '../../../../navigation/AgentStudentsStackNavigator';
import {
  AGENT_COUNTRIES,
  DEFAULT_AGENT_COUNTRY,
  type AgentCountryItem,
} from './agentCountries';

type Step = 'basic' | 'programs' | 'success';

export function AddStudentContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AgentStudentsStackList>>();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>('basic');
  const [userId, setUserId] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [applicationRef, setApplicationRef] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<AgentCountryItem>(DEFAULT_AGENT_COUNTRY);
  const [selectedCountry, setSelectedCountry] = useState<AgentCountryItem>(DEFAULT_AGENT_COUNTRY);
  const [courseCategory, setCourseCategory] = useState('');

  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);

  const filtersQuery = useQuery({
    queryKey: ['courseFilters'],
    queryFn: getCourseFilters,
    staleTime: 10 * 60 * 1000,
  });

  const categories = useMemo(
    () => (filtersQuery.data?.categories ?? []).map(c => c.label || c.value).filter(Boolean),
    [filtersQuery.data?.categories],
  );

  const recommendationsQuery = useQuery({
    queryKey: ['partner', 'student', userId, 'recommendations', 'add-flow'],
    queryFn: () => getPartnerStudentRecommendations(userId!, {page: 1, limit: 20}),
    enabled: step === 'programs' && userId != null,
    staleTime: 60 * 1000,
  });

  const applicationQuery = useQuery({
    queryKey: ['partner', 'application', applicationId],
    queryFn: () => getPartnerApplication(applicationId!),
    enabled: step === 'success' && applicationId != null,
    staleTime: 60 * 1000,
  });

  const filteredCountries = useMemo(() => {
    const q = countrySearch.toLowerCase().trim();
    if (!q) return AGENT_COUNTRIES;
    return AGENT_COUNTRIES.filter(
      c => c.name.toLowerCase().includes(q) || c.dialCode.includes(q),
    );
  }, [countrySearch]);

  const draft: StudentDraft = useMemo(
    () => ({
      firstName,
      lastName,
      email,
      phone: `${phoneCountry.dialCode} ${phone}`.trim(),
      country: selectedCountry.name,
      courseCategory,
    }),
    [courseCategory, email, firstName, lastName, phone, phoneCountry.dialCode, selectedCountry.name],
  );

  const createStudentMutation = useMutation({
    mutationFn: createPartnerStudent,
    onSuccess: result => {
      if (!result?.userId) {
        Alert.alert('Add student', 'Student created but no user id returned.');
        return;
      }
      setUserId(result.userId);
      setStep('programs');
    },
    onError: (e: unknown) => {
      Alert.alert('Add student', getApiErrorMessage(e, 'Could not create student.'));
    },
  });

  const submitApplicationMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !selectedCourseId) {
        throw new Error('Select a program first.');
      }
      const course = recommendationsQuery.data?.courses.find(c => c.courseId === selectedCourseId);
      await addPartnerStudentShortlist(userId, {
        courseId: selectedCourseId,
        matchScore: course?.matchScore,
      });
      return createPartnerStudentApplication(userId, {courseId: selectedCourseId});
    },
    onSuccess: result => {
      if (!result?.id) {
        Alert.alert('Submit application', 'Application submitted but no id returned.');
        return;
      }
      setApplicationId(result.id);
      setApplicationRef(result.reference ?? null);
      setStep('success');
      void queryClient.invalidateQueries({queryKey: ['partner', 'students']});
      void queryClient.invalidateQueries({queryKey: ['partner', 'dashboard']});
    },
    onError: (e: unknown) => {
      Alert.alert('Submit application', getApiErrorMessage(e, 'Could not submit application.'));
    },
  });

  const onContinue = useCallback(() => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Add student', 'Please fill in all required fields.');
      return;
    }
    if (!courseCategory) {
      Alert.alert('Add student', 'Please select a course category.');
      return;
    }
    createStudentMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      country: selectedCountry.name,
      countryCode: phoneCountry.dialCode,
      contact: phone.trim(),
      intendedField: courseCategory,
    });
  }, [
    courseCategory,
    createStudentMutation,
    email,
    firstName,
    lastName,
    phone,
    phoneCountry.dialCode,
    selectedCountry.name,
  ]);

  const onBack = useCallback(() => {
    if (step === 'programs') {
      setStep('basic');
      return;
    }
    if (step === 'success') {
      navigation.goBack();
      return;
    }
    navigation.goBack();
  }, [navigation, step]);

  const onTrack = useCallback(() => {
    if (!applicationId) return;
    navigation.replace('StudentApplication', {applicationId});
  }, [applicationId, navigation]);

  const onBackHome = useCallback(() => {
    navigation.popToTop();
  }, [navigation]);

  if (step === 'programs') {
    return (
      <AddStudentProgramsScreen
        draft={draft}
        courses={recommendationsQuery.data?.courses ?? []}
        recommendationsMessage={recommendationsQuery.data?.message}
        selectedCourseId={selectedCourseId}
        loading={recommendationsQuery.isLoading}
        submitting={submitApplicationMutation.isPending}
        onSelectCourse={setSelectedCourseId}
        onEdit={() => setStep('basic')}
        onSubmit={() => submitApplicationMutation.mutate()}
        onBack={onBack}
      />
    );
  }

  if (step === 'success') {
    return (
      <AddStudentSuccessScreen
        application={applicationQuery.data}
        reference={applicationRef}
        loading={applicationQuery.isLoading}
        onTrack={onTrack}
        onBackHome={onBackHome}
      />
    );
  }

  return (
    <AddStudentBasicScreen
      firstName={firstName}
      lastName={lastName}
      email={email}
      phone={phone}
      selectedCountry={selectedCountry}
      phoneCountry={phoneCountry}
      courseCategory={courseCategory}
      categories={categories}
      categoriesLoading={filtersQuery.isLoading}
      countryPickerVisible={countryPickerVisible}
      countrySearch={countrySearch}
      filteredCountries={filteredCountries}
      categoryPickerVisible={categoryPickerVisible}
      loading={createStudentMutation.isPending}
      onChangeFirstName={setFirstName}
      onChangeLastName={setLastName}
      onChangeEmail={setEmail}
      onChangePhone={setPhone}
      onOpenCountryPicker={() => {
        setCountrySearch('');
        setCountryPickerVisible(true);
      }}
      onCloseCountryPicker={() => setCountryPickerVisible(false)}
      onCountrySearch={setCountrySearch}
      onSelectCountry={country => {
        setSelectedCountry(country);
        setPhoneCountry(country);
        setCountryPickerVisible(false);
      }}
      onOpenCategoryPicker={() => setCategoryPickerVisible(true)}
      onCloseCategoryPicker={() => setCategoryPickerVisible(false)}
      onSelectCategory={cat => {
        setCourseCategory(cat);
        setCategoryPickerVisible(false);
      }}
      onContinue={onContinue}
      onBack={onBack}
    />
  );
}
