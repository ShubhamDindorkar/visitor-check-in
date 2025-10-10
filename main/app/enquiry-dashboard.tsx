import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { getAuth } from '@react-native-firebase/auth';
import firestore from "@react-native-firebase/firestore";

interface Enquiry {
  id: string;
  subject: string;
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: Date;
}

export default function EnquiryDashboard() {
  const [userName, setUserName] = useState<string>("");
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      setUserName(user.displayName || user.email || "User");
      fetchRecentEnquiries(user.uid);
    }
  }, []);

  const fetchRecentEnquiries = async (userId: string) => {
    try {
      let enquiries: Enquiry[] = [];

      // Use platform-aware approach for fetching enquiries
      if (Platform.OS === 'web') {
        // Use Firestore REST API for web
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
        const url = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/enquiries`;
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Filter and process enquiries for the user
          const userEnquiries = (data.documents || [])
            .filter((doc: any) => doc.fields?.createdBy?.stringValue === userId)
            .slice(0, 3) // Limit to 3 recent enquiries
            .map((doc: any) => ({
              id: doc.name.split('/').pop(),
              subject: doc.fields?.subject?.stringValue || 'No subject',
              status: doc.fields?.status?.stringValue || 'pending',
              createdAt: doc.fields?.createdAt?.timestampValue 
                ? new Date(doc.fields.createdAt.timestampValue) 
                : new Date(),
            }));
          
          enquiries = userEnquiries;
          console.log("Enquiries fetched via REST API:", enquiries.length);
        } else {
          console.warn('No enquiries found via REST API');
        }
      } else {
        // Try native SDK first, with REST fallback
        try {
          if (firestore && typeof firestore === 'function') {
            const snapshot = await firestore()
              .collection('enquiries')
              .where('createdBy', '==', userId)
              .limit(3)
              .get();
            
            enquiries = snapshot.docs.map(doc => ({
              id: doc.id,
              subject: doc.data().subject || 'No subject',
              status: doc.data().status || 'pending',
              createdAt: doc.data().createdAt?.toDate?.() || new Date(),
            }));
            
            console.log("Enquiries fetched via native SDK:", enquiries.length);
          } else {
            throw new Error('Native Firestore not available');
          }
        } catch (nativeError) {
          console.warn('Native Firestore fetch failed, using REST fallback:', nativeError);
          // Fallback to REST API if native SDK fails
          const auth = getAuth();
          const user = auth.currentUser;
          if (!user) return;

          const token = await user.getIdToken();
          const url = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/enquiries`;
          
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            // Filter and process enquiries for the user
            const userEnquiries = (data.documents || [])
              .filter((doc: any) => doc.fields?.createdBy?.stringValue === userId)
              .slice(0, 3) // Limit to 3 recent enquiries
              .map((doc: any) => ({
                id: doc.name.split('/').pop(),
                subject: doc.fields?.subject?.stringValue || 'No subject',
                status: doc.fields?.status?.stringValue || 'pending',
                createdAt: doc.fields?.createdAt?.timestampValue 
                  ? new Date(doc.fields.createdAt.timestampValue) 
                  : new Date(),
              }));
            
            enquiries = userEnquiries;
            console.log("Enquiries fetched via REST fallback:", enquiries.length);
          } else {
            console.warn('No enquiries found via REST fallback');
          }
        }
      }
      
      setRecentEnquiries(enquiries);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      setRecentEnquiries([]);
    }
  };

  const handleNewEnquiry = () => {
    router.push("/add-enquiry");
  };

  const handleScanQR = () => {
    router.push("/scan-enquiry");
  };

  const handleSupport = () => {
    router.push("/help-and-support");
  };

  const handleBack = () => {
    router.back();
  };

  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await auth.signOut();
      router.replace('/');
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'in_progress': return '#1C4B46';
      case 'resolved': return '#1C4B46';
      default: return '#999';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      default: return 'Unknown';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      {/* Profile Icon */}
      <TouchableOpacity style={styles.profileButton} onPress={() => setShowProfileMenu(!showProfileMenu)}>
        <Ionicons name="person-circle" size={40} color="#1C4B46" />
      </TouchableOpacity>

      {/* Profile Menu Dropdown */}
      {showProfileMenu && (
        <>
          <TouchableOpacity 
            style={styles.dropdownOverlay} 
            onPress={() => setShowProfileMenu(false)}
            activeOpacity={1}
          />
          <View style={styles.profileMenu}>
            <View style={styles.profileMenuItem}>
              <Ionicons name="person" size={20} color="#666" />
              <Text style={styles.profileMenuText}>{userName}</Text>
            </View>
            <TouchableOpacity 
              style={styles.profileMenuItem}
              onPress={handleSignOut}
            >
              <Ionicons name="log-out" size={20} color="#f44336" />
              <Text style={[styles.profileMenuText, { color: "#f44336" }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={styles.content}>
        {/* Main Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {/* Scan QR Button - Primary Action */}
          <TouchableOpacity 
            style={styles.primaryActionButton} 
            onPress={handleScanQR}
          >
            <View style={styles.buttonContentContainer}>
              <Ionicons name="qr-code-outline" size={64} color="white" />
              <Text style={styles.primaryButtonText}>Scan QR Code</Text>
              <Text style={styles.buttonSubtext}>Scan reception QR for enquiry</Text>
            </View>
          </TouchableOpacity>

          {/* Add Enquiry Button */}
          <TouchableOpacity 
            style={styles.secondaryActionButton} 
            onPress={handleNewEnquiry}
          >
            <View style={styles.buttonContentContainer}>
              <Ionicons name="create-outline" size={64} color="#1C4B46" />
              <Text style={styles.secondaryButtonText}>New Enquiry</Text>
              <Text style={styles.secondaryButtonSubtext}>Submit enquiry details</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileButton: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 11,
  },
  profileMenu: {
    position: "absolute",
    top: 120,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 12,
    minWidth: 200,
  },
  profileMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  profileMenuText: {
    fontSize: 16,
    color: "#333",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: "center",
  },
  actionButtonsContainer: {
    width: "100%",
    gap: 24,
    flex: 1,
    justifyContent: "center",
  },
  primaryActionButton: {
    backgroundColor: "#1C4B46",
    borderRadius: 24,
    padding: 36,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
    shadowColor: "#1C4B46",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  secondaryActionButton: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 36,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
    borderWidth: 2.5,
    borderColor: "#1C4B46",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonContentContainer: {
    alignItems: "center",
    gap: 12,
  },
  primaryButtonText: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.5,
    marginTop: 8,
  },
  secondaryButtonText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1C4B46",
    letterSpacing: 0.5,
    marginTop: 8,
  },
  buttonSubtext: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    marginTop: 4,
  },
  secondaryButtonSubtext: {
    fontSize: 15,
    color: "#5D6D69",
    textAlign: "center",
    marginTop: 4,
  },
});

