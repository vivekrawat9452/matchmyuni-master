import React, {useCallback, useState} from 'react';
import {Alert, Linking} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import {StudentProfileScreen} from './StudentProfileScreen';
import {getPartnerStudent, getPartnerStudentRecommendations} from '../../../../api/partnerApi';
import type {AgentStudentsStackList} from '../../../../navigation/AgentStudentsStackNavigator';
import type {ProfileCompletenessItemDto} from '../../../../api/partnerTypes';

export function StudentProfileContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AgentStudentsStackList>>();
  const route = useRoute<RouteProp<AgentStudentsStackList, 'StudentProfile'>>();
  const {userId} = route.params;
  const [chaseItem, setChaseItem] = useState<ProfileCompletenessItemDto | null>(null);

  const {data, isLoading, refetch, isRefetching} = useQuery({
    queryKey: ['partner', 'student', userId],
    queryFn: () => getPartnerStudent(userId),
    staleTime: 60 * 1000,
  });

  const recommendationsQuery = useQuery({
    queryKey: ['partner', 'student', userId, 'recommendations'],
    queryFn: () => getPartnerStudentRecommendations(userId, {page: 1, limit: 10}),
    staleTime: 2 * 60 * 1000,
  });

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  const onApplicationPress = useCallback(
    (applicationId: string) => {
      navigation.navigate('StudentApplication', {applicationId});
    },
    [navigation],
  );

  const onActionUpload = useCallback(
    (applicationId: string) => {
      navigation.navigate('StudentApplication', {applicationId});
    },
    [navigation],
  );

  const onChasePress = useCallback((item: ProfileCompletenessItemDto) => {
    if (item.chaseable) {
      setChaseItem(item);
    }
  }, []);

  const onWhatsApp = useCallback(() => {
    const phone = data?.user.phone;
    if (!phone) {
      Alert.alert('WhatsApp', 'No phone number on file.');
      return;
    }
    void Linking.openURL(`https://wa.me/${phone.replace(/\D/g, '')}`);
  }, [data?.user.phone]);

  const onChaseConfirm = useCallback(() => {
    const phone = data?.user.phone;
    if (phone) {
      const msg = encodeURIComponent(
        `Hi ${data?.user.name}, please upload: ${chaseItem?.label}`,
      );
      void Linking.openURL(`https://wa.me/${phone.replace(/\D/g, '')}?text=${msg}`);
    } else {
      Alert.alert('Chase student', `Reminder sent for: ${chaseItem?.label}`);
    }
    setChaseItem(null);
  }, [chaseItem, data?.user.name, data?.user.phone]);

  const onChaseDismiss = useCallback(() => setChaseItem(null), []);

  const onRefresh = useCallback(() => {
    void refetch();
    void recommendationsQuery.refetch();
  }, [refetch, recommendationsQuery]);

  return (
    <StudentProfileScreen
      detail={data}
      recommendations={recommendationsQuery.data?.courses ?? []}
      recommendationsLoading={recommendationsQuery.isLoading}
      loading={isLoading}
      refreshing={isRefetching || recommendationsQuery.isRefetching}
      onRefresh={onRefresh}
      onBack={onBack}
      onApplicationPress={onApplicationPress}
      onActionUpload={onActionUpload}
      onChasePress={onChasePress}
      onWhatsApp={onWhatsApp}
      chaseItem={chaseItem}
      onChaseConfirm={onChaseConfirm}
      onChaseDismiss={onChaseDismiss}
    />
  );
}
