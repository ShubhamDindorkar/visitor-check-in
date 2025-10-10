import { View, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Automatically navigate to login screen after 1.5 seconds
    const timer = setTimeout(() => {
      router.push("/login");
    }, 1500);

    // Cleanup timer on component unmount
    return () => clearTimeout(timer);
  }, []);

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
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 300,
    height: 150,
  },
});
