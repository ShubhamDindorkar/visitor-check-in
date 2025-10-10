import { Text, View, StyleSheet, TouchableOpacity, Alert, Image, TextInput, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
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
        {authSuccess ? (
          // Show loading when authentication is successful and navigating
          <View style={styles.successContainer}>
            <ActivityIndicator size="large" color="#1C4B46" />
            <Text style={styles.successText}>Success! Redirecting...</Text>
          </View>
      ) : activeTab === 'signup' ? (
        // Signup screen takes full screen without content wrapper
        <>
          {/* Sign Up Screen */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.signupContainer}
          >
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.signupScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Top Section with Dark Teal Background */}
              <View style={styles.signupTopSection}>
                {/* Medical Cross Icon */}
                <View style={styles.signupIconContainer}>
                  <Ionicons name="medical" size={32} color="white" />
                </View>

                {/* Title */}
                <Text style={styles.signupTitle}>Create Your</Text>
                <Text style={styles.signupTitle}>Account</Text>

                {/* Subtitle */}
                <Text style={styles.signupSubtitle}>
                  Join us for secure, simple, smarter visitor management for your needs.
                </Text>
              </View>

              {/* White Form Container */}
              <View style={styles.signupFormContainer}>
                {/* Name Input */}
                <View style={styles.signupInputWrapper}>
                  <Text style={styles.signupInputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.signupInput}
                    placeholder="Enter your full name"
                    placeholderTextColor="#A0A0A0"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>

                {/* Email Input */}
                <View style={styles.signupInputWrapper}>
                  <Text style={styles.signupInputLabel}>Email</Text>
                  <TextInput
                    style={styles.signupInput}
                    placeholder="Enter your email address"
                    placeholderTextColor="#A0A0A0"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>

                {/* Password Input */}
                <View style={styles.signupInputWrapper}>
                  <Text style={styles.signupInputLabel}>Password</Text>
                  <View style={styles.signupPasswordContainer}>
                    <TextInput
                      style={styles.signupInput}
                      placeholder="Create a strong password"
                      placeholderTextColor="#A0A0A0"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                    <TouchableOpacity 
                      style={styles.signupEyeIconButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off" : "eye"} 
                        size={22} 
                        color="#8B9E9C" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Continue Button */}
                <TouchableOpacity 
                  style={[styles.signupContinueButton, isLoading && styles.continueButtonDisabled]} 
                  onPress={handleEmailSignUp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.signupContinueButtonText}>Create Account</Text>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.signupDividerContainer}>
                  <View style={styles.signupDividerLine} />
                  <Text style={styles.signupDividerText}>Or</Text>
                  <View style={styles.signupDividerLine} />
                </View>

                {/* Google Login Button */}
                <TouchableOpacity 
                  style={[styles.signupGoogleButton, isLoading && styles.buttonDisabled]} 
                  onPress={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <Image 
                    source={require("../assets/images/icons8-google-48.png")} 
                    style={styles.signupSocialIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.signupSocialButtonText}>Continue with Google</Text>
                </TouchableOpacity>

                {/* Footer */}
                <View style={styles.signupFooter}>
                  <Text style={styles.signupFooterText}>Already have an account? </Text>
                  <TouchableOpacity 
                    onPress={() => setActiveTab('login')}
                    disabled={isLoading}
                  >
                    <Text style={styles.signupSignInText}>Sign in</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </>
      ) : (
        // Login screen with content wrapper
        <View style={styles.content}>
          <>
            {/* Tree Logo */}
            <View style={styles.iconContainer}>
              <Image 
                source={require("../assets/images/tree-logo.png")} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {/* Title */}
            <Text style={styles.title}>Hello Again,</Text>
            <Text style={styles.title}>Let's Get You</Text>
            <Text style={styles.title}>Signed In</Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.emailInput}
                placeholder="Enter your email address"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.emailInput}
                placeholder="Enter your password"
                placeholderTextColor="#A0A0A0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity 
                style={styles.eyeIconButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={22} 
                  color="#8B9E9C" 
                />
              </TouchableOpacity>
            </View>

            {/* Continue Button */}
              <TouchableOpacity 
              style={[styles.continueButton, isLoading && styles.continueButtonDisabled]} 
              onPress={handleEmailSignIn}
                disabled={isLoading}
              >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.continueButtonText}>Continue</Text>
              )}
              </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or</Text>
              <View style={styles.dividerLine} />
            </View>
        
            {/* Google Login Button */}
            <TouchableOpacity 
              style={[styles.googleButton, isLoading && styles.buttonDisabled]} 
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Image 
                source={require("../assets/images/icons8-google-48.png")} 
                style={styles.socialIcon}
                resizeMode="contain"
              />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account yet? </Text>
              <TouchableOpacity 
                onPress={() => setActiveTab('signup')}
                disabled={isLoading}
              >
                <Text style={styles.signUpText}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </>
            </View>
        )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  content: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 28,
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#1C4B46",
    textAlign: "center",
    lineHeight: 42,
  },
  inputContainer: {
    marginTop: 40,
    marginBottom: 16,
  },
  passwordInputContainer: {
    marginBottom: 16,
    position: "relative",
  },
  emailInput: {
    width: "100%",
    height: 56,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 28,
    paddingHorizontal: 24,
    fontSize: 16,
    backgroundColor: "white",
    color: "#333",
  },
  eyeIconButton: {
    position: "absolute",
    right: 20,
    top: 17,
  },
  continueButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#1C4B46",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#1C4B46",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonDisabled: {
    backgroundColor: "#8B9E9C",
    shadowOpacity: 0.1,
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D0D0D0",
  },
  dividerText: {
    marginHorizontal: 20,
    fontSize: 15,
    color: "#9E9E9E",
    fontWeight: "500",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 15,
    color: "#6B6B6B",
    fontWeight: "400",
  },
  signUpText: {
    fontSize: 15,
    color: "#1C4B46",
    fontWeight: "700",
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
    color: "#1C4B46",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  // Signup Screen Styles
  signupContainer: {
    flex: 1,
    backgroundColor: "#1C4B46",
  },
  signupScrollContent: {
    flexGrow: 1,
  },
  signupTopSection: {
    backgroundColor: "#1C4B46",
    paddingTop: 50,
    paddingHorizontal: 28,
    paddingBottom: 50,
  },
  signupIconContainer: {
    marginBottom: 24,
  },
  signupTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    lineHeight: 38,
  },
  signupSubtitle: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 22,
    opacity: 0.9,
  },
  signupFormContainer: {
    backgroundColor: "#FAFAFA",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingTop: 40,
    paddingHorizontal: 28,
    paddingBottom: 60,
    minHeight: '65%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  signupInputWrapper: {
    marginBottom: 20,
  },
  signupInputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2E",
    marginBottom: 8,
  },
  signupInput: {
    width: "100%",
    height: 56,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 28,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: "white",
    color: "#333",
  },
  signupPasswordContainer: {
    position: "relative",
  },
  signupEyeIconButton: {
    position: "absolute",
    right: 20,
    top: 17,
  },
  signupContinueButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#1C4B46",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 24,
    shadowColor: "#1C4B46",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signupContinueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  signupDividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  signupDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D0D0D0",
  },
  signupDividerText: {
    marginHorizontal: 20,
    fontSize: 15,
    color: "#9E9E9E",
    fontWeight: "500",
  },
  signupGoogleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  signupSocialIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  signupSocialButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  signupFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  signupFooterText: {
    fontSize: 15,
    color: "#6B6B6B",
    fontWeight: "400",
  },
  signupSignInText: {
    fontSize: 15,
    color: "#1C4B46",
    fontWeight: "700",
  },
});
