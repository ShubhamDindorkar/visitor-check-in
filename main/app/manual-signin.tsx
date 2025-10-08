import { Text, View, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function ManualSignIn() {
  const [fullName, setFullName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isPhoneFocused, setIsPhoneFocused] = useState<boolean>(false);

  const handleBack = () => {
    router.back();
  };

  const handlePhoneFocus = () => {
    setIsPhoneFocused(true);
    if (!phoneNumber.startsWith("+91 ")) {
      setPhoneNumber("+91 ");
    }
  };

  const handlePhoneChange = (text: string) => {
    // Always keep +91 prefix
    if (!text.startsWith("+91 ")) {
      if (text.length === 0) {
        setPhoneNumber("");
        setIsPhoneFocused(false);
        return;
      }
      // If user tries to type without +91, add it
      text = "+91 " + text.replace(/^\\+91\\s*/, "");
    }
    
    // Remove any non-numeric characters after +91 
    const numberPart = text.slice(4).replace(/\\D/g, "");
    
    // Limit to 10 digits after +91
    if (numberPart.length <= 10) {
      setPhoneNumber("+91 " + numberPart);
    }
  };

  const handleContinue = () => {
    // Validate all fields
    if (!fullName.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }

    if (!phoneNumber.trim() || phoneNumber === "+91 ") {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    // Validate phone number (should be +91 followed by exactly 10 digits)
    const phoneRegex = /^\+91 \d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number");
      return;
    }

    // All validations passed
    const userData = {
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim()
    };
    
    console.log("Manual sign-in data:", userData);

    // Navigate to welcome page with user data as parameters
    router.push({
      pathname: "/welcome",
      params: {
        manualSignIn: "true",
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={32} color="#000" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Enter your details to continue</Text>
        
        {/* Input Fields */}
        <View style={styles.inputContainer}>
          {/* Full Name Input */}
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

          {/* Phone Number Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder={isPhoneFocused || phoneNumber ? "+91 1234567890" : "Enter your phone number"}
              placeholderTextColor="#999"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              onFocus={handlePhoneFocus}
              onBlur={() => {
                if (phoneNumber === "+91 ") {
                  setPhoneNumber("");
                  setIsPhoneFocused(false);
                }
              }}
              keyboardType="phone-pad"
              maxLength={14}
            />
          </View>
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.buttonText}>Continue</Text>
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContainer: {
    alignItems: "center",
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
});