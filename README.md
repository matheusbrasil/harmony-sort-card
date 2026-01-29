# HarmonCards

HarmonCards is a small study game/app for practicing scales and harmony by sorting cards into the correct order.

## Stack

- Expo (React Native runtime)
- React 18 + React Native 0.73
- TypeScript
- NativeWind + Tailwind CSS
- tonal for music theory helpers
- react-native-draggable-flatlist, react-native-gesture-handler, react-native-reanimated

## Local development & testing

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Expo dev server:
   ```bash
   npm run start
   ```
3. Run on a target:
   ```bash
   npm run ios
   npm run android
   npm run web
   ```

## Deployment

This app is built with Expo, so you can use Expo Application Services (EAS) to build and distribute releases.

1. Install the EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log in and configure the project:
   ```bash
   eas login
   eas build:configure
   ```
3. Build a release for your target platform:
   ```bash
   eas build --platform ios
   eas build --platform android
   ```

For web deployments, you can export a static build and host it on any static hosting provider:

```bash
npx expo export --platform web
```

Then deploy the generated `dist/` folder to your preferred host.
