import { Text, View, StyleSheet, TouchableOpacity, SafeAreaView, Image } from "react-native";
import { router } from "expo-router";
import GoogleAuth from "../src/components/auth/google-auth";

export default function Home() {
  const handleContinue = () => {
    router.push("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Main Logo */}
      <View style={styles.iconContainer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Google Auth */}
      <View style={styles.authContainer}>
        <GoogleAuth />
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
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  iconContainer: {
    marginBottom: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 300,
    height: 150,
  },
  authContainer: {
    marginVertical: 20,
    width: "100%",
    alignItems: "center",
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "black",
    fontSize: 24,
    fontWeight: "600",
  },
});
