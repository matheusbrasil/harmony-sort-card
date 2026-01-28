import './reanimated-polyfill';
import 'expo/build/Expo.fx';
import registerRootComponent from 'expo/build/launch/registerRootComponent';
import App from './App';

// Force NativeWind / CSS interop to use class-based dark mode on web
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('dark');
  document.body.classList.add('dark');
}

registerRootComponent(App);
