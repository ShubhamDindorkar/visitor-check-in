import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import * as Linking from 'expo-linking';
import firestore from '@react-native-firebase/firestore';

export default function RootLayout() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
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
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      setUser(user);
      
      if (user) {
        // Check if user has completed their profile
        setIsCheckingProfile(true);
        try {
          const userDoc = await firestore()
            .collection('users')
            .doc(user.uid)
            .get();
          
          const userData = userDoc.data();
          const profileComplete = userData?.isProfileComplete === true;
          setIsProfileComplete(profileComplete);
          
          console.log("Profile check:", { 
            uid: user.uid, 
            profileComplete,
            hasDefaultPatient: !!userData?.defaultPatientName 
          });
        } catch (error) {
          console.error("Error checking profile:", error);
          setIsProfileComplete(false);
        } finally {
          setIsCheckingProfile(false);
        }
      } else {
        setIsProfileComplete(false);
        setIsCheckingProfile(false);
      }
      
      setIsLoading(false);
    });

    // Handle deep links (for QR code scanning outside the app)
    const handleDeepLink = ({ url }: { url: string }) => {
      console.log('Deep link received:', url);
      if (url.includes('quick-checkin')) {
        // Navigate to quick-checkin page
        router.push('/quick-checkin');
      }
    };

    // Listen for incoming deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      unsubscribe();
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isLoading || isCheckingProfile) return;

    const currentSegment = segments[0] as string;
    const isOnWelcome = currentSegment === 'welcome';
    const isOnUserType = currentSegment === 'user-type';
    const isOnVisitorDashboard = currentSegment === 'visitor-dashboard';
    const isOnEnquiryDashboard = currentSegment === 'enquiry-dashboard';
    const isOnAddPatient = currentSegment === 'add-patient';
    const isOnSelectPatient = currentSegment === 'select-patient';
    const isOnScanWithPatient = currentSegment === 'scan-with-patient';
    const isOnHelpAndSupport = currentSegment === 'help-and-support';
    const isOnScan = currentSegment === 'scan';
    const isOnLogin = currentSegment === 'login';
    const isOnManualSignIn = currentSegment === 'manual-signin';
    const isOnEntry = currentSegment === 'entry';
    const isOnQuickCheckin = currentSegment === 'quick-checkin';
    const isOnReceptionQr = currentSegment === 'reception-qr';
    const isOnIndex = !currentSegment;

    // Protected screens that require authentication
    const isOnProtectedScreen = isOnUserType || isOnVisitorDashboard || isOnEnquiryDashboard || isOnAddPatient || isOnSelectPatient || isOnScanWithPatient || isOnHelpAndSupport || isOnScan || isOnQuickCheckin || isOnReceptionQr;
    // Allow welcome and entry screens for both authenticated and manual users
    const isOnAllowedScreen = isOnWelcome || isOnEntry;

    if (user && (isOnLogin || isOnIndex)) {
      // User is signed in but on login/index screen
      if (isProfileComplete) {
        // Profile is complete, go to user type selection
        router.replace('/user-type');
      } else {
        // Profile not complete, go to welcome for setup
        router.replace('/welcome');
      }
    } else if (user && isOnWelcome && isProfileComplete) {
      // User is on welcome but profile is already complete, redirect to user type selection
      router.replace('/user-type');
    } else if (!user && isOnProtectedScreen) {
      // User is not signed in but trying to access protected screen, redirect to index
      router.replace('/');
    }
    // Note: We're NOT redirecting from welcome or entry screens for non-authenticated users
    // This allows manual sign-in users to access these screens
  }, [user, segments, isLoading, isCheckingProfile, isProfileComplete]);

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
