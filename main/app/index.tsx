import { View, StyleSheet, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect } from "react";

const { width, height } = Dimensions.get('window');

const GridBackground = () => {
  const gridSize = 8;
  const cellSize = width / gridSize;
  const numRows = Math.ceil(height / cellSize) + 1;

  return (
    <View style={styles.gridContainer}>
      <View style={styles.gridContent}>
        {/* Vertical Lines */}
        {Array.from({ length: gridSize + 1 }).map((_, i) => (
          <View
            key={`v-${i}`}
            style={[
              styles.gridLine,
              {
                left: i * cellSize,
                width: 0.5,
                height: height,
              },
            ]}
          />
        ))}
        {/* Horizontal Lines */}
        {Array.from({ length: numRows }).map((_, i) => (
          <View
            key={`h-${i}`}
            style={[
              styles.gridLine,
              {
                top: i * cellSize,
                height: 0.5,
                width: width,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default function Home() {
  useEffect(() => {
    // Navigate to login screen after 2 seconds
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 2000);

    // Cleanup timer on component unmount
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Grid Background */}
      <GridBackground />
      
      <View style={styles.content}>
        {/* White Circle */}
        <View style={styles.circle}>
          {/* Logo Container */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C4B46",
  },
  gridContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  gridContent: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: (width * 1.2) / 2,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  logoContainer: {
    width: "68%",
    height: "68%",
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
});
