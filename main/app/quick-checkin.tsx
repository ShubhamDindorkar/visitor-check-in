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

      // If no patient info found, use default values and let user complete later
      if (!patientName || !visitorMobile) {
        console.log("No saved patient info found, using defaults");
        patientName = patientName || "Not specified";
        visitorMobile = visitorMobile || "Not provided";
        
        // Still proceed with check-in but with default values
        setStatus("Creating check-in with available information...");
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
      
      // Try to get basic user info even if Firestore fails
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (user) {
          const userDisplayName = user.displayName || 'Visitor';
          const userEmail = user.email || '';
          
          // Create a basic check-in entry with minimal info
          const ts = firestore.FieldValue.serverTimestamp();
          const docRef = await firestore().collection('visits').add({
            visitorName: userDisplayName,
            visitorMobile: userEmail || "Not provided",
            patientName: "Quick Check-in",
            status: 'checked_in',
            checkInTime: ts,
            createdAt: ts,
            date: ts,
            createdBy: user.uid,
            _quickCheckIn: true,
            _fallback: true // Flag to indicate this was a fallback check-in
          });

          console.log("✅ Fallback check-in successful:", docRef.id);
          setStatus("Success! Redirecting...");

          setTimeout(() => {
            router.push(`/entry?visitId=${docRef.id}&mobileNumber=${encodeURIComponent(userEmail || "Not provided")}&visitorName=${encodeURIComponent(userDisplayName)}&patientName=Quick Check-in&fromQuickCheckin=true`);
          }, 1000);
          return;
        }
      } catch (fallbackError) {
        console.error("❌ Fallback check-in also failed:", fallbackError);
      }
      
      Alert.alert(
        "Check-in Error",
        "Unable to complete quick check-in. Please use manual check-in.",
        [
          {
            text: "Manual Check-in",
            onPress: () => router.replace("/user-type")
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

