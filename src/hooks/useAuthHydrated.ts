import {useEffect, useState} from 'react';
import {useAuthStore} from '../stores/authStore';

/** Wait for zustand-persist to rehydrate auth from AsyncStorage before routing. */
export function useAuthHydrated() {
  const [ready, setReady] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setReady(true);
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => setReady(true));
    return unsub;
  }, []);

  return ready;
}
