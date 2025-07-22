// Import Firebase modules
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB5Zej9z39XCLq4GGeA0QeVGi4p1Cz395Q",
  authDomain: "blood-donor-app-de7f5.firebaseapp.com",
  projectId: "blood-donor-app-de7f5",
  messagingSenderId: "641362219929",
  appId: "1:496138306418:android:64d5d6111969c2bc1653eb",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Enable persistence for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);

// Export for use in your app
export { auth, db };
