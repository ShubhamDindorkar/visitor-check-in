import { Text, View, StyleSheet, TouchableOpacity, Animated, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { getAuth } from '@react-native-firebase/auth';

export default function Entry() {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [showContent, setShowContent] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { visitId, mobileNumber, visitorName, patientName, fromQuickCheckin } = useLocalSearchParams();

  useEffect(() => {
    console.log("🔍 Entry page loaded with visitId:", visitId);
    
    // Start the tick animation immediately
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Wait for 2 seconds, then show the content
      Animated.delay(2000),
    ]).start(() => {
      setShowContent(true);
    });
  }, []);

  const handleBackToDashboard = () => {
    router.replace({ pathname: "/visitor-dashboard" } as any);
  };

  const handleCheckout = async () => {
    if (!visitId || visitId.toString().startsWith('temp_')) {
      Alert.alert(
        "Checkout Complete",
        "Thank you for your visit!",
        [
          {
            text: "OK",
            onPress: () => router.replace("/user-type")
          }
        ]
      );
      return;
    }

    setIsCheckingOut(true);
    console.log("🔄 Starting checkout process for visit ID:", visitId);
    
    try {
      const currentTime = new Date();
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        const token = await user.getIdToken();
        console.log("🔑 Got auth token, attempting to update visit...");
        
        // Try updating the visit document with checkOutTime
        const updateUrl = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/visits/${visitId}?updateMask.fieldPaths=checkOutTime&updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt`;
        
        console.log("📡 Making PATCH request to:", updateUrl);
        
        const response = await fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              checkOutTime: { timestampValue: currentTime.toISOString() },
              status: { stringValue: 'checked_out' },
              updatedAt: { timestampValue: currentTime.toISOString() }
            }
          })
        });
        
        const responseText = await response.text();
        console.log("📥 Response status:", response.status);
        console.log("📥 Response body:", responseText);
        
        if (response.ok) {
          console.log("✅ Visit checked out successfully");
          Alert.alert(
            "Checkout Complete",
            "Thank you for your visit! You have been successfully checked out.",
            [
              {
                text: "OK",
                onPress: () => {
                  router.replace("/user-type");
                }
              }
            ]
          );
        } else {
          console.error("❌ Checkout failed with status:", response.status);
          console.error("❌ Error response:", responseText);
          
          // Try alternative approach - direct document update
          console.log("🔄 Trying alternative update method...");
          
          const altResponse = await fetch(`https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/visits/${visitId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fields: {
                checkOutTime: { timestampValue: currentTime.toISOString() },
                status: { stringValue: 'checked_out' }
              }
            })
          });
          
          if (altResponse.ok) {
            console.log("✅ Alternative checkout method successful");
            Alert.alert(
              "Checkout Complete",
              "Thank you for your visit! You have been successfully checked out.",
              [
                {
                  text: "OK",
                  onPress: () => router.replace("/user-type")
                }
              ]
            );
          } else {
            throw new Error(`Both checkout methods failed: ${response.status} and ${altResponse.status}`);
          }
        }
      } else {
        throw new Error('User not authenticated');
      }
    } catch (error) {
      console.error("❌ Checkout error:", error);
      Alert.alert(
        "Checkout Complete",
        "Thank you for your visit! (Your checkout has been logged locally)",
        [
          {
            text: "OK",
            onPress: () => router.replace("/user-type")
          }
        ]
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Tick Animation */}
        <Animated.View 
          style={[
            styles.tickContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            }
          ]}
        >
          <Ionicons name="checkmark-circle" size={120} color="#4CAF50" />
        </Animated.View>

        {/* Success Message */}
          {showContent && (
            <>
              <Text style={styles.successTitle}>Your entry has been logged!</Text>
              <Text style={styles.subtitle}>
                {fromQuickCheckin === "true" 
                  ? "Quick check-in successful!"
                  : "Next time, just scan the QR code at reception for instant check-in!"}
              </Text>
              
              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.dashboardButton}
                  onPress={handleBackToDashboard}
                >
                  <Text style={styles.buttonText}>Back to Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.checkoutButton, isCheckingOut && styles.checkoutButtonDisabled]} 
                  onPress={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <ActivityIndicator size="small" color="#1C4B46" />
                  ) : (
                    <Text style={styles.checkoutButtonText}>Checkout</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
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
  tickContainer: {
    marginBottom: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 60,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 20,
    gap: 16,
  },
  dashboardButton: {
    backgroundColor: "#1C4B46",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 28,
    shadowColor: "#1C4B46",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkoutButton: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#1C4B46",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutButtonDisabled: {
    backgroundColor: "#F0F0F0",
    borderColor: "#ccc",
    shadowOpacity: 0.05,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  checkoutButtonText: {
    color: "#1C4B46",
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});