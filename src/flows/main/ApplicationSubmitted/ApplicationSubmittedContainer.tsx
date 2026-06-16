import React, {useCallback} from 'react';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {ApplicationSubmittedScreen} from './ApplicationSubmittedScreen';
import type {AppStackList} from '../../../navigation/AppStackNavigator';

type Props = NativeStackScreenProps<AppStackList, 'ApplicationSubmitted'>;

export function ApplicationSubmittedContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackList>>();
  const route = useRoute<Props['route']>();
  const {courseName, universityName} = route.params;

  const onViewApplications = useCallback(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'Tabs',
            state: {
              index: 2,
              routes: [
                {name: 'Home'},
                {name: 'DiscoverTab'},
                {name: 'ApplicationTab'},
                {name: 'MessageTab'},
                {name: 'ProfileTab'},
              ],
            },
          },
        ],
      }),
    );
  }, [navigation]);

  const onDone = useCallback(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'Tabs'}],
      }),
    );
  }, [navigation]);

  return (
    <ApplicationSubmittedScreen
      courseName={courseName}
      universityName={universityName}
      onViewApplications={onViewApplications}
      onDone={onDone}
    />
  );
}
