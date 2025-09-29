import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getAuth, signOut as firebaseSignOut } from '@react-native-firebase/auth';

export default function Welcome() {
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  
  useEffect(() => {
    fetchUserName();
  }, []);

  const fetchUserName = async () => {
    try {
      // First try to get the current Firebase user
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      
      if (firebaseUser && firebaseUser.displayName) {
        // Extract first name from display name
        const firstName = firebaseUser.displayName.split(' ')[0];
        setUserName(firstName);
        setUserEmail(firebaseUser.email || "");
        return;
      }

      // Fallback to Google Sign-In current user
      const googleUser = await GoogleSignin.getCurrentUser();
      if (googleUser && googleUser.user.name) {
        // Extract first name from Google user name
        const firstName = googleUser.user.name.split(' ')[0];
        setUserName(firstName);
        setUserEmail(googleUser.user.email || "");
      } else {
        setUserName("Visitor");
        setUserEmail("");
      }
    } catch (error) {
      console.log('Error fetching user name:', error);
      setUserName("Visitor");
      setUserEmail("");
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    // TODO: Navigate to next page or handle form submission
    console.log("Continue button pressed");
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
              // Navigate back to the previous login screen
              router.back();
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
      {/* Background Tree Logo */}
      <Image 
        source={require("../assets/images/tree-logo.png")} 
        style={styles.backgroundLogo}
        resizeMode="contain"
      />
      
      {/* Back Button */}
      <TouchableOpacity style={styles.topBackButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={32} color="#000" />
      </TouchableOpacity>

      {/* Profile Icon and Dropdown */}
      <TouchableOpacity style={styles.profileButton} onPress={toggleProfileDropdown}>
        <Ionicons name="person-circle" size={32} color="#000" />
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
            <Text style={styles.dropdownName}>{userName || "User"}</Text>
            <Text style={styles.dropdownEmail}>{userEmail || "No email"}</Text>
            
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
        
        {/* Input Field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter patient name"
            placeholderTextColor="#000"
          />
        </View>
      </View>

      {/* Continue Button - Positioned at bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
        
        {/* Sign Out Button */}
        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          )}
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
  backgroundLogo: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -225 }, { translateY: -370 }],
    width: 450,
    height: 500,
    opacity: 0.25,
    zIndex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "center",
    zIndex: 2,
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
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dropdownName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  dropdownEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 0,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 12,
  },
  dropdownSignOutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  dropdownSignOutText: {
    fontSize: 14,
    color: "#FF3B30",
    fontWeight: "500",
    marginLeft: 8,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#000",
    textAlign: "left",
    marginBottom: 8,
  },
  inputContainer: {
    marginTop: 20,
    alignItems: "center",
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
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    alignItems: "center",
    zIndex: 2,
  },
  continueButton: {
    backgroundColor: "white",
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
  buttonText: {
    color: "black",
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
