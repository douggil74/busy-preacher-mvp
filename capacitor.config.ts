import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.busychristian.app',
  appName: 'The Busy Christian',
  webDir: 'www',
  server: {
    url: 'https://thebusychristianapp.com',
    cleartext: true
  }
};

export default config;
