import { Text, View, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform, ScrollView, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { getAuth } from '@react-native-firebase/auth';
import firestore from "@react-native-firebase/firestore";

export default function AddEnquiry() {
  const [enquirerName, setEnquirerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [patientName, setPatientName] = useState("");
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
    if (!enquirerName.trim()) {
      Alert.alert("Error", "Please enter your name");
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

    if (!patientName.trim()) {
      Alert.alert("Error", "Please enter patient name");
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
      let enquiryId: string;
      
      // Use platform-aware approach for adding enquiry
      if (Platform.OS === 'web') {
        // Use Firestore REST API for web
        const token = await user.getIdToken();
        const now = new Date().toISOString();
        
        // Generate a unique ID for the enquiry document
        enquiryId = `enquiry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const fields = {
          enquirerName: { stringValue: enquirerName.trim() },
          enquirerMobile: { stringValue: mobileNumber.trim() },
          patientName: { stringValue: patientName.trim() },
          status: { stringValue: 'pending' },
          createdAt: { timestampValue: now },
          createdBy: { stringValue: user.uid },
          _manualEntry: { booleanValue: true }
        };

        const url = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/enquiries/${enquiryId}`;
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
        
        console.log("✅ Enquiry added via REST API:", enquiryId);
      } else {
        // Try native SDK first, with REST fallback
        try {
          if (firestore && typeof firestore === 'function') {
            const ts = firestore.FieldValue.serverTimestamp();
            
            const docRef = await firestore().collection('enquiries').add({
              enquirerName: enquirerName.trim(),
              enquirerMobile: mobileNumber.trim(),
              patientName: patientName.trim(),
              status: 'pending',
              createdAt: ts,
              createdBy: user.uid,
              _manualEntry: true,
            });

            enquiryId = docRef.id;
            console.log("✅ Enquiry added via native SDK:", enquiryId);
          } else {
            throw new Error('Native Firestore not available');
          }
        } catch (nativeError) {
          console.warn('Native Firestore add failed, using REST fallback:', nativeError);
          // Fallback to REST API if native SDK fails
          const token = await user.getIdToken();
          const now = new Date().toISOString();
          
          enquiryId = `enquiry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          const fields = {
            enquirerName: { stringValue: enquirerName.trim() },
            enquirerMobile: { stringValue: mobileNumber.trim() },
            patientName: { stringValue: patientName.trim() },
            status: { stringValue: 'pending' },
            createdAt: { timestampValue: now },
            createdBy: { stringValue: user.uid },
            _manualEntry: { booleanValue: true }
          };

          const url = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/enquiries/${enquiryId}`;
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
          
          console.log("✅ Enquiry added via REST fallback:", enquiryId);
        }
      }

      Alert.alert(
        "Success",
        "Your enquiry has been submitted successfully!",
        [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error("❌ Error adding enquiry:", error);
      Alert.alert("Error", "Failed to submit enquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

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
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="help-circle" size={40} color="white" />
            </View>

            {/* Title */}
            <Text style={styles.title}>New Enquiry</Text>
            <Text style={styles.title}>Registration</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Enter your details to submit an enquiry
            </Text>
          </View>

          {/* White Form Container */}
          <View style={styles.formContainer}>
            {/* Enquirer Name Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Your Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your full name"
                placeholderTextColor="#A0A0A0"
                value={enquirerName}
                onChangeText={setEnquirerName}
                autoCapitalize="words"
                editable={!isSubmitting}
              />
            </View>

            {/* Mobile Number Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
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
                  editable={!isSubmitting}
                />
              </View>
            </View>

            {/* Patient Name Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Patient Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter patient name"
                placeholderTextColor="#A0A0A0"
                value={patientName}
                onChangeText={setPatientName}
                autoCapitalize="words"
                editable={!isSubmitting}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.continueButton, isSubmitting && styles.buttonDisabled]} 
              onPress={handleContinue}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="white" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Submit Enquiry</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#1C4B46" />
              <Text style={styles.infoText}>
                Your enquiry will be submitted to the reception staff
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
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
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

