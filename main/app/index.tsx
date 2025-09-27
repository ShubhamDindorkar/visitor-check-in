import { Text, View, StyleSheet, TouchableOpacity, SafeAreaView, Image } from "react-native";
import { router } from "expo-router";

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
      
      {/* Title */}
      
      
      {/* Subtitle */}
      
      
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
    backgroundColor: "white", // Entire page is white
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    alignItems: "center",
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
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2C2C2E",
    marginBottom: 80,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 50,
    paddingHorizontal: 20,
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
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "black",
    fontSize: 20,
    fontWeight: "600",
  },
});