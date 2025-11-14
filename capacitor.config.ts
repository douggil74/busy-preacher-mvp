import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.busychristian.app',
  appName: 'The Busy Christian',
  webDir: 'www',

  // PRODUCTION MODE: App loads from deployed website
  server: {
    url: 'https://www.thebusychristianapp.com',
    cleartext: false
  },

  // iOS specific configuration
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#0f1729',
    allowsLinkPreview: false  // Disable link previews for more native feel
  },

  // Plugin configuration
  plugins: {
    SplashScreen: {
      launchShowDuration: 500,  // Quick native splash
      backgroundColor: '#0f1729',
      showSpinner: false,
      launchAutoHide: true,  // Auto-hide so web splash takes over
      splashFullScreen: false,
      splashImmersive: false,
      androidSplashResourceName: 'splash'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
