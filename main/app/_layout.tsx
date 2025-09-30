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

    const isOnWelcome = segments[0] === 'welcome';

    if (user && !isOnWelcome) {
      // User is signed in but not on welcome screen, redirect to welcome
      router.replace('/welcome');
    } else if (!user && isOnWelcome) {
      // User is not signed in but on welcome screen, redirect to index
      router.replace('/');
    }
  }, [user, segments, isLoading]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
    </Stack>
  );
}
