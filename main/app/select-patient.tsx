import { Text, View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, Platform } from "react-native";
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(new Set());

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

      let defaultPatientName: string | undefined;
      let visitsData: any[] = [];

      // Use platform-aware approach for fetching patient data
      if (Platform.OS === 'web') {
        // Use Firestore REST API for web
        const token = await user.getIdToken();
        
        // Fetch user profile for default patient
        const userUrl = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/users/${user.uid}`;
        const userResponse = await fetch(userUrl, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (userResponse.ok) {
          const userDoc = await userResponse.json();
          defaultPatientName = userDoc.fields?.defaultPatientName?.stringValue;
        }

        // Fetch visits
        const visitsUrl = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/visits`;
        const visitsResponse = await fetch(visitsUrl, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (visitsResponse.ok) {
          const visitsDoc = await visitsResponse.json();
          visitsData = (visitsDoc.documents || [])
            .filter((doc: any) => doc.fields?.createdBy?.stringValue === user.uid)
            .map((doc: any) => ({
              patientName: doc.fields?.patientName?.stringValue,
              createdAt: doc.fields?.createdAt?.timestampValue 
                ? new Date(doc.fields.createdAt.timestampValue)
                : new Date(),
            }));
        }

        console.log("👤 Default patient from profile (web):", defaultPatientName);
        console.log("📊 Found", visitsData.length, "visits (web)");
      } else {
        // Try native SDK first, with REST fallback
        try {
          if (firestore && typeof firestore === 'function') {
            // Fetch user profile for default patient
            const userDoc = await firestore().collection('users').doc(user.uid).get();
            const userData = userDoc.data();
            defaultPatientName = userData?.defaultPatientName;

            // Fetch visits
            const visitsSnapshot = await firestore()
              .collection('visits')
              .where('createdBy', '==', user.uid)
              .get();

            visitsData = visitsSnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                patientName: data.patientName,
                createdAt: data.createdAt?.toDate?.() || new Date(),
              };
            });

            console.log("👤 Default patient from profile (native):", defaultPatientName);
            console.log("📊 Found", visitsData.length, "visits (native)");
          } else {
            throw new Error('Native Firestore not available');
          }
        } catch (nativeError) {
          console.warn('Native Firestore fetch failed, using REST fallback:', nativeError);
          // Fallback to REST API if native SDK fails
          const token = await user.getIdToken();
          
          // Fetch user profile for default patient
          const userUrl = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/users/${user.uid}`;
          const userResponse = await fetch(userUrl, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (userResponse.ok) {
            const userDoc = await userResponse.json();
            defaultPatientName = userDoc.fields?.defaultPatientName?.stringValue;
          }

          // Fetch visits
          const visitsUrl = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/visits`;
          const visitsResponse = await fetch(visitsUrl, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (visitsResponse.ok) {
            const visitsDoc = await visitsResponse.json();
            visitsData = (visitsDoc.documents || [])
              .filter((doc: any) => doc.fields?.createdBy?.stringValue === user.uid)
              .map((doc: any) => ({
                patientName: doc.fields?.patientName?.stringValue,
                createdAt: doc.fields?.createdAt?.timestampValue 
                  ? new Date(doc.fields.createdAt.timestampValue)
                  : new Date(),
              }));
          }

          console.log("👤 Default patient from profile (REST fallback):", defaultPatientName);
          console.log("📊 Found", visitsData.length, "visits (REST fallback)");
        }
      }

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
      
      visitsData.forEach(visit => {
        const patientName = visit.patientName;
        
        if (patientName) {
          const timestamp = visit.createdAt.getTime();
          
          // Keep the most recent visit for each patient
          if (!patientMap.has(patientName) || timestamp > patientMap.get(patientName)!.timestamp) {
            patientMap.set(patientName, {
              patient: {
                id: patientName,
                name: patientName,
                lastVisit: visit.createdAt.toLocaleDateString() || 'Recently'
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

  const handleEditMode = () => {
    setIsEditMode(!isEditMode);
    setSelectedPatients(new Set()); // Clear selections when toggling edit mode
  };

  const handlePatientSelection = (patientId: string) => {
    const newSelected = new Set(selectedPatients);
    if (newSelected.has(patientId)) {
      newSelected.delete(patientId);
    } else {
      newSelected.add(patientId);
    }
    setSelectedPatients(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedPatients.size === 0) return;

    const patientsToDelete = patients.filter(p => selectedPatients.has(p.id));
    const patientNames = patientsToDelete.map(p => p.name).join(', ');
    const hasDefaultPatient = patientsToDelete.some(p => p.lastVisit === 'Default Patient');

    let message = `Are you sure you want to delete ${selectedPatients.size} patient(s): ${patientNames}?`;
    
    if (hasDefaultPatient) {
      message += '\n\n⚠️ This includes your default patient. You will need to set up a new default patient when creating your profile again.';
    }

    Alert.alert(
      "Delete Patients",
      message,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const auth = getAuth();
              const user = auth.currentUser;
              
              if (!user) return;

              // Delete patients by removing visits and updating user profile if needed
              await deletePatientData(user.uid, Array.from(selectedPatients));
              
              // Refresh the patient list
              await fetchPatients();
              
              // Exit edit mode and clear selections
              setIsEditMode(false);
              setSelectedPatients(new Set());
              
              Alert.alert("Success", "Selected patients have been deleted.");
            } catch (error) {
              console.error("Error deleting patients:", error);
              Alert.alert("Error", "Failed to delete patients. Please try again.");
            }
          }
        }
      ]
    );
  };

  const deletePatientData = async (userId: string, patientIds: string[]) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    // Check if we're deleting the default patient and get current default patient name
    let defaultPatientName: string | undefined;
    let shouldUpdateDefaultPatient = false;

    // Use platform-aware approach for deleting patient data
    if (Platform.OS === 'web') {
      // Use Firestore REST API for web
      const token = await user.getIdToken();
      
      // First, get the current default patient name
      const userUrl = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/users/${user.uid}`;
      const userResponse = await fetch(userUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (userResponse.ok) {
        const userDoc = await userResponse.json();
        defaultPatientName = userDoc.fields?.defaultPatientName?.stringValue;
        shouldUpdateDefaultPatient = !!(defaultPatientName && patientIds.includes(defaultPatientName));
      }
      
      // Get all visits to find which ones to delete
      const visitsUrl = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/visits`;
      const visitsResponse = await fetch(visitsUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (visitsResponse.ok) {
        const visitsDoc = await visitsResponse.json();
        const visitsToDelete = (visitsDoc.documents || [])
          .filter((doc: any) => 
            doc.fields?.createdBy?.stringValue === userId &&
            patientIds.includes(doc.fields?.patientName?.stringValue)
          );

        // Delete each visit document
        for (const visit of visitsToDelete) {
          const visitId = visit.name.split('/').pop();
          const deleteUrl = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/visits/${visitId}`;
          await fetch(deleteUrl, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
          });
        }
      }

      // If we're deleting the default patient, update the user profile
      if (shouldUpdateDefaultPatient) {
        const updateUrl = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/users/${user.uid}`;
        await fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            fields: {
              defaultPatientName: { stringValue: '' }, // Clear the default patient
              updatedAt: { timestampValue: new Date().toISOString() }
            }
          })
        });
      }
    } else {
      // Try native SDK first, with REST fallback
      try {
        if (firestore && typeof firestore === 'function') {
          // First, get the current default patient name
          const userDoc = await firestore().collection('users').doc(user.uid).get();
          const userData = userDoc.data();
          defaultPatientName = userData?.defaultPatientName;
          shouldUpdateDefaultPatient = !!(defaultPatientName && patientIds.includes(defaultPatientName));

          // Delete all visits for the selected patients
          const visitsSnapshot = await firestore()
            .collection('visits')
            .where('createdBy', '==', userId)
            .get();

          const batch = firestore().batch();
          let hasDeletes = false;

          visitsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (patientIds.includes(data.patientName)) {
              batch.delete(doc.ref);
              hasDeletes = true;
            }
          });

          // If we're deleting the default patient, update the user profile
          if (shouldUpdateDefaultPatient) {
            const userRef = firestore().collection('users').doc(user.uid);
            batch.update(userRef, {
              defaultPatientName: '', // Clear the default patient
              updatedAt: firestore.FieldValue.serverTimestamp()
            });
            hasDeletes = true;
          }

          if (hasDeletes) {
            await batch.commit();
          }
        } else {
          throw new Error('Native Firestore not available');
        }
      } catch (nativeError) {
        console.warn('Native Firestore delete failed, using REST fallback:', nativeError);
        // Fallback to REST API if native SDK fails
        const token = await user.getIdToken();
        
        // First, get the current default patient name
        const userUrl = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/users/${user.uid}`;
        const userResponse = await fetch(userUrl, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (userResponse.ok) {
          const userDoc = await userResponse.json();
          defaultPatientName = userDoc.fields?.defaultPatientName?.stringValue;
          shouldUpdateDefaultPatient = !!(defaultPatientName && patientIds.includes(defaultPatientName));
        }
        
        // Get all visits to find which ones to delete
        const visitsUrl = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/visits`;
        const visitsResponse = await fetch(visitsUrl, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (visitsResponse.ok) {
          const visitsDoc = await visitsResponse.json();
          const visitsToDelete = (visitsDoc.documents || [])
            .filter((doc: any) => 
              doc.fields?.createdBy?.stringValue === userId &&
              patientIds.includes(doc.fields?.patientName?.stringValue)
            );

          // Delete each visit document
          for (const visit of visitsToDelete) {
            const visitId = visit.name.split('/').pop();
            const deleteUrl = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/visits/${visitId}`;
            await fetch(deleteUrl, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` },
            });
          }
        }

        // If we're deleting the default patient, update the user profile
        if (shouldUpdateDefaultPatient) {
          const updateUrl = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/users/${user.uid}`;
          await fetch(updateUrl, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              fields: {
                defaultPatientName: { stringValue: '' }, // Clear the default patient
                updatedAt: { timestampValue: new Date().toISOString() }
              }
            })
          });
        }
      }
    }
  };

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <TouchableOpacity 
      style={[
        styles.patientCard,
        isEditMode && selectedPatients.has(item.id) && styles.selectedPatientCard
      ]}
      onPress={() => {
        if (isEditMode) {
          handlePatientSelection(item.id);
        } else {
          handleSelectPatient(item);
        }
      }}
    >
      {isEditMode && (
        <TouchableOpacity 
          style={styles.radioContainer}
          onPress={() => handlePatientSelection(item.id)}
        >
          <View style={[
            styles.radioButton,
            selectedPatients.has(item.id) && styles.radioButtonSelected
          ]}>
            {selectedPatients.has(item.id) && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </View>
        </TouchableOpacity>
      )}
      
      <View style={styles.patientIconContainer}>
        <Ionicons name="person" size={32} color="#2196F3" />
      </View>
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.patientLastVisit}>Last visit: {item.lastVisit}</Text>
      </View>
      {!isEditMode && (
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      )}
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
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={handleEditMode}
        >
          <Text style={styles.editButtonText}>
            {isEditMode ? "Done" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Delete Button - Show when in edit mode and patients are selected */}
      {isEditMode && selectedPatients.size > 0 && (
        <View style={styles.deleteHeader}>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDeleteSelected}
          >
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.deleteButtonText}>
              Delete ({selectedPatients.size})
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#2196F3",
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  deleteHeader: {
    backgroundColor: "#f44336",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#d32f2f",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
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
  selectedPatientCard: {
    backgroundColor: "#E3F2FD",
    borderWidth: 2,
    borderColor: "#2196F3",
  },
  radioContainer: {
    marginRight: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
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

