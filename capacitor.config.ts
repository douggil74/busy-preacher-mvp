import { CapacitorConfig } from '@capacitor/cli';

// Environment configuration
// Production mode for App Store upload
const isDevelopment = false; // Use production URL for App Store
const serverUrl = isDevelopment
  ? 'http://localhost:3000'  // Local Next.js dev server
  : 'https://thebusychristianapp.com';

const config: CapacitorConfig = {
  appId: 'com.busychristian.app',
  appName: 'The Busy Christian',
  webDir: 'www',

  // Server configuration - point to web app URL
  server: isDevelopment ? {
    url: serverUrl,
    cleartext: true, // Allow HTTP in development
    androidScheme: 'http'
  } : {
    url: serverUrl,
    cleartext: false // HTTPS only in production
  },

  // iOS specific configuration
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#1a1a1a'
  },

  // Plugin configuration
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,  // Show for 2 seconds
      backgroundColor: '#1a1a1a',
      showSpinner: true,
      spinnerColor: '#FFD700',
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small',
      launchAutoHide: true,
      splashFullScreen: false,
      splashImmersive: false
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
