import {Platform} from 'react-native';

const web = Platform.OS === 'web',
  android = Platform.OS === 'android',
  ios = Platform.OS === 'ios';

export {web, android, ios};
