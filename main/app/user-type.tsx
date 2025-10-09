import { Text, View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";

export default function UserType() {
  const scaleAnimVisitor = useRef(new Animated.Value(0.8)).current;
  const scaleAnimEnquiry = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.spring(scaleAnimVisitor, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
        delay: 100,
      }),
      Animated.spring(scaleAnimEnquiry, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
        delay: 200,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleVisitor = () => {
    router.push("/visitor-dashboard");
  };

  const handleEnquiry = () => {
    router.push("/enquiry-dashboard");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: opacityAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="person-circle-outline" size={80} color="#4CAF50" />
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>How would you like to proceed?</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {/* Visitor Option */}
          <Animated.View style={{ transform: [{ scale: scaleAnimVisitor }] }}>
            <TouchableOpacity
              style={[styles.optionCard, styles.visitorCard]}
              onPress={handleVisitor}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="people" size={60} color="#2196F3" />
              </View>
              <Text style={styles.optionTitle}>Visitor</Text>
              <Text style={styles.optionDescription}>
                Check in patients, scan QR codes, and manage visits
              </Text>
              <View style={styles.featuresContainer}>
                <View style={styles.featureRow}>
                  <Ionicons name="qr-code-outline" size={20} color="#2196F3" />
                  <Text style={styles.featureText}>Scan QR</Text>
                </View>
                <View style={styles.featureRow}>
                  <Ionicons name="person-add-outline" size={20} color="#2196F3" />
                  <Text style={styles.featureText}>Add Patient</Text>
                </View>
                <View style={styles.featureRow}>
                  <Ionicons name="clipboard-outline" size={20} color="#2196F3" />
                  <Text style={styles.featureText}>View Dashboard</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Enquiry Option */}
          <Animated.View style={{ transform: [{ scale: scaleAnimEnquiry }] }}>
            <TouchableOpacity
              style={[styles.optionCard, styles.enquiryCard]}
              onPress={handleEnquiry}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="help-circle" size={60} color="#FF9800" />
              </View>
              <Text style={styles.optionTitle}>Enquiry</Text>
              <Text style={styles.optionDescription}>
                Submit enquiries, track status, and get information
              </Text>
              <View style={styles.featuresContainer}>
                <View style={styles.featureRow}>
                  <Ionicons name="create-outline" size={20} color="#FF9800" />
                  <Text style={styles.featureText}>New Enquiry</Text>
                </View>
                <View style={styles.featureRow}>
                  <Ionicons name="list-outline" size={20} color="#FF9800" />
                  <Text style={styles.featureText}>My Enquiries</Text>
                </View>
                <View style={styles.featureRow}>
                  <Ionicons name="chatbubbles-outline" size={20} color="#FF9800" />
                  <Text style={styles.featureText}>Support</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
  optionsContainer: {
    flex: 1,
    gap: 20,
  },
  optionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
  },
  visitorCard: {
    borderColor: "#2196F3",
  },
  enquiryCard: {
    borderColor: "#FF9800",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  featuresContainer: {
    width: "100%",
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  featureText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});

