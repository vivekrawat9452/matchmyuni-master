import React, {useMemo} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {AppRoot} from './src/navigation/AppRoot';
import {ErrorBoundary} from './src/components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
      gcTime: 5 * 60_000,
    },
    mutations: {
      retry: 0,
    },
  },
});

function App(): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';

  const statusBarStyle = useMemo(
    () => (isDark ? 'light-content' : 'dark-content'),
    [isDark],
  );

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={flex1}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <StatusBar
              barStyle={statusBarStyle}
              backgroundColor="transparent"
              translucent
            />
            <AppRoot />
          </SafeAreaProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const flex1 = {flex: 1} as const;

export default App;
