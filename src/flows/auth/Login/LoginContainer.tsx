import React, {useState, useCallback} from 'react';
import {Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {z} from 'zod';
import {LoginScreen} from './LoginScreen';
import {postLogin} from '../../../api/authApi';
import {probePartnerSession} from '../../../api/partnerApi';
import {getApiErrorMessage} from '../../../api/client';
import {useAuthStore} from '../../../stores/authStore';
import {appRoleFromUser} from '../../../utils/appRole';
import {en} from '../../../utils/strings/en';
import type {AuthStackParamList} from '../../../navigation/authTypes';

const emailSchema = z.string().email();

export function LoginContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Login'>>();
  const setSession = useAuthStore(s => s.setSession);
  const setRole = useAuthStore(s => s.setRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = useCallback(async () => {
    setErr(null);
    if (!emailSchema.safeParse(email).success) {
      setErr(en.errors.invalidEmail);
      return;
    }
    if (!password) {
      setErr('Password is required');
      return;
    }
    setLoading(true);
    try {
      const {user, session} = await postLogin({email, password});
      let navRole = appRoleFromUser(user);
      if (navRole === 'student') {
        const isPartner = await probePartnerSession();
        if (isPartner) {
          navRole = 'agent';
        }
      }
      setRole(navRole);
      await setSession({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        user: {...user, role: navRole === 'agent' ? 'agent' : user.role ?? 'student'},
      });
    } catch (e) {
      const msg = getApiErrorMessage(e, en.errors.generic);
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }, [email, password, setSession, setRole]);

  return (
    <LoginScreen
      email={email}
      password={password}
      onChangeEmail={t => { setEmail(t); setErr(null);}}
      onChangePassword={t => { setPassword(t); setErr(null);}}
      onSubmit={onSubmit}
      onBack={() => navigation.goBack()}
      onForgotPassword={() => navigation.navigate('ForgotPassword')}
      loading={loading}
      error={err}
    />
  );
}
