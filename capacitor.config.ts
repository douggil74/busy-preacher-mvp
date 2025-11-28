import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.busychristian.app',
  appName: 'The Busy Christian App',
  webDir: 'www',

  // LOCAL DEV MODE: Use network IP so iOS simulator/device can access
  server: {
    url: 'http://192.168.1.31:3000',
    cleartext: true
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
      launchShowDuration: 0,  // No native splash - use web splash only
      backgroundColor: '#0f1729',
      showSpinner: false,
      launchAutoHide: true,
      splashFullScreen: false,
      splashImmersive: false,
      androidSplashResourceName: 'splash'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '689195108551-8v3f7e0l9q4h4k6h5j6f7g8h9j0k1l2m.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
