jest.mock('./src/hooks/useAuthHydrated', () => ({
  useAuthHydrated: () => true,
}));

jest.mock('react-native-gesture-handler', () => {
  const {View} = require('react-native');
  return {
    GestureHandlerRootView: View,
  };
});

jest.mock('react-native-screens', () => {
  const {View} = require('react-native');
  return {
    enableScreens: () => undefined,
    enableFreeze: () => undefined,
    screensEnabled: () => true,
    freezeEnabled: () => true,
    Screen: View,
    ScreenContainer: View,
    ScreenStack: View,
    ScreenStackItem: View,
    InnerScreen: View,
    SearchBar: View,
    FullWindowOverlay: View,
    ScreenFooter: View,
    ScreenContentWrapper: View,
    ScreenContext: ({}),
    useTransitionProgress: () => ({}),
    isSearchBarAvailableForCurrentPlatform: false,
    executeNativeBackPress: () => false,
    compatibilityFlags: {isNewScreenImplemented: true},
    featureFlags: {},
    Tabs: View,
  };
});

const mockAsyncStorage = new Map();
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (key) => mockAsyncStorage.get(key) ?? null,
    setItem: async (key, value) => {
      mockAsyncStorage.set(key, value);
    },
    removeItem: async (key) => {
      mockAsyncStorage.delete(key);
    },
    clear: async () => {
      mockAsyncStorage.clear();
    },
  },
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: fn => {
    fn({isConnected: true, type: 'wifi', isInternetReachable: true});
    return () => undefined;
  },
  fetch: () => Promise.resolve({isConnected: true, type: 'wifi', isInternetReachable: true}),
}));

jest.mock('axios', () => {
  const inst = {
    get: jest.fn(() => Promise.resolve({data: {status: 'success', data: {}}})),
    post: jest.fn(() => Promise.resolve({data: {status: 'success', data: {}}})),
    patch: jest.fn(() => Promise.resolve({data: {status: 'success', data: {}}})),
    interceptors: {
      request: {use: jest.fn(() => 0)},
      response: {use: jest.fn(() => 0)},
    },
  };
  return {
    __esModule: true,
    default: {create: () => inst},
  };
});

jest.mock('react-native-responsive-screen', () => ({
  widthPercentageToDP: p => p * 3.5,
  heightPercentageToDP: p => p * 8,
}));

jest.mock('react-native-reanimated', () => {
  const {View} = require('react-native');
  return {default: {call: () => {}}, createAnimatedComponent: c => c, Value: () => ({})};
});

jest.mock('react-native-linear-gradient', () => {
  const {View} = require('react-native');
  return {LinearGradient: View};
});

jest.mock('react-native-svg', () => {
  const {View} = require('react-native');
  return {Svg: View, Path: View, G: View, Circle: View, Rect: View, Defs: View, LinearGradient: View, Stop: View};
});

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const {View} = require('react-native');
  const C = () => React.createElement(View);
  return new Proxy({}, {get: () => C});
});
