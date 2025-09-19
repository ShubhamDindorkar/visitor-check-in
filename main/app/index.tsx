import { Text, View, StyleSheet } from "react-native";
import GoogleAuth from "../src/components/auth/google-auth";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Visitor Check-In</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>
      <GoogleAuth />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
  },
});
