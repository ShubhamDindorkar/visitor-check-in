import { Text, View, StyleSheet, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator, Platform, ScrollView, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getAuth, signOut as firebaseSignOut } from '@react-native-firebase/auth';
import firestore from "@react-native-firebase/firestore";

export default function Welcome() {
  const { returnedMobileNumber, manualSignIn, fullName: manualFullName, email: manualEmail, phoneNumber: manualPhoneNumber } = useLocalSearchParams();
  const [userName, setUserName] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [patientName, setPatientName] = useState<string>("");
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const [isMobileFocused, setIsMobileFocused] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState<boolean>(false);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  
  // Removed auto profile check - users should only reach this screen from user-type selection

  useEffect(() => {
    // Handle manual sign-in data first
    if (manualSignIn === "true" && manualFullName) {
      setUserName(manualFullName.toString());
      setFullName(manualFullName.toString());
      // For manual sign-in, set a default email or leave empty since we removed email field
      setUserEmail(manualEmail ? manualEmail.toString() : "");
      if (manualPhoneNumber) {
        setMobileNumber(manualPhoneNumber.toString());
        setIsMobileFocused(true);
      }
    } else {
      // Fetch user name from Google/Firebase if not manual sign-in
      fetchUserName();
    }
    
    // Set mobile number if returned from checkout (this will override manual phone if both exist)
    if (returnedMobileNumber && typeof returnedMobileNumber === 'string') {
      setMobileNumber(returnedMobileNumber);
      setIsMobileFocused(true);
    }
  }, [returnedMobileNumber, manualSignIn, manualFullName, manualEmail, manualPhoneNumber]);

  // Profile check removed - users only reach this screen after selecting Visitor from user-type

  const fetchUserName = async () => {
    try {
      // First try to get the current Firebase user
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      
      if (firebaseUser && firebaseUser.displayName) {
        // Use full name for welcome message instead of just first name
        setUserName(firebaseUser.displayName);
        // Store full name for dropdown
        setFullName(firebaseUser.displayName);
        setUserEmail(firebaseUser.email || "");
        return;
      }

      // Fallback to Google Sign-In current user
      const googleUser = await GoogleSignin.getCurrentUser();
      if (googleUser && googleUser.user.name) {
        // Use full name for welcome message instead of just first name
        setUserName(googleUser.user.name);
        // Store full name for dropdown
        setFullName(googleUser.user.name);
        setUserEmail(googleUser.user.email || "");
      } else {
        setUserName("Visitor");
        setFullName("Visitor");
        setUserEmail("");
      }
    } catch (error) {
      console.log('Error fetching user name:', error);
      setUserName("Visitor");
      setFullName("Visitor");
      setUserEmail("");
    }
  };

    const handleMobileFocus = () => {
    setIsMobileFocused(true);
    if (!mobileNumber.startsWith("+91 ")) {
      setMobileNumber("+91 ");
    }
  };

  const handleMobileChange = (text: string) => {
    // Always keep +91 prefix
    if (!text.startsWith("+91 ")) {
      if (text.length === 0) {
        setMobileNumber("");
        setIsMobileFocused(false);
        return;
      }
      // If user tries to type without +91, add it
      text = "+91 " + text.replace(/^\+91\s*/, "");
    }
    
    // Remove any non-numeric characters after +91 
    const numberPart = text.slice(4).replace(/\D/g, "");
    
    // Limit to 10 digits after +91
    if (numberPart.length <= 10) {
      setMobileNumber("+91 " + numberPart);
    }
  };


  const saveProfileData = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        return;
      }

      // Save user profile to Firestore
      const profileData = {
        uid: user.uid,
        visitorName: fullName || userName || 'Visitor',
        visitorEmail: userEmail || user.email || '',
        visitorMobile: mobileNumber.trim(),
        defaultPatientName: patientName.trim(),
        isProfileComplete: true,
      };

      // If running on web, react-native-firebase native methods are not available.
      // Use Firestore REST API as a web-safe fallback.
      if (Platform.OS === 'web') {
        const token = await user.getIdToken();
        const now = new Date().toISOString();
        const fields: any = {
          uid: { stringValue: user.uid },
          visitorName: { stringValue: profileData.visitorName },
          visitorEmail: { stringValue: profileData.visitorEmail || '' },
          visitorMobile: { stringValue: profileData.visitorMobile },
          defaultPatientName: { stringValue: profileData.defaultPatientName },
          isProfileComplete: { booleanValue: true },
          createdAt: { timestampValue: now },
          updatedAt: { timestampValue: now }
        };

        const url = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/users/${user.uid}`;
        const resp = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ fields })
        });

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`Firestore REST save failed: ${resp.status} ${text}`);
        }
      } else {
        // Try native SDK first, with REST fallback
        try {
          // Check if firestore is properly initialized
          if (firestore && typeof firestore === 'function') {
            // Save to Firestore users collection using native SDK
            await firestore()
              .collection('users')
              .doc(user.uid)
              .set({
                ...profileData,
                createdAt: firestore.FieldValue.serverTimestamp(),
                updatedAt: firestore.FieldValue.serverTimestamp()
              }, { merge: true });
              
            console.log("✅ Profile saved using native SDK");
          } else {
            throw new Error('Native Firestore not available');
          }
        } catch (nativeError) {
          console.warn('Native Firestore save failed, using REST fallback:', nativeError);
          // Fallback to REST API if native SDK fails
          const token = await user.getIdToken();
          const now = new Date().toISOString();
          const fields: any = {
            uid: { stringValue: user.uid },
            visitorName: { stringValue: profileData.visitorName },
            visitorEmail: { stringValue: profileData.visitorEmail || '' },
            visitorMobile: { stringValue: profileData.visitorMobile },
            defaultPatientName: { stringValue: profileData.defaultPatientName },
            isProfileComplete: { booleanValue: true },
            createdAt: { timestampValue: now },
            updatedAt: { timestampValue: now }
          };

          const url = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/users/${user.uid}`;
          const resp = await fetch(url, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ fields })
          });

          if (!resp.ok) {
            const text = await resp.text();
            throw new Error(`Firestore REST fallback save failed: ${resp.status} ${text}`);
          }
          
          console.log("✅ Profile saved using REST fallback");
        }
      }

      console.log("✅ User profile saved to Firestore:", profileData);
      
    } catch (error) {
      console.error("❌ Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      
      // Sign out from both Google and Firebase
      await Promise.all([
        GoogleSignin.signOut(),
        firebaseSignOut(getAuth())
      ]);
      
      // Show success popup
      Alert.alert(
        'Success', 
        'You have been signed out from Google successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to main index screen
              router.replace('/');
            }
          }
        ]
      );
    } catch (error) {
      console.log('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const closeProfileDropdown = () => {
    setShowProfileDropdown(false);
  };

  const handleContinue = async () => {
    if (!patientName.trim()) {
      Alert.alert("Required", "Please enter patient name");
      return;
    }
    if (!mobileNumber.trim() || mobileNumber === "+91 ") {
      Alert.alert("Required", "Please enter your mobile number");
      return;
    }
    const mobileRegex = /^\+91 \d{10}$/;
    if (!mobileRegex.test(mobileNumber)) {
      Alert.alert("Invalid", "Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setIsSaving(true);
      await saveProfileData();
      Alert.alert(
        "Success",
        "Profile saved successfully!",
        [
          {
            text: "OK",
            onPress: () => router.replace("/visitor-dashboard")
          }
        ]
      );
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // No need to show loading - users reach this screen directly from user-type selection

  return (
    <SafeAreaView style={styles.container}>
      {/* Profile Icon */}
      <TouchableOpacity style={styles.profileButton} onPress={toggleProfileDropdown}>
        <Ionicons name="person-circle" size={32} color="white" />
      </TouchableOpacity>

      {/* Profile Dropdown */}
      {showProfileDropdown && (
        <>
          <TouchableOpacity 
            style={styles.dropdownOverlay} 
            onPress={closeProfileDropdown}
            activeOpacity={1}
          />
          <View style={styles.profileDropdown}>
            <Text style={styles.dropdownName} numberOfLines={2} ellipsizeMode="tail">{fullName || "User Name"}</Text>
            <Text style={styles.dropdownEmail}>{userEmail || "No email"}</Text>
            {mobileNumber && (
              <Text style={styles.dropdownMobile}>{mobileNumber}</Text>
            )}
            
            <View style={styles.dropdownDivider} />
            
            <TouchableOpacity 
              style={styles.dropdownOption} 
              onPress={() => {
                closeProfileDropdown();
                router.push("/scan");
              }}
            >
              <Ionicons name="qr-code-outline" size={18} color="#1C4B46" />
              <Text style={styles.dropdownOptionText}>Scan QR</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dropdownOption} 
              onPress={() => {
                closeProfileDropdown();
                router.push("/help-and-support");
              }}
            >
              <Ionicons name="help-circle-outline" size={18} color="#1C4B46" />
              <Text style={styles.dropdownOptionText}>Help & Support</Text>
            </TouchableOpacity>
            
            <View style={styles.dropdownDivider} />
            
            <TouchableOpacity 
              style={styles.dropdownSignOutButton} 
              onPress={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <ActivityIndicator size="small" color="#FF3B30" />
              ) : (
                <>
                  <Ionicons name="log-out-outline" size={18} color="#FF3B30" />
                  <Text style={styles.dropdownSignOutText}>Sign Out</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Section with Dark Teal Background */}
          <View style={styles.topSection}>
            {/* Welcome Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="person-add" size={40} color="white" />
            </View>

            {/* Title */}
            <Text style={styles.title}>Welcome,</Text>
            <Text style={styles.title}>{userName || "Visitor"}!</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Let's set up your profile for quick check-ins
            </Text>
          </View>

          {/* White Form Container */}
          <View style={styles.formContainer}>
            {/* Patient Name Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Default Patient Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter patient full name"
                placeholderTextColor="#A0A0A0"
                value={patientName}
                onChangeText={setPatientName}
                autoCapitalize="words"
                editable={!isSaving}
              />
            </View>

            {/* Mobile Number Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Your Mobile Number</Text>
              <View style={styles.mobileInputContainer}>
                <Ionicons name="call-outline" size={20} color="#8B9E9C" style={styles.mobileIcon} />
                <TextInput
                  style={styles.mobileInput}
                  placeholder={isMobileFocused || mobileNumber ? "+91 1234567890" : "Enter mobile number"}
                  placeholderTextColor="#A0A0A0"
                  value={mobileNumber}
                  onChangeText={handleMobileChange}
                  onFocus={handleMobileFocus}
                  onBlur={() => {
                    if (mobileNumber === "+91 ") {
                      setMobileNumber("");
                      setIsMobileFocused(false);
                    }
                  }}
                  keyboardType="phone-pad"
                  maxLength={14}
                  editable={!isSaving}
                />
              </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity 
              style={[styles.continueButton, isSaving && styles.buttonDisabled]} 
              onPress={handleContinue}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="white" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Continue</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#1C4B46" />
              <Text style={styles.infoText}>
                This information will be used for quick check-ins in the future
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C4B46",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "white",
    fontWeight: "500",
  },
  profileButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 11,
  },
  profileDropdown: {
    position: "absolute",
    top: 100,
    right: 20,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    minWidth: 280,
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dropdownName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  dropdownEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  dropdownMobile: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 12,
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: "#1C4B46",
    fontWeight: "600",
    marginLeft: 12,
  },
  dropdownSignOutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  dropdownSignOutText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "600",
    marginLeft: 12,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topSection: {
    backgroundColor: "#1C4B46",
    paddingTop: 80,
    paddingHorizontal: 28,
    paddingBottom: 50,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 22,
    opacity: 0.9,
  },
  formContainer: {
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
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2E",
    marginBottom: 8,
  },
  textInput: {
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
  mobileInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 56,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 28,
    backgroundColor: "white",
    paddingHorizontal: 20,
  },
  mobileIcon: {
    marginRight: 10,
  },
  mobileInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  continueButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#1C4B46",
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 20,
    shadowColor: "#1C4B46",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: "#8B9E9C",
    shadowOpacity: 0.1,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  infoText: {
    fontSize: 14,
    color: "#1C4B46",
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
});