import { Text, View, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
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

      console.log("✅ Patient visit added:", docRef.id);
      
      // Navigate to entry page
      router.push(`/entry?visitId=${docRef.id}&mobileNumber=${encodeURIComponent(mobileNumber.trim())}&visitorName=${encodeURIComponent(user.displayName || 'Visitor')}&patientName=${encodeURIComponent(patientName.trim())}`);
      
    } catch (error) {
      console.error("❌ Error adding patient:", error);
      Alert.alert("Error", "Failed to add patient visit. Please try again.");
    } finally {
      setIsSubmitting(false);
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

