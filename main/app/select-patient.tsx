import { Text, View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { getAuth } from '@react-native-firebase/auth';
import firestore from "@react-native-firebase/firestore";

interface Patient {
  id: string;
  name: string;
  lastVisit?: string;
}

export default function SelectPatient() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        router.replace("/");
        return;
      }

      console.log("🔍 Fetching patients for user:", user.uid);

      // First, try to get the default patient from user profile
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      const userData = userDoc.data();
      const defaultPatientName = userData?.defaultPatientName;

      console.log("👤 Default patient from profile:", defaultPatientName);

      // Fetch all visits for this user (NO orderBy to avoid index requirement)
      const visitsRef = firestore().collection('visits');
      const visitsSnapshot = await visitsRef
        .where('createdBy', '==', user.uid)
        .get();

      console.log("📊 Found", visitsSnapshot.size, "visits");

      // Extract unique patients with their most recent visit
      const patientMap = new Map<string, { patient: Patient; timestamp: number }>();
      
      // Add default patient from profile if exists
      if (defaultPatientName) {
        patientMap.set(defaultPatientName, {
          patient: {
            id: defaultPatientName,
            name: defaultPatientName,
            lastVisit: 'Default Patient'
          },
          timestamp: Date.now() // Most recent
        });
      }
      
      visitsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const patientName = data.patientName;
        
        if (patientName) {
          const timestamp = data.createdAt?.toMillis?.() || Date.now();
          
          // Keep the most recent visit for each patient
          if (!patientMap.has(patientName) || timestamp > patientMap.get(patientName)!.timestamp) {
            patientMap.set(patientName, {
              patient: {
                id: patientName,
                name: patientName,
                lastVisit: data.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'
              },
              timestamp
            });
          }
        }
      });

      // Sort patients by most recent visit and extract patient objects
      const patientList = Array.from(patientMap.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .map(item => item.patient);

      console.log("✅ Found", patientList.length, "unique patients:", patientList.map(p => p.name));
      setPatients(patientList);
      
    } catch (error) {
      console.error("❌ Error fetching patients:", error);
      Alert.alert("Error", "Failed to load patients. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSelectPatient = (patient: Patient) => {
    // Navigate to scan screen with selected patient
    router.push({
      pathname: "/scan-with-patient",
      params: { patientName: patient.name }
    });
  };

  const handleAddNewPatient = () => {
    router.push("/add-patient");
  };

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <TouchableOpacity 
      style={styles.patientCard}
      onPress={() => handleSelectPatient(item)}
    >
      <View style={styles.patientIconContainer}>
        <Ionicons name="person" size={32} color="#2196F3" />
      </View>
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.patientLastVisit}>Last visit: {item.lastVisit}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Patient</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>Choose a patient to check in</Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading patients...</Text>
          </View>
        ) : patients.length > 0 ? (
          <FlatList
            data={patients}
            renderItem={renderPatientItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No patients yet</Text>
            <Text style={styles.emptySubtext}>Add your first patient to get started</Text>
          </View>
        )}
      </View>

      {/* Add New Patient Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.addPatientButton}
          onPress={handleAddNewPatient}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.addPatientText}>Add New Patient</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  patientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  patientLastVisit: {
    fontSize: 14,
    color: "#666",
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  addPatientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2196F3",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addPatientText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

