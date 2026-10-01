import { registerRootComponent } from 'expo';

const App = process.env.EXPO_PUBLIC_GENOVA_090_CONNECTED_AUDIO === '1'
  ? require('./src/acceptance/090_connected-audio-runtime').default
  : process.env.EXPO_PUBLIC_GENOVA_090_WEBVIEW_ACCEPTANCE === '1'
  ? require('./src/acceptance/090_webview-runtime').default
  : process.env.EXPO_PUBLIC_GENOVA_090_PDF_ACCEPTANCE === '1'
  ? require('./src/acceptance/090_native-pdf-runtime').default
  : process.env.EXPO_PUBLIC_GENOVA_090_AUDIO_ACCEPTANCE === '1'
  ? require('./src/acceptance/090_audio-runtime').default
  : process.env.EXPO_PUBLIC_GENOVA_093_ACCEPTANCE === '1'
  ? require('./src/acceptance/093_android-private-r2').default
  : process.env.EXPO_PUBLIC_GENOVA_033_ACCEPTANCE === '1'
    ? require('./src/acceptance/composed-webview-runtime').default
    : require('./App').default;

registerRootComponent(App);
