# Briefdex

Daily audio markets briefing app for New Zealand investors. React Native + Expo.

## Setup

Requires Node 18+ and the Expo CLI.

```bash
npm install
npx expo start
```

Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

## Architecture

- `App.tsx` — entry, loads Playfair Display / DM Sans / DM Mono fonts then mounts the navigator.
- `src/theme/tokens.ts` — single source of truth for colours, fonts, spacing, radii, shadows, typography.
- `src/contexts/AppContext.tsx` — user, onboarding state, survey answers, persisted via AsyncStorage.
- `src/services/audioService.ts` — expo-av wrapper with background playback, mock-mode fallback when no audio URL.
- `src/navigation/AppNavigator.tsx` — routes between onboarding stack and the main app (Home/Profile + Player modal).
- `src/screens/onboarding/OnboardingNavigator.tsx` — 16-screen onboarding stack. Paywall has `gestureEnabled: false`.

## Adding real audio

Replace the empty `audioUrl` on `DAILY_WRAP` in `src/data/placeholders.ts` with an MP3 URL. The audio service falls back to a mock progress timer when no URL is present so the UI is fully demoable without a backend.

## Notes

- Hard paywall is enforced via `gestureEnabled: false` on the Paywall screen. The only forward action is "Start 7-day free trial".
- Reset state at any time from Profile → "Log out", which clears AsyncStorage and re-runs onboarding.
- RevenueCat integration (`react-native-purchases`) is installed but not wired — drop SDK config into the paywall handler when ready.
