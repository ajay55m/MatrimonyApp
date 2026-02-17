/**
 * @format
 */

import { AppRegistry } from 'react-native';
import 'text-encoding-polyfill'; // Ensure polyfill is available if installed, or define global.TextDecoder
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
