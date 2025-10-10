import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { getAuth, signOut as firebaseSignOut } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import firestore from '@react-native-firebase/firestore';

export default function UserType() {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);

  const handleVisitor = async () => {
    // Check if user has completed their profile
    setIsCheckingProfile(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        router.replace('/');
        return;
      }

      let profileComplete = false;

      // Check profile completion status
      if (Platform.OS === 'web') {
        const token = await user.getIdToken();
        const url = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/users/${user.uid}`;
        
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const docData = await response.json();
          profileComplete = docData.fields?.isProfileComplete?.booleanValue === true;
        }
      } else {
        try {
          if (firestore && typeof firestore === 'function') {
            const userDoc = await firestore().collection('users').doc(user.uid).get();
            const userData = userDoc.data();
            profileComplete = userData?.isProfileComplete === true;
          }
        } catch (error) {
          console.warn('Error checking profile:', error);
        }
      }

      // If profile is complete, go to visitor dashboard
      // Otherwise, go to welcome screen to complete profile
      if (profileComplete) {
        router.push("/visitor-dashboard");
      } else {
        // Incomplete profile; go to welcome to finish setup
        router.push("/welcome");
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      // Default to welcome screen if there's an error
      router.push("/welcome");
    } finally {
      setIsCheckingProfile(false);
    }
  };

  const handleEnquiry = () => {
    // Enquiry users don't need to complete visitor profile
    router.push("/enquiry-dashboard");
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      
      await Promise.all([
        GoogleSignin.signOut(),
        firebaseSignOut(getAuth())
      ]);
      
      router.replace('/');
    } catch (error) {
      console.log('Sign out error:', error);
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
      {/* Profile Icon */}
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
        <Text style={styles.title}>Select Visit Type</Text>
        <Text style={styles.description}>Choose how you'd like to proceed</Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {/* Visitor Option */}
          <TouchableOpacity
            style={[styles.optionCard, styles.visitorCard]}
            onPress={handleVisitor}
            activeOpacity={0.8}
            disabled={isCheckingProfile}
          >
            {isCheckingProfile ? (
              <>
                <ActivityIndicator size="large" color="#1C4B46" />
                <Text style={[styles.optionTitle, { marginTop: 12 }]}>Loading...</Text>
              </>
            ) : (
              <>
                <Ionicons name="people" size={50} color="#1C4B46" />
                <Text style={styles.optionTitle}>Visitor</Text>
                <Text style={styles.optionDescription}>Check-in patients and manage visits</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Enquiry Option */}
          <TouchableOpacity
            style={[styles.optionCard, styles.enquiryCard]}
            onPress={handleEnquiry}
            activeOpacity={0.8}
          >
            <Ionicons name="help-circle" size={50} color="#1C4B46" />
            <Text style={styles.optionTitle}>Enquiry</Text>
            <Text style={styles.optionDescription}>Submit and track enquiries</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
    minWidth: 150,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dropdownSignOutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  dropdownSignOutText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "600",
    marginLeft: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  optionsContainer: {
    width: "100%",
    gap: 20,
  },
  optionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2.5,
  },
  visitorCard: {
    borderColor: "#1C4B46",
  },
  enquiryCard: {
    borderColor: "#1C4B46",
  },
  optionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginTop: 12,
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
});

