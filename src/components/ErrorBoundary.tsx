import React from 'react';
import {StyleSheet, Text, View, Pressable} from 'react-native';
import {colors} from '../utils/colors';
import {font, hPad, rad, space} from '../utils/sizes';

interface State {
  hasError: boolean;
  message: string;
}

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

/**
 * Catches render-time errors in the React tree and shows a branded
 * fallback instead of a white crash screen.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {hasError: false, message: ''};
  }

  static getDerivedStateFromError(err: Error): State {
    return {hasError: true, message: err?.message ?? 'Unknown error'};
  }

  componentDidCatch(err: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', err, info.componentStack);
  }

  handleReset = () => {
    this.setState({hasError: false, message: ''});
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.detail} numberOfLines={4}>
            {this.state.message}
          </Text>
          <Pressable style={styles.btn} onPress={this.handleReset}>
            <Text style={styles.btnText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: hPad(6),
  },
  emoji: {fontSize: 48, marginBottom: space.md},
  title: {
    fontSize: font.title,
    fontWeight: '700',
    color: colors.navy,
    textAlign: 'center',
    marginBottom: space.sm,
  },
  detail: {
    fontSize: font.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: space.xl,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: rad.full,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  btnText: {color: colors.white, fontWeight: '700', fontSize: font.body},
});
