import { Text, View, StyleSheet, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from "react-native";
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

  const handleContinue = async () => {
    // Validate patient name
    if (!patientName.trim()) {
      Alert.alert("Required", "Please enter patient name");
      return;
    }
    
    // Validate mobile number
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
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      // Save user profile with patient to Firestore users collection
      const profileData = {
        uid: user.uid,
        visitorName: fullName || userName || 'Visitor',
        visitorEmail: userEmail || user.email || '',
        visitorMobile: mobileNumber.trim(),
        defaultPatientName: patientName.trim(),
        isProfileComplete: true,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp()
      };

      // Save to Firestore users collection
      await firestore()
        .collection('users')
        .doc(user.uid)
        .set(profileData, { merge: true });
      
      console.log("✅ User profile saved to Firestore:", profileData);
      
      // Navigate to dashboard
        router.replace('/user-type');
      
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Profile Icon and Dropdown */}
      <TouchableOpacity style={styles.profileButton} onPress={toggleProfileDropdown}>
        <Ionicons name="person-circle" size={40} color="#000" />
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
            
            {/* Divider */}
            <View style={styles.dropdownDivider} />
            
            {/* Notifications Option */}
            <TouchableOpacity 
              style={styles.dropdownOption} 
              onPress={() => {
                // TODO: Navigate to notifications
                console.log("Notifications pressed");
                closeProfileDropdown();
              }}
            >
              <Ionicons name="notifications-outline" size={18} color="#007AFF" />
              <Text style={styles.dropdownOptionText}>Notifications</Text>
            </TouchableOpacity>
            
            {/* Scan QR Option */}
            <TouchableOpacity 
              style={styles.dropdownOption} 
              onPress={() => {
                closeProfileDropdown();
                router.push("/scan");
              }}
            >
              <Ionicons name="qr-code-outline" size={18} color="#007AFF" />
              <Text style={styles.dropdownOptionText}>Scan QR</Text>
            </TouchableOpacity>
            
            {/* Help & Support Option */}
            <TouchableOpacity 
              style={styles.dropdownOption} 
              onPress={() => {
                closeProfileDropdown();
                router.push("/help-and-support");
              }}
            >
              <Ionicons name="help-circle-outline" size={18} color="#007AFF" />
              <Text style={styles.dropdownOptionText}>Help & Support</Text>
            </TouchableOpacity>
            
            {/* Divider */}
            <View style={styles.dropdownDivider} />
            
            {/* Sign Out Option */}
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

      <View style={styles.content}>
        {/* Welcome Message */}
        <Text style={styles.welcomeTitle}>
          Welcome, {userName ? `${userName}!` : "..."}
        </Text>
        <Text style={styles.subtitle}>
          Complete your profile to get started
        </Text>
        
        {/* Input Fields - Patient name and mobile number */}
        <View style={styles.inputContainer}>
          {/* Patient Name Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Patient Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter patient name"
              placeholderTextColor="#999"
            value={patientName}
            onChangeText={setPatientName}
              autoCapitalize="words"
          />
          </View>

          {/* Mobile Number Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Your Mobile Number</Text>
          <TextInput
              style={styles.textInput}
            placeholder={isMobileFocused || mobileNumber ? "+91 1234567890" : "Enter your mobile number"}
              placeholderTextColor="#999"
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
          />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ✨ One-time setup - This information will be saved for quick check-ins
          </Text>
        </View>
      </View>

      {/* Continue Button - Positioned at bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.continueButton,
            (!patientName.trim() || !mobileNumber || mobileNumber === "+91 ") && styles.continueButtonDisabled
          ]} 
          onPress={handleContinue}
          disabled={!patientName.trim() || !mobileNumber || mobileNumber === "+91 "}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "center",
    zIndex: 2,
  },
  profileButton: {
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
    top: 120,
    right: 20,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    minWidth: 320,
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dropdownName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    lineHeight: 26,
    textAlign: "left",
    flexWrap: "wrap",
    width: "100%",
  },
  dropdownEmail: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginBottom: 4,
    lineHeight: 20,
  },
  dropdownMobile: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginBottom: 4,
    lineHeight: 20,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 16,
  },
  dropdownSignOutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginVertical: 3,
  },
  dropdownOptionText: {
    fontSize: 20,
    color: "#007AFF",
    fontWeight: "bold",
    marginLeft: 12,
  },
  dropdownSignOutText: {
    fontSize: 20,
    color: "#FF3B30",
    fontWeight: "bold",
    marginLeft: 12,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#000",
    textAlign: "left",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "400",
  },
  inputContainer: {
    marginTop: 20,
    width: "100%",
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
    height: 60,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 18,
    backgroundColor: "white",
    color: "#000",
  },
  infoBox: {
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    alignItems: "center",
    zIndex: 2,
  },
  continueButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 12,
    minWidth: 250,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0.05,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
  signOutButton: {
    backgroundColor: "black",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 12,
    minWidth: 250,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  signOutButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
});