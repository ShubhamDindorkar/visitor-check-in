import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Image } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { 
  GoogleSignin, 
  statusCodes,
  isErrorWithCode,
  isSuccessResponse,
  isNoSavedCredentialFoundResponse
} from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';

export default function Login() {
  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '234537435099-cpea3c79v7md1mclvgqcc8bmsj6krb4n.apps.googleusercontent.com',
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });
  }, []);

  const handleBack = () => {
    router.back();
  };

  const onGoogleButtonPress = async () => {
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
  };

  const handleGoogleSignIn = async () => {
    try {
      // Use Firebase authentication with Google (configuration is already done in AppDelegate)
      const firebaseUser = await onGoogleButtonPress();
      
      console.log('User signed in with Firebase:', firebaseUser);
      Alert.alert('Success', 'Signed in successfully!');
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
    }
  };

  const handlePhoneSignIn = () => {
    // TODO: Implement phone number authentication
    console.log("Phone number sign in selected");
  };

  const handleNext = () => {
    router.push("/welcome");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.topBackButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={32} color="#007AFF" />
      </TouchableOpacity>

      {/* Next Button */}
      <TouchableOpacity style={styles.topNextButton} onPress={handleNext}>
        <Ionicons name="arrow-forward" size={32} color="#007AFF" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Choose Sign In Method</Text>
        <Text style={styles.subtitle}>Select how you'd like to proceed</Text>
        
        {/* Google Sign In Option */}
        <TouchableOpacity style={styles.authOption} onPress={handleGoogleSignIn}>
          <View style={styles.optionLeft}>
            <View style={styles.googleIcon}>
              <Image 
                source={require("../assets/images/icons8-google-48.png")} 
                style={styles.googleImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Continue with Google</Text>
              <Text style={styles.optionSubtitle}>Sign in with your Google account</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        </TouchableOpacity>

        {/* Phone Sign In Option */}
        <TouchableOpacity style={styles.authOption} onPress={handlePhoneSignIn}>
          <View style={styles.optionLeft}>
            <View style={styles.phoneIcon}>
              <Image 
                source={require("../assets/images/icons8-phone-50.png")} 
                style={styles.phoneImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Continue with Phone number</Text>
              <Text style={styles.optionSubtitle}>Sign in using email OTP verification</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white", // Full white background
  },
  content: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "center",
  },
  topBackButton: {
    position: "absolute",
    top: 60,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topNextButton: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C2C2E",
    marginBottom: 8,
    textAlign: "center",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 40,
    textAlign: "center",
    fontWeight: "400",
  },
  authOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  googleIcon: {
    marginRight: 16,
  },
  googleImage: {
    width: 40,
    height: 40,
  },
  phoneIcon: {
    marginRight: 16,
  },
  phoneImage: {
    width: 40,
    height: 40,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2E",
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
  },
});
