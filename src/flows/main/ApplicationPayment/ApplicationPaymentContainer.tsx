import React, {useCallback} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {ApplicationPaymentScreen} from './ApplicationPaymentScreen';
import type {AppStackList} from '../../../navigation/AppStackNavigator';

type Props = NativeStackScreenProps<AppStackList, 'ApplicationPayment'>;

export function ApplicationPaymentContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackList>>();
  const route = useRoute<Props['route']>();
  const {courseName, applicationFee, currencySymbol = '$', universityName} = route.params;

  const feeLabel = `${currencySymbol}${applicationFee}`;

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  const onContinue = useCallback(() => {
    navigation.replace('ApplicationSubmitted', {
      courseName,
      universityName,
      applicationId: route.params.applicationId,
    });
  }, [navigation, courseName, universityName, route.params.applicationId]);

  return (
    <ApplicationPaymentScreen
      courseName={courseName}
      feeLabel={feeLabel}
      onBack={onBack}
      onContinue={onContinue}
    />
  );
}
