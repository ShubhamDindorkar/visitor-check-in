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
    Alert.alert("New Enquiry", "Enquiry form coming soon!");
    // TODO: Navigate to enquiry form
    // router.push("/new-enquiry");
  };

  const handleMyEnquiries = () => {
    Alert.alert("My Enquiries", "Enquiries list coming soon!");
    // TODO: Navigate to enquiries list
    // router.push("/my-enquiries");
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
      case 'in_progress': return '#2196F3';
      case 'resolved': return '#4CAF50';
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Enquiry Dashboard</Text>
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => setShowProfileMenu(!showProfileMenu)}
        >
          <Ionicons name="person-circle" size={32} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Profile Menu Dropdown */}
      {showProfileMenu && (
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
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeIconContainer}>
            <Ionicons name="help-circle" size={60} color="#FF9800" />
          </View>
          <Text style={styles.welcomeTitle}>Welcome to Enquiry Portal</Text>
          <Text style={styles.welcomeSubtitle}>
            Submit your questions and track their status
          </Text>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: "#E3F2FD" }]}
            onPress={handleNewEnquiry}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="create" size={36} color="#2196F3" />
            </View>
            <Text style={styles.actionTitle}>New Enquiry</Text>
            <Text style={styles.actionSubtitle}>Submit a question</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: "#FFF3E0" }]}
            onPress={handleMyEnquiries}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="list" size={36} color="#FF9800" />
            </View>
            <Text style={styles.actionTitle}>My Enquiries</Text>
            <Text style={styles.actionSubtitle}>View all enquiries</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.actionCard, styles.fullWidthCard, { backgroundColor: "#F3E5F5" }]}
          onPress={handleSupport}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="chatbubbles" size={36} color="#9C27B0" />
          </View>
          <Text style={styles.actionTitle}>Support</Text>
          <Text style={styles.actionSubtitle}>Get help and support</Text>
        </TouchableOpacity>

        {/* Recent Enquiries */}
        {recentEnquiries.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Enquiries</Text>
            {recentEnquiries.map((enquiry) => (
              <View key={enquiry.id} style={styles.enquiryCard}>
                <View style={styles.enquiryHeader}>
                  <Text style={styles.enquirySubject} numberOfLines={1}>
                    {enquiry.subject}
                  </Text>
                  <View 
                    style={[
                      styles.statusBadge, 
                      { backgroundColor: getStatusColor(enquiry.status) }
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusLabel(enquiry.status)}
                    </Text>
                  </View>
                </View>
                <View style={styles.enquiryFooter}>
                  <Ionicons name="calendar-outline" size={14} color="#999" />
                  <Text style={styles.enquiryDate}>
                    {enquiry.createdAt.toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Info Section */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#2196F3" />
          <Text style={styles.infoText}>
            Submit enquiries and track their progress here. Our team will respond as soon as possible.
          </Text>
        </View>
      </ScrollView>
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
  profileButton: {
    padding: 4,
  },
  profileMenu: {
    position: "absolute",
    top: 70,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
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
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
    marginTop: 8,
  },
  actionsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fullWidthCard: {
    width: "100%",
    marginBottom: 24,
  },
  actionIconContainer: {
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  enquiryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  enquiryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  enquirySubject: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  enquiryFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  enquiryDate: {
    fontSize: 14,
    color: "#999",
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1976D2",
    lineHeight: 20,
  },
});

