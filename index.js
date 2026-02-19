/**
 * @format
 */

import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import { AppRegistry } from 'react-native';
import App from './App';

// Use JS-based screens to avoid RNSScreenStack native component issues
enableScreens(false);
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
