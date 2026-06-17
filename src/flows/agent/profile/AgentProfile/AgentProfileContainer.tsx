import React, {useCallback} from 'react';
import {Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {AgentProfileScreen} from './AgentProfileScreen';
import {getPartnerMe} from '../../../../api/partnerApi';
import {useAuthStore} from '../../../../stores/authStore';
import type {AgentProfileStackList} from '../../../../navigation/AgentProfileStackNavigator';

export function AgentProfileContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AgentProfileStackList>>();
  const signOut = useAuthStore(s => s.signOut);

  const {data, isLoading, refetch, isRefetching} = useQuery({
    queryKey: ['partner', 'me'],
    queryFn: getPartnerMe,
    staleTime: 60 * 1000,
  });

  const onNotifications = useCallback(() => {
    navigation.navigate('ProfileNotifications');
  }, [navigation]);

  const onAccountSecurity = useCallback(() => {
    navigation.navigate('AccountSecurity');
  }, [navigation]);

  const onLogout = useCallback(() => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => void signOut(),
      },
    ]);
  }, [signOut]);

  return (
    <AgentProfileScreen
      profile={data}
      loading={isLoading}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      onNotifications={onNotifications}
      onAccountSecurity={onAccountSecurity}
      onLogout={onLogout}
    />
  );
}
