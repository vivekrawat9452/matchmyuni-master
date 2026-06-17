import React, {useCallback} from 'react';
import {Alert, Linking} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {StudentApplicationScreen} from '../../students/StudentApplication/StudentApplicationScreen';
import {
  acceptPartnerOffer,
  getPartnerApplication,
} from '../../../../api/partnerApi';
import {getApiErrorMessage} from '../../../../api/client';
import type {AgentApplicationsStackList} from '../../../../navigation/AgentApplicationsStackNavigator';

export function AgentApplicationDetailContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AgentApplicationsStackList>>();
  const route = useRoute<RouteProp<AgentApplicationsStackList, 'ApplicationDetail'>>();
  const {applicationId} = route.params;
  const queryClient = useQueryClient();

  const {data, isLoading, refetch, isRefetching} = useQuery({
    queryKey: ['partner', 'application', applicationId],
    queryFn: () => getPartnerApplication(applicationId),
    staleTime: 60 * 1000,
  });

  const acceptMutation = useMutation({
    mutationFn: () => acceptPartnerOffer(applicationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['partner', 'application', applicationId]});
      Alert.alert('Success', 'Offer marked as accepted.');
    },
    onError: (e: unknown) => {
      Alert.alert('Action failed', getApiErrorMessage(e, 'Could not complete action.'));
    },
  });

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  const onPrimaryAction = useCallback(() => {
    const cta = data?.actions.primaryCta?.toLowerCase() ?? '';
    if (cta.includes('accept')) {
      acceptMutation.mutate();
      return;
    }
    Alert.alert('Action', data?.actions.primaryCta ?? 'Action');
  }, [acceptMutation, data?.actions.primaryCta]);

  const onWhatsApp = useCallback(() => {
    const phone = data?.student.phone;
    if (!phone) {
      Alert.alert('WhatsApp', 'No phone number on file.');
      return;
    }
    void Linking.openURL(`https://wa.me/${phone.replace(/\D/g, '')}`);
  }, [data?.student.phone]);

  const onContactUniversity = useCallback(() => {
    Alert.alert('Contact university', 'University contact will open in your email app.');
  }, []);

  const onDownloadOffer = useCallback(() => {
    Alert.alert('Download', 'Offer letter download will be available when the file is ready.');
  }, []);

  return (
    <StudentApplicationScreen
      detail={data}
      loading={isLoading}
      refreshing={isRefetching}
      actionLoading={acceptMutation.isPending}
      onRefresh={() => void refetch()}
      onBack={onBack}
      onPrimaryAction={onPrimaryAction}
      onWhatsApp={onWhatsApp}
      onContactUniversity={onContactUniversity}
      onDownloadOffer={onDownloadOffer}
    />
  );
}
