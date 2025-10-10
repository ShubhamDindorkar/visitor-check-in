import { Text, View, StyleSheet, TouchableOpacity, Alert, Image, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { 
  GoogleSignin, 
  statusCodes,
  isErrorWithCode,
  isSuccessResponse,
  isNoSavedCredentialFoundResponse
} from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, getAuth, signInWithCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '@react-native-firebase/auth';

export default function Login() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  // Clear form fields when switching tabs to prevent buffering
  useEffect(() => {
    setEmail('');
    setPassword('');
    setFullName('');
    setShowPassword(false);
  }, [activeTab]);

  // Reset auth success state when component mounts
  useEffect(() => {
    setAuthSuccess(false);
  }, []);

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
      setIsLoading(true);
      // Use Firebase authentication with Google (configuration is already done in AppDelegate)
      const firebaseUser = await onGoogleButtonPress();
      
      console.log('User signed in with Firebase:', firebaseUser);
      // Set success state to hide forms before navigation
      setAuthSuccess(true);
      // Use replace to prevent back navigation and eliminate flickering
      router.replace("/welcome");
    } catch (error) {
      console.log('Sign in error:', error);
      setIsLoading(false);
      
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

  const handleEmailSignUp = async () => {
    if (!fullName.trim()) {
      Alert.alert('Required', 'Please enter your full name');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter your email');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Required', 'Please enter a password');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Invalid', 'Password must be at least 6 characters');
      return;
    }

    try {
      setIsLoading(true);
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's profile with their full name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: fullName.trim()
        });
      }
      
      console.log('User created successfully:', userCredential.user);
      // Set success state to hide forms before navigation
      setAuthSuccess(true);
      // Use replace to prevent back navigation and eliminate flickering
      router.replace("/welcome");
    } catch (error: any) {
      console.log('Sign up error:', error);
      setIsLoading(false);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'This email is already registered. Please login instead.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Error', 'Password is too weak');
      } else {
        Alert.alert('Error', 'Failed to create account. Please try again.');
      }
    }
  };

  const handleEmailSignIn = async () => {
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter your email');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Required', 'Please enter a password');
      return;
    }

    try {
      setIsLoading(true);
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in successfully:', userCredential.user);
      // Set success state to hide forms before navigation
      setAuthSuccess(true);
      // Use replace to prevent back navigation and eliminate flickering
      router.replace("/welcome");
    } catch (error: any) {
      console.log('Sign in error:', error);
      setIsLoading(false);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Invalid email or password');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'Invalid email address');
      } else {
        Alert.alert('Error', 'Failed to sign in. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {authSuccess ? (
          // Show loading when authentication is successful and navigating
          <View style={styles.successContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.successText}>Success! Redirecting...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
            
            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'login' && styles.activeTab]}
                onPress={() => setActiveTab('login')}
                disabled={isLoading}
              >
                <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
                onPress={() => setActiveTab('signup')}
                disabled={isLoading}
              >
                <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
        
        {/* Google Sign In Option */}
            <TouchableOpacity 
              style={[styles.googleButton, isLoading && styles.buttonDisabled]} 
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Image 
                source={require("../assets/images/icons8-google-48.png")} 
                style={styles.googleIcon}
                resizeMode="contain"
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

        {/* Forms */}
        {activeTab === 'signup' && (
          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter password (min 6 characters)"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={24} 
                    color="#8E8E93" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
              onPress={handleEmailSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'login' && (
          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={24} 
                    color="#8E8E93" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
              onPress={handleEmailSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2C2C2E",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "400",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8E8E93",
  },
  activeTabText: {
    color: "#2C2C2E",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2E",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "500",
  },
  formContainer: {
    width: "100%",
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2E",
    marginBottom: 8,
  },
  textInput: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "white",
    color: "#000",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "white",
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000",
  },
  eyeIcon: {
    paddingHorizontal: 12,
    height: "100%",
    justifyContent: "center",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0.05,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  successText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#4CAF50",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
