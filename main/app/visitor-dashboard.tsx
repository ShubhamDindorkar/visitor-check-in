import { Text, View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { getAuth, signOut as firebaseSignOut } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        setUserName(user.displayName || "Visitor");
        setUserEmail(user.email || "");
      } else {
        // Try Google Sign-In
        const googleUser = await GoogleSignin.getCurrentUser();
        if (googleUser?.user) {
          setUserName(googleUser.user.name || "Visitor");
          setUserEmail(googleUser.user.email || "");
        }
      }
    } catch (error) {
      console.log('Error fetching user info:', error);
      setUserName("Visitor");
    }
  };

  const handleScanQR = () => {
    router.push("/select-patient");
  };

  const handleAddPatient = () => {
    router.push("/add-patient");
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      
      await Promise.all([
        GoogleSignin.signOut(),
        firebaseSignOut(getAuth())
      ]);
      
      Alert.alert(
        'Success', 
        'You have been signed out successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/')
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

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Visitor Dashboard</Text>
        
        {/* Profile Icon */}
        <TouchableOpacity style={styles.profileButtonHeader} onPress={toggleProfileDropdown}>
          <Ionicons name="person-circle" size={32} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Profile Dropdown */}
      {showProfileDropdown && (
        <>
          <TouchableOpacity 
            style={styles.dropdownOverlay} 
            onPress={closeProfileDropdown}
            activeOpacity={1}
          />
          <View style={styles.profileDropdown}>
            <Text style={styles.dropdownName}>{userName}</Text>
            <Text style={styles.dropdownEmail}>{userEmail}</Text>
            
            <View style={styles.dropdownDivider} />
            
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
        {/* Main Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {/* Scan QR Button - Primary Action */}
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]} 
            onPress={handleScanQR}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="qr-code-outline" size={50} color="#4CAF50" />
            </View>
            <Text style={styles.actionButtonTitle}>Scan QR Code</Text>
          </TouchableOpacity>

          {/* Add Patient Button */}
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]} 
            onPress={handleAddPatient}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="person-add-outline" size={50} color="#2196F3" />
            </View>
            <Text style={styles.actionButtonTitle}>Add Patient</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  profileButtonHeader: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: "center",
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
    top: 70,
    right: 20,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    minWidth: 280,
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
    borderRadius: 8,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: "#007AFF",
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
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  actionButtonsContainer: {
    width: "100%",
    gap: 20,
  },
  actionButton: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryButton: {
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: "#2196F3",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  actionButtonTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
});

