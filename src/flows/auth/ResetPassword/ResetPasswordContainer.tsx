import React, {useState, useCallback, useMemo} from 'react';
import {Alert} from 'react-native';
import {useNavigation, useRoute, CommonActions} from '@react-navigation/native';
import type {NativeStackNavigationProp, NativeStackScreenProps} from '@react-navigation/native-stack';
import {ResetPasswordScreen} from './ResetPasswordScreen';
import type {PasswordChecks} from './ResetPasswordScreen';
import {postResetPassword} from '../../../api/authApi';
import {getApiErrorMessage} from '../../../api/client';
import {en} from '../../../utils/strings/en';
import type {AuthStackParamList} from '../../../navigation/authTypes';

type RouteProps = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>['route'];

function analyze(pw: string): PasswordChecks {
  return {
    len: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    num: /[0-9]/.test(pw),
    spec: /[^A-Za-z0-9]/.test(pw),
  };
}

function meetsApi(pw: string) {
  return pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw);
}

export function ResetPasswordContainer() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>>();
  const route = useRoute<RouteProps>();

  // Token comes from deep-link params; if absent the user must paste it manually
  const initialToken = route.params?.token ?? '';
  const showTokenInput = !route.params?.token;

  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checks = useMemo(() => analyze(password), [password]);

  const canSubmit = useMemo(
    () =>
      token.trim().length > 0 &&
      meetsApi(password) &&
      checks.spec &&
      password === confirm,
    [token, password, confirm, checks],
  );

  const onChangePassword = useCallback((t: string) => {
    setPassword(t);
    setError(null);
  }, []);

  const onChangeConfirm = useCallback((t: string) => {
    setConfirm(t);
    setError(null);
  }, []);

  const onSubmit = useCallback(async () => {
    if (!canSubmit) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await postResetPassword(token.trim(), password);
      Alert.alert(
        en.resetPassword.successTitle,
        en.resetPassword.successBody,
        [
          {
            text: 'Sign in',
            onPress: () =>
              navigation.dispatch(
                CommonActions.reset({
                  index: 1,
                  routes: [{name: 'Welcome'}, {name: 'Login'}],
                }),
              ),
          },
        ],
        {cancelable: false},
      );
    } catch (e) {
      setError(getApiErrorMessage(e, en.errors.generic));
    } finally {
      setLoading(false);
    }
  }, [canSubmit, token, password, navigation]);

  return (
    <ResetPasswordScreen
      token={token}
      onChangeToken={setToken}
      showTokenInput={showTokenInput}
      password={password}
      onChangePassword={onChangePassword}
      showPw={showPw}
      onTogglePw={() => setShowPw(s => !s)}
      confirm={confirm}
      onChangeConfirm={onChangeConfirm}
      showConfirm={showConfirm}
      onToggleConfirm={() => setShowConfirm(s => !s)}
      checks={checks}
      onSubmit={onSubmit}
      onBack={() => navigation.goBack()}
      loading={loading}
      error={error}
      canSubmit={canSubmit}
    />
  );
}
