import { StyleSheet, Text, View, Alert, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { 
  GoogleSignin, 
  GoogleSigninButton, 
  statusCodes,
  User,
  isErrorWithCode,
  isSuccessResponse,
  isNoSavedCredentialFoundResponse,
  isCancelledResponse
} from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, getAuth, signInWithCredential, signOut as firebaseSignOut, onAuthStateChanged, FirebaseAuthTypes } from '@react-native-firebase/auth';

// Google Sign-In configuration will be done in useEffect

async function onGoogleButtonPress() {
  // Check if your device supports Google Play
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  
  // Get the users ID token
  const signInResult = await GoogleSignin.signIn();

  // Handle different response formats
  let idToken: string | undefined;
  
  if (isSuccessResponse(signInResult)) {
    // New format (v13+)
    idToken = signInResult.data?.idToken || undefined;
  } else {
    // Legacy format or direct access
    idToken = (signInResult as any).idToken || (signInResult as any).data?.idToken || undefined;
  }
  
  if (!idToken) {
    throw new Error('No ID token found in sign-in result');
  }

  // Create a Google credential with the token
  const googleCredential = GoogleAuthProvider.credential(idToken);

  // Sign-in the user with the credential
  return signInWithCredential(getAuth(), googleCredential);
}

const GoogleAuth = forwardRef<any, any>((props, ref) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isSigninInProgress, setIsSigninInProgress] = useState(false);

  useImperativeHandle(ref, () => ({
    signIn: signIn
  }));

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '234537435099-cpea3c79v7md1mclvgqcc8bmsj6krb4n.apps.googleusercontent.com',
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });

    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(getAuth(), (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      if (firebaseUser) {
        // Get Google user info when Firebase user is available
        getCurrentUser();
      } else {
        setUser(null);
      }
    });

    // Check if user is already signed in
    getCurrentUser();

    return () => unsubscribe();
  }, []);

  const getCurrentUser = async () => {
    try {
      const response = await GoogleSignin.signInSilently();
      if (isSuccessResponse(response as any)) {
        setUser((response as any).data);
      } else if (isNoSavedCredentialFoundResponse(response as any)) {
        // user has not signed in yet, or they have revoked access
        console.log('No saved credentials found');
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        console.log('Error getting current user:', error.code);
      } else {
        console.log('Unknown error getting current user');
      }
    }
  };

  const signIn = async () => {
    try {
      setIsSigninInProgress(true);
      
      // Use Firebase authentication with Google
      const firebaseUser = await onGoogleButtonPress();
      
      // Get Google Sign-In user info for display
      const googleUser = await GoogleSignin.getCurrentUser();
      if (googleUser) {
        setUser(googleUser);
        console.log('User signed in with Firebase:', firebaseUser);
        console.log('Google user info:', googleUser);
        Alert.alert('Success', 'Signed in successfully!');
      }
    } catch (error) {
      console.log('Sign in error:', error);
      
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            Alert.alert('In Progress', 'Sign in is already in progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert('Error', 'Play services not available');
            break;
          case statusCodes.SIGN_IN_CANCELLED:
            Alert.alert('Cancelled', 'Sign in was cancelled');
            break;
          default:
            Alert.alert('Error', 'Something went wrong with sign in');
        }
      } else {
        Alert.alert('Error', 'An error occurred during sign in');
      }
    } finally {
      setIsSigninInProgress(false);
    }
  };

  const signOut = async () => {
    try {
      // Sign out from both Google and Firebase
      await Promise.all([
        GoogleSignin.signOut(),
        firebaseSignOut(getAuth())
      ]);
      setUser(null);
      Alert.alert('Success', 'Signed out successfully!');
    } catch (error) {
      console.log('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  return (
    <View style={styles.container}>
      {(user || firebaseUser) ? (
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Welcome!</Text>
          {user && (
            <>
              <Text style={styles.userName}>{user.user.name}</Text>
              <Text style={styles.userEmail}>{user.user.email}</Text>
            </>
          )}
          {firebaseUser && !user && (
            <>
              <Text style={styles.userName}>{firebaseUser.displayName || 'User'}</Text>
              <Text style={styles.userEmail}>{firebaseUser.email}</Text>
            </>
          )}
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={signIn}
          disabled={isSigninInProgress}
          style={styles.signInButton}
        />
      )}
    </View>
  );
});

export default GoogleAuth;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#555',
  },
  userEmail: {
    fontSize: 14,
    color: '#777',
    marginBottom: 20,
  },
  signInButton: {
    width: 280,
    height: 50,
    borderRadius: 8,
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    minWidth: 120,
  },
  signOutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});