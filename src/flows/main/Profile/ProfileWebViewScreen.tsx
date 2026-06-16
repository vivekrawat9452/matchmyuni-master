import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {WebView} from 'react-native-webview';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp, NativeStackScreenProps} from '@react-navigation/native-stack';
import {ProfileStackHeader} from './components/ProfileStackHeader';
import {PROFILE_WEB_URLS} from './profileConstants';
import {colors} from '../../../utils/colors';
import {profileStyles as ps} from './profileStyles';
import type {ProfileStackList} from '../../../navigation/ProfileStackNavigator';

type AboutRoute = NativeStackScreenProps<ProfileStackList, 'ProfileAbout'>;
type HelpRoute = NativeStackScreenProps<ProfileStackList, 'ProfileHelp'>;

export function ProfileWebViewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackList>>();
  const route = useRoute<AboutRoute['route'] | HelpRoute['route']>();

  const title =
    route.name === 'ProfileAbout'
      ? 'About'
      : route.name === 'ProfileHelp'
        ? 'Help & support'
        : 'Page';

  const url =
    route.name === 'ProfileAbout'
      ? PROFILE_WEB_URLS.about
      : route.name === 'ProfileHelp'
        ? PROFILE_WEB_URLS.help
        : PROFILE_WEB_URLS.about;

  return (
    <View style={ps.screen}>
      <ProfileStackHeader title={title} onBack={() => navigation.goBack()} />
      <WebView
        source={{uri: url}}
        style={styles.web}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  web: {flex: 1, backgroundColor: colors.background},
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
