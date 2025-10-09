import { Text, View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getAuth } from '@react-native-firebase/auth';
import firestore from "@react-native-firebase/firestore";

export default function QuickCheckIn() {
  const { selectedPatient } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    performQuickCheckIn();
  }, []);

  const performQuickCheckIn = async () => {
    try {
      setStatus("Identifying user...");
      
      // Get current user
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert("Error", "Please log in first to use quick check-in");
        router.replace("/");
        return;
      }

      const userEmail = user.email || '';
      const userDisplayName = user.displayName || 'Visitor';
      setUserName(userDisplayName);

      // Use selected patient if provided, otherwise fetch last visit
      let patientName = "";
      let visitorMobile = "";
      let visitorName = userDisplayName;

      if (selectedPatient) {
        // Patient was selected from patient list
        patientName = selectedPatient.toString();
        setStatus("Using selected patient...");
        
        // Fetch mobile number from a previous visit with this patient
        const visitsRef = firestore().collection('visits');
        const patientVisitQuery = await visitsRef
          .where('createdBy', '==', user.uid)
          .where('patientName', '==', patientName)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();

        if (!patientVisitQuery.empty) {
          const lastVisit = patientVisitQuery.docs[0].data();
          visitorMobile = lastVisit.visitorMobile || "";
          visitorName = lastVisit.visitorName || userDisplayName;
        }
      } else {
        // No patient selected, fetch from last visit
        setStatus("Looking up your previous visits...");

        const visitsRef = firestore().collection('visits');
        const lastVisitQuery = await visitsRef
          .where('createdBy', '==', user.uid)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();

        if (!lastVisitQuery.empty) {
          const lastVisit = lastVisitQuery.docs[0].data();
          patientName = lastVisit.patientName || "";
          visitorMobile = lastVisit.visitorMobile || "";
          visitorName = lastVisit.visitorName || userDisplayName;
          
          console.log("Found previous visit:", lastVisit);
        }
      }

      // If no patient info found, ask user to add patient first
      if (!patientName || !visitorMobile) {
        Alert.alert(
          "No Patient Information",
          "Please add a patient first before checking in.",
          [
            {
              text: "Add Patient",
              onPress: () => router.replace("/add-patient")
            },
            {
              text: "Go to Dashboard",
              onPress: () => router.replace("/visitor-dashboard"),
              style: "cancel"
            }
          ]
        );
        setIsLoading(false);
        return;
      }

      setStatus("Creating your check-in entry...");

      // Create new check-in entry with saved information
      const currentTime = new Date();
      const ts = firestore.FieldValue.serverTimestamp();
      
      const docRef = await firestore().collection('visits').add({
        visitorName: visitorName,
        visitorMobile: visitorMobile,
        patientName: patientName,
        status: 'checked_in',
        checkInTime: ts,
        createdAt: ts,
        date: ts,
        createdBy: user.uid,
        _quickCheckIn: true, // Flag to indicate this was a quick check-in
      });

      console.log("✅ Quick check-in successful:", docRef.id);
      setStatus("Success! Redirecting...");

      // Navigate to entry page
      setTimeout(() => {
        router.push(`/entry?visitId=${docRef.id}&mobileNumber=${encodeURIComponent(visitorMobile)}&visitorName=${encodeURIComponent(visitorName)}&patientName=${encodeURIComponent(patientName)}&fromQuickCheckin=true`);
      }, 1000);

    } catch (error) {
      console.error("❌ Quick check-in error:", error);
      Alert.alert(
        "Check-in Error",
        "Unable to complete quick check-in. Please use manual check-in.",
        [
          {
            text: "Manual Check-in",
            onPress: () => router.replace("/welcome")
          }
        ]
      );
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
        
        <Text style={styles.title}>Quick Check-In</Text>
        
        {userName && (
          <Text style={styles.welcomeText}>Welcome back, {userName}!</Text>
        )}
        
        <Text style={styles.status}>{status}</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ✓ Using your saved information
          </Text>
          <Text style={styles.infoText}>
            ✓ Checking you in automatically
          </Text>
          <Text style={styles.infoText}>
            ✓ This will only take a moment
          </Text>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loader: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 20,
    color: "#4CAF50",
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "600",
  },
  status: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
    lineHeight: 24,
  },
});

