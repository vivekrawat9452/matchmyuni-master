import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {registerLoaderListener} from '../utils/loader';
import {colors} from '../utils/colors';
import {font, rad} from '../utils/sizes';

/**
 * Full-screen translucent overlay loader.
 * Mount once inside <NavigationContainer> in AppRoot.
 */
export function GlobalLoader() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  const listener = useCallback((v: boolean, msg?: string) => {
    setVisible(v);
    setMessage(msg);
  }, []);

  useEffect(() => {
    return registerLoaderListener(listener);
  }, [listener]);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
      onRequestClose={() => {/* overlay is not dismissible */}}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={colors.primary} />
          {message ? <Text style={styles.msg}>{message}</Text> : null}
        </View>
      </View>
    </Modal>
  );
}

/**
 * Inline (in-screen) loading indicator — use inside screens while data loads.
 */
export function InlineLoader({message}: {message?: string}) {
  return (
    <View style={styles.inline}>
      <ActivityIndicator size="small" color={colors.primary} />
      {message ? <Text style={styles.inlineMsg}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    paddingVertical: 28,
    paddingHorizontal: 36,
    alignItems: 'center',
    minWidth: 140,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  msg: {
    marginTop: 14,
    fontSize: font.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 180,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  inlineMsg: {
    fontSize: font.caption,
    color: colors.textSecondary,
  },
});
