import { CapacitorConfig } from '@capacitor/cli';

// Set to 'development' for local testing, 'production' for App Store builds
const mode = 'production';

const config: CapacitorConfig = {
  appId: 'com.busychristian.app',
  appName: 'The Busy Christian App',
  webDir: 'www',

  // Server configuration based on mode
  server: mode === 'development'
    ? {
        // LOCAL DEV MODE: Use network IP so iOS simulator/device can access
        url: 'http://192.168.1.31:3000',
        cleartext: true
      }
    : {
        // PRODUCTION MODE: Use live website (with www to avoid redirect)
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
