import { StyleSheet, Text, View, Alert } from 'react-native';
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import VisitorDashboard from '../dashboard/VisitorDashboard';

import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
  User,
  isErrorWithCode,
  isSuccessResponse,
  isNoSavedCredentialFoundResponse,
} from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  FirebaseAuthTypes,
} from '@react-native-firebase/auth';

// Google Sign-In configuration will be done in useEffect
async function onGoogleButtonPress() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const signInResult = await GoogleSignin.signIn();

  let idToken: string | undefined;
  if (isSuccessResponse(signInResult)) {
    idToken = signInResult.data?.idToken || undefined;
  } else {
    idToken =
      (signInResult as any).idToken ||
      (signInResult as any).data?.idToken ||
      undefined;
  }

  if (!idToken) {
    throw new Error('No ID token found in sign-in result');
  }

  const googleCredential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(getAuth(), googleCredential);
}

const GoogleAuth = forwardRef<any, any>((props, ref) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] =
    useState<FirebaseAuthTypes.User | null>(null);
  const [isSigninInProgress, setIsSigninInProgress] = useState(false);

  useImperativeHandle(ref, () => ({
    signIn: signIn,
  }));

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '234537435099-e92anfafr71uka98e4sodaehd0ljpgjk.apps.googleusercontent.com',
      iosClientId:
        '234537435099-cpea3c79v7md1mclvgqcc8bmsj6krb4n.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });

    const unsubscribe = onAuthStateChanged(getAuth(), (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      if (firebaseUser) {
        getCurrentUser();
      } else {
        setUser(null);
      }
    });

    getCurrentUser();

    return () => unsubscribe();
  }, []);

  const getCurrentUser = async () => {
    try {
      const response = await GoogleSignin.signInSilently();
      if (isSuccessResponse(response as any)) {
        setUser((response as any).data);
      } else if (isNoSavedCredentialFoundResponse(response as any)) {
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

      const firebaseUser = await onGoogleButtonPress();

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
      await Promise.all([
        GoogleSignin.signOut(),
        firebaseSignOut(getAuth()),
      ]);
      setUser(null);
      Alert.alert('Success', 'Signed out successfully!');
    } catch (error) {
      console.log('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const getUserDisplayInfo = () => {
    if (user) {
      return {
        name: user.user.name || 'User',
        email: user.user.email || '',
      };
    }
    if (firebaseUser) {
      return {
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
      };
    }
    return { name: 'User', email: '' };
  };

  const userInfo = getUserDisplayInfo();

  return (
    <View style={styles.container}>
      {user || firebaseUser ? (
        <VisitorDashboard
          userName={userInfo.name}
          userEmail={userInfo.email}
          onSignOut={signOut}
        />
      ) : (
        <View style={styles.signInContainer}>
          <Text style={styles.appTitle}>Visitor Check-In</Text>
          <Text style={styles.appSubtitle}>Sign in to continue</Text>
          <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={signIn}
            disabled={isSigninInProgress}
            style={styles.signInButton}
          />
        </View>
      )}
    </View>
  );
});

export default GoogleAuth;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 40,
    textAlign: 'center',
  },
  signInButton: {
    width: 280,
    height: 50,
    borderRadius: 8,
  },
});
