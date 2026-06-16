/**
 * Lightweight global loader bus.
 *
 * Usage:
 *   import {showLoader, hideLoader} from '../utils/loader';
 *
 *   showLoader();          // shows the full-screen overlay
 *   showLoader('Saving…'); // shows overlay with a message
 *   hideLoader();          // hides it
 *
 * The <GlobalLoader /> component in AppRoot subscribes to this bus.
 */

type Listener = (visible: boolean, message?: string) => void;

let _listener: Listener | null = null;
let _visible = false;
let _message: string | undefined;

export function registerLoaderListener(fn: Listener) {
  _listener = fn;
  // Fire immediately so the component syncs with any state set before mount
  fn(_visible, _message);
  return () => {
    if (_listener === fn) {
      _listener = null;
    }
  };
}

export function showLoader(message?: string) {
  _visible = true;
  _message = message;
  _listener?.(_visible, _message);
}

export function hideLoader() {
  _visible = false;
  _message = undefined;
  _listener?.(_visible, _message);
}

/**
 * Wraps an async function: shows loader before, hides after (even on error).
 */
export async function withLoader<T>(
  fn: () => Promise<T>,
  message?: string,
): Promise<T> {
  showLoader(message);
  try {
    return await fn();
  } finally {
    hideLoader();
  }
}
