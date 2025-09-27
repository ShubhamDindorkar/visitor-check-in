import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Welcome() {
  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    // TODO: Navigate to next page or handle form submission
    console.log("Continue button pressed");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.topBackButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={32} color="#007AFF" />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Welcome Message */}
        <Text style={styles.welcomeTitle}>Welcome,</Text>
        <Text style={styles.welcomeTitle}>Visitor!</Text>
        
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
  welcomeTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#000",
    textAlign: "left",
    marginBottom: 8,
  },
  inputContainer: {
    marginTop: 60,
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
