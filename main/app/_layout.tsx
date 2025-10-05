import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

export default function RootLayout() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '234537435099-e92anfafr71uka98e4sodaehd0ljpgjk.apps.googleusercontent.com',
      iosClientId: '234537435099-cpea3c79v7md1mclvgqcc8bmsj6krb4n.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const currentSegment = segments[0] as string;
    const isOnWelcome = currentSegment === 'welcome';
    const isOnHelpAndSupport = currentSegment === 'help-and-support';
    const isOnScan = currentSegment === 'scan';
    const isOnLogin = currentSegment === 'login';
    const isOnManualSignIn = currentSegment === 'manual-signin';
    const isOnEntry = currentSegment === 'entry';
    const isOnIndex = !currentSegment;

    // Protected screens that require authentication
    const isOnProtectedScreen = isOnHelpAndSupport || isOnScan;
    // Allow welcome and entry screens for both authenticated and manual users
    const isOnAllowedScreen = isOnWelcome || isOnEntry;

    if (user && (isOnLogin || isOnIndex)) {
      // User is signed in but on login/index screen, redirect to welcome
      router.replace('/welcome');
    } else if (!user && isOnProtectedScreen) {
      // User is not signed in but trying to access truly protected screen, redirect to index
      router.replace('/');
    }
    // Note: We're NOT redirecting from welcome or entry screens for non-authenticated users
    // This allows manual sign-in users to access these screens
  }, [user, segments, isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
