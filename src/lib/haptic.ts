/**
 * Hardware Haptic interface using native vibration channels
 * tailored for physical device responsiveness.
 */
export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' | 'error' = 'light') {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      switch (type) {
        case 'light':
          navigator.vibrate(10); // Ultra short tactile tick
          break;
        case 'medium':
          navigator.vibrate(25); // Definite click
          break;
        case 'success':
          navigator.vibrate([15, 30, 20]); // Light double-tap signature
          break;
        case 'warning':
          navigator.vibrate([40, 50, 40]); // Warning bounce
          break;
        case 'error':
          navigator.vibrate([60, 100, 60]); // Alert alert buzz
          break;
        default:
          navigator.vibrate(12);
      }
    } catch (e) {
      // Ignored for environments with restricted hardware permissions
    }
  }
}
