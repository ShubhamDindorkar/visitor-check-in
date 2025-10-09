import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ReceptionQRCode from "../src/components/qr/ReceptionQRCode";

export default function ReceptionQR() {
  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={32} color="#000" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reception QR Code</Text>
          <Text style={styles.headerSubtitle}>
            Print this page and display at your reception desk
          </Text>
        </View>

        <ReceptionQRCode size={300} facilityName="Hospital Reception" />

        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsTitle}>📋 Setup Instructions:</Text>
          <Text style={styles.instruction}>
            1. <Text style={styles.bold}>Print this page</Text> or take a screenshot
          </Text>
          <Text style={styles.instruction}>
            2. <Text style={styles.bold}>Place it</Text> at your reception desk where visitors can easily scan
          </Text>
          <Text style={styles.instruction}>
            3. <Text style={styles.bold}>Ensure</Text> returning visitors have already registered on their first visit
          </Text>
          <Text style={styles.instruction}>
            4. <Text style={styles.bold}>First-time visitors</Text> should use the manual check-in process
          </Text>
        </View>

        <View style={styles.benefitsBox}>
          <Text style={styles.benefitsTitle}>✨ Benefits:</Text>
          <Text style={styles.benefit}>✓ Faster check-in for returning visitors</Text>
          <Text style={styles.benefit}>✓ No need to re-enter patient information</Text>
          <Text style={styles.benefit}>✓ Contactless and convenient</Text>
          <Text style={styles.benefit}>✓ Automatic entry logging</Text>
        </View>

        <View style={styles.printNote}>
          <Ionicons name="print-outline" size={24} color="#666" />
          <Text style={styles.printText}>
            Use your browser's print function (Ctrl/Cmd + P) to print this QR code
          </Text>
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingTop: 100,
    paddingBottom: 40,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  instructionsBox: {
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 20,
    marginTop: 30,
    marginHorizontal: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
  },
  instruction: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
    lineHeight: 24,
  },
  bold: {
    fontWeight: "bold",
  },
  benefitsBox: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginHorizontal: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
  },
  benefit: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    lineHeight: 24,
  },
  printNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginHorizontal: 24,
    gap: 12,
  },
  printText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
});

