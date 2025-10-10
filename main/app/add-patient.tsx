import { Text, View, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { getAuth } from '@react-native-firebase/auth';
import firestore from "@react-native-firebase/firestore";

export default function AddPatient() {
  const [patientName, setPatientName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isMobileFocused, setIsMobileFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setAsDefault, setSetAsDefault] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleMobileFocus = () => {
    setIsMobileFocused(true);
    if (!mobileNumber.startsWith("+91 ")) {
      setMobileNumber("+91 ");
    }
  };

  const handleMobileChange = (text: string) => {
    if (!text.startsWith("+91 ")) {
      if (text.length === 0) {
        setMobileNumber("");
        setIsMobileFocused(false);
        return;
      }
      text = "+91 " + text.replace(/^\+91\s*/, "");
    }
    
    const numberPart = text.slice(4).replace(/\D/g, "");
    
    if (numberPart.length <= 10) {
      setMobileNumber("+91 " + numberPart);
    }
  };

  const handleContinue = async () => {
    if (!patientName.trim()) {
      Alert.alert("Error", "Please enter patient name");
      return;
    }
    
    if (!mobileNumber.trim() || mobileNumber === "+91 ") {
      Alert.alert("Error", "Please enter mobile number");
      return;
    }
    
    const mobileRegex = /^\+91 \d{10}$/;
    if (!mobileRegex.test(mobileNumber)) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setIsSubmitting(true);
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert("Error", "Please log in first");
        router.replace("/");
        return;
      }

      const currentTime = new Date();
      let visitId: string;
      
      // Use platform-aware approach for adding patient visit
      if (Platform.OS === 'web') {
        // Use Firestore REST API for web
        const token = await user.getIdToken();
        const now = new Date().toISOString();
        
        // Generate a unique ID for the visit document
        visitId = `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const fields = {
          visitorName: { stringValue: user.displayName || 'Visitor' },
          visitorMobile: { stringValue: mobileNumber.trim() },
          patientName: { stringValue: patientName.trim() },
          status: { stringValue: 'checked_in' },
          checkInTime: { timestampValue: now },
          createdAt: { timestampValue: now },
          date: { timestampValue: now },
          createdBy: { stringValue: user.uid },
          _manualEntry: { booleanValue: true }
        };

        const url = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/visits/${visitId}`;
        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ fields })
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Firestore REST save failed: ${response.status} ${text}`);
        }
        
        console.log("✅ Patient visit added via REST API:", visitId);
      } else {
        // Try native SDK first, with REST fallback
        try {
          if (firestore && typeof firestore === 'function') {
            const ts = firestore.FieldValue.serverTimestamp();
            
            const docRef = await firestore().collection('visits').add({
              visitorName: user.displayName || 'Visitor',
              visitorMobile: mobileNumber.trim(),
              patientName: patientName.trim(),
              status: 'checked_in',
              checkInTime: ts,
              createdAt: ts,
              date: ts,
              createdBy: user.uid,
              _manualEntry: true,
            });

            visitId = docRef.id;
            console.log("✅ Patient visit added via native SDK:", visitId);
          } else {
            throw new Error('Native Firestore not available');
          }
        } catch (nativeError) {
          console.warn('Native Firestore add failed, using REST fallback:', nativeError);
          // Fallback to REST API if native SDK fails
          const token = await user.getIdToken();
          const now = new Date().toISOString();
          
          // Generate a unique ID for the visit document
          visitId = `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          const fields = {
            visitorName: { stringValue: user.displayName || 'Visitor' },
            visitorMobile: { stringValue: mobileNumber.trim() },
            patientName: { stringValue: patientName.trim() },
            status: { stringValue: 'checked_in' },
            checkInTime: { timestampValue: now },
            createdAt: { timestampValue: now },
            date: { timestampValue: now },
            createdBy: { stringValue: user.uid },
            _manualEntry: { booleanValue: true }
          };

          const url = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/visits/${visitId}`;
          const response = await fetch(url, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ fields })
          });

          if (!response.ok) {
            const text = await response.text();
            throw new Error(`Firestore REST fallback save failed: ${response.status} ${text}`);
          }
          
          console.log("✅ Patient visit added via REST fallback:", visitId);
        }
      }

      // Update user profile if this patient should be set as default
      if (setAsDefault) {
        await updateDefaultPatient(user.uid, patientName.trim());
        Alert.alert(
          "Success", 
          `${patientName.trim()} has been set as your default patient for quick check-ins!`,
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate to entry page
                router.push(`/entry?visitId=${visitId}&mobileNumber=${encodeURIComponent(mobileNumber.trim())}&visitorName=${encodeURIComponent(user.displayName || 'Visitor')}&patientName=${encodeURIComponent(patientName.trim())}`);
              }
            }
          ]
        );
      } else {
        // Navigate to entry page
        router.push(`/entry?visitId=${visitId}&mobileNumber=${encodeURIComponent(mobileNumber.trim())}&visitorName=${encodeURIComponent(user.displayName || 'Visitor')}&patientName=${encodeURIComponent(patientName.trim())}`);
      }
    } catch (error) {
      console.error("❌ Error adding patient:", error);
      Alert.alert("Error", "Failed to add patient visit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateDefaultPatient = async (userId: string, defaultPatientName: string) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      // Prepare complete profile data similar to welcome screen
      const profileData = {
        uid: user.uid,
        visitorName: user.displayName || 'Visitor',
        visitorEmail: user.email || '',
        visitorMobile: mobileNumber.trim(),
        defaultPatientName: defaultPatientName,
        isProfileComplete: true,
      };

      if (Platform.OS === 'web') {
        // Use Firestore REST API for web
        const token = await user.getIdToken();
        const now = new Date().toISOString();
        
        const fields: any = {
          uid: { stringValue: user.uid },
          visitorName: { stringValue: profileData.visitorName },
          visitorEmail: { stringValue: profileData.visitorEmail },
          visitorMobile: { stringValue: profileData.visitorMobile },
          defaultPatientName: { stringValue: profileData.defaultPatientName },
          isProfileComplete: { booleanValue: true },
          createdAt: { timestampValue: now },
          updatedAt: { timestampValue: now }
        };

        const url = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/users/${userId}`;
        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ fields })
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Failed to update default patient: ${response.status} ${text}`);
        }
        
        console.log("✅ Complete user profile updated via REST API:", profileData);
      } else {
        // Try native SDK first, with REST fallback
        try {
          if (firestore && typeof firestore === 'function') {
            // Save complete profile to Firestore users collection using native SDK
            await firestore()
              .collection('users')
              .doc(user.uid)
              .set({
                ...profileData,
                createdAt: firestore.FieldValue.serverTimestamp(),
                updatedAt: firestore.FieldValue.serverTimestamp()
              }, { merge: true });
              
            console.log("✅ Complete user profile updated via native SDK:", profileData);
          } else {
            throw new Error('Native Firestore not available');
          }
        } catch (nativeError) {
          console.warn('Native Firestore update failed, using REST fallback:', nativeError);
          // Fallback to REST API if native SDK fails
          const token = await user.getIdToken();
          const now = new Date().toISOString();
          
          const fields: any = {
            uid: { stringValue: user.uid },
            visitorName: { stringValue: profileData.visitorName },
            visitorEmail: { stringValue: profileData.visitorEmail },
            visitorMobile: { stringValue: profileData.visitorMobile },
            defaultPatientName: { stringValue: profileData.defaultPatientName },
            isProfileComplete: { booleanValue: true },
            createdAt: { timestampValue: now },
            updatedAt: { timestampValue: now }
          };

          const url = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/users/${userId}`;
          const response = await fetch(url, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ fields })
          });

          if (!response.ok) {
            const text = await response.text();
            throw new Error(`Failed to update default patient: ${response.status} ${text}`);
          }
          
          console.log("✅ Complete user profile updated via REST fallback:", profileData);
        }
      }
    } catch (error) {
      console.error("❌ Error updating user profile with default patient:", error);
      // Don't throw error here to avoid blocking the main flow
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={32} color="#000" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Add Patient Visit</Text>
        <Text style={styles.subtitle}>Enter patient details to check in</Text>
        
        {/* Input Fields */}
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
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder={isMobileFocused || mobileNumber ? "+91 1234567890" : "Enter mobile number"}
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

          {/* Set as Default Patient Option */}
          {patientName.trim() && (
            <View style={styles.defaultPatientWrapper}>
              <TouchableOpacity 
                style={styles.defaultPatientOption}
                onPress={() => setSetAsDefault(!setAsDefault)}
              >
                <View style={[styles.checkbox, setAsDefault && styles.checkboxSelected]}>
                  {setAsDefault && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <Text style={styles.defaultPatientText}>
                  Set "{patientName.trim()}" as your default patient
                </Text>
              </TouchableOpacity>
              <Text style={styles.defaultPatientSubtext}>
                This will be used for quick check-ins in the future
              </Text>
            </View>
          )}
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.continueButton, isSubmitting && styles.buttonDisabled]} 
            onPress={handleContinue}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttonText}>Check In</Text>
            )}
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
  backButton: {
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "center",
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
  inputContainer: {
    marginBottom: 40,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2E",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  defaultPatientWrapper: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  defaultPatientOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  defaultPatientText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2E",
    flex: 1,
  },
  defaultPatientSubtext: {
    fontSize: 14,
    color: "#8E8E93",
    fontStyle: "italic",
  },
  buttonContainer: {
    alignItems: "center",
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
});

