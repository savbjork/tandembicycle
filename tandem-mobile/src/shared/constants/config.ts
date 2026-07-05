// Dev-only auto sign-in. EXPO_PUBLIC_TEST_AUTOLOGIN is set by the npm
// start/ios/android scripts, never in production builds; credentials come
// from the gitignored .env.
export const TEST_AUTOLOGIN = process.env.EXPO_PUBLIC_TEST_AUTOLOGIN === 'true';
export const TEST_EMAIL = process.env.EXPO_PUBLIC_TEST_EMAIL ?? '';
export const TEST_PASSWORD = process.env.EXPO_PUBLIC_TEST_PASSWORD ?? '';
