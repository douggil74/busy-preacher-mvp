import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.busychristian.app',
  appName: 'The Busy Christian',
  webDir: 'out',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0f172a'
  }
};

export default config;
