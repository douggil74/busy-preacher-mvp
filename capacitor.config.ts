import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.busychristian.app',
  appName: 'The Busy Christian',
  webDir: 'www',

  // Point to production website
  server: {
    url: 'https://thebusychristianapp.com',
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
      launchShowDuration: 10000,  // Show for 10 seconds
      backgroundColor: '#0f1729',
      showSpinner: false,  // No spinner, just the beautiful splash image
      launchAutoHide: false,  // Manual control - we'll hide it ourselves after exactly 10 seconds
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
