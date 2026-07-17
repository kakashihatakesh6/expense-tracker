

if (__DEV__) {
  // Suppress warnings from expo-notifications about Expo Go support
  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      (args[0].includes('expo-notifications') || args[0].includes('Expo Go'))
    ) {
      // Silence warning
      return;
    }
    originalConsoleWarn(...args);
  };

  // Suppress the Android push notifications error inside Expo Go
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      args[0].includes('expo-notifications')
    ) {
      // Silence error
      return;
    }
    originalConsoleError(...args);
  };
}
