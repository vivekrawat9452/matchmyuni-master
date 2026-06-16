module.exports = {
  presets: ['module:@react-native/babel-preset'],
  /** Reanimated 3.x — must be last. Use 3.x with legacy arch; Reanimated 4 requires new arch. */
  plugins: [
    '@babel/plugin-transform-export-namespace-from',
    'react-native-reanimated/plugin',
  ],
};
