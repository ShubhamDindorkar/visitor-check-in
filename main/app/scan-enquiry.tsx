import React, { useCallback, useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from '@react-native-firebase/auth';
import firestore from "@react-native-firebase/firestore";

// Try/catch import for expo-camera to handle missing module gracefully
let CameraView: any = null;
let useCameraPermissions: any = null;

try {
  const { CameraView: CV, useCameraPermissions: UCP } = require("expo-camera");
  CameraView = CV;
  useCameraPermissions = UCP;
} catch (error) {
  console.warn("Camera module not available:", error);
  try {
    const cameraModule = require("expo-camera");
    CameraView = cameraModule.CameraView || cameraModule.Camera;
    useCameraPermissions = cameraModule.useCameraPermissions;
  } catch (fallbackError) {
    console.warn("Camera fallback import also failed:", fallbackError);
  }
}

export default function ScanEnquiryScreen() {
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions ? useCameraPermissions() : [null, () => {}];
  const [scanned, setScanned] = useState<boolean>(false);
  const [torchEnabled, setTorchEnabled] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    setCameraAvailable(!!CameraView && !!useCameraPermissions);
    
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const onBarCodeScanned = useCallback(async ({ data }: any) => {
    if (scanned || isProcessing) return;
    setScanned(true);
    setIsProcessing(true);
    
    const qrData = String(data ?? "");
    console.log("QR Code scanned for enquiry:", qrData);
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert("Error", "Please log in first");
        router.replace("/");
        return;
      }

      // Check if user has completed their profile (has default patient/enquirer info)
      let userData: any = null;
      
      if (Platform.OS === 'web') {
        const token = await user.getIdToken();
        const url = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/users/${user.uid}`;
        
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const docData = await response.json();
          userData = {
            visitorName: docData.fields?.visitorName?.stringValue || user.displayName || 'Enquirer',
            visitorMobile: docData.fields?.visitorMobile?.stringValue || '',
            defaultPatientName: docData.fields?.defaultPatientName?.stringValue || ''
          };
        }
      } else {
        try {
          if (firestore && typeof firestore === 'function') {
            const userDoc = await firestore().collection('users').doc(user.uid).get();
            userData = userDoc.data();
          }
        } catch (error) {
          console.warn('Error fetching user data:', error);
        }
      }

      const enquirerName = userData?.visitorName || user.displayName || 'Enquirer';
      const enquirerMobile = userData?.visitorMobile || '';
      const patientName = userData?.defaultPatientName || '';

      if (!enquirerMobile) {
        Alert.alert(
          "Profile Incomplete",
          "Please complete your profile first",
          [{ text: "OK", onPress: () => router.replace("/welcome") }]
        );
        return;
      }

      // Create enquiry entry
      const currentTime = new Date();
      let enquiryId: string;
      
      if (Platform.OS === 'web') {
        const token = await user.getIdToken();
        const now = new Date().toISOString();
        
        enquiryId = `enquiry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const fields = {
          enquirerName: { stringValue: enquirerName },
          enquirerMobile: { stringValue: enquirerMobile },
          patientName: { stringValue: patientName || 'Not specified' },
          status: { stringValue: 'pending' },
          createdAt: { timestampValue: now },
          createdBy: { stringValue: user.uid },
          _qrScan: { booleanValue: true }
        };

        const url = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/enquiries/${enquiryId}`;
        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ fields })
        });

        if (!response.ok) {
          throw new Error('Failed to log enquiry');
        }
        
        console.log("✅ Enquiry logged via QR scan (REST):", enquiryId);
      } else {
        try {
          if (firestore && typeof firestore === 'function') {
            const ts = firestore.FieldValue.serverTimestamp();
            
            const docRef = await firestore().collection('enquiries').add({
              enquirerName,
              enquirerMobile,
              patientName: patientName || 'Not specified',
              status: 'pending',
              createdAt: ts,
              createdBy: user.uid,
              _qrScan: true,
            });

            enquiryId = docRef.id;
            console.log("✅ Enquiry logged via QR scan (native):", enquiryId);
          } else {
            throw new Error('Native Firestore not available');
          }
        } catch (error) {
          // Fallback to REST
          const token = await user.getIdToken();
          const now = new Date().toISOString();
          
          enquiryId = `enquiry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          const fields = {
            enquirerName: { stringValue: enquirerName },
            enquirerMobile: { stringValue: enquirerMobile },
            patientName: { stringValue: patientName || 'Not specified' },
            status: { stringValue: 'pending' },
            createdAt: { timestampValue: now },
            createdBy: { stringValue: user.uid },
            _qrScan: { booleanValue: true }
          };

          const url = `https://firestore.googleapis.com/v1/projects/visitor-management-241ea/databases/(default)/documents/enquiries/${enquiryId}`;
          const response = await fetch(url, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ fields })
          });

          if (!response.ok) {
            throw new Error('Failed to log enquiry');
          }
          
          console.log("✅ Enquiry logged via QR scan (REST fallback):", enquiryId);
        }
      }

      Alert.alert(
        "Success!",
        "Your enquiry has been logged successfully",
        [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error("Error processing QR scan:", error);
      Alert.alert("Error", "Failed to log enquiry. Please try again.");
      setScanned(false);
      setIsProcessing(false);
    }
  }, [scanned, isProcessing]);

  const handleBack = () => {
    router.back();
  };

  if (!cameraAvailable) {
    return (
      <SafeAreaView style={styles.center}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Camera not available</Text>
        <Text style={styles.muted}>Camera module is not properly installed.</Text>
      </SafeAreaView>
    );
  }

  if (!permission) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Requesting camera permission…</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.title}>Camera access is required</Text>
        <Text style={styles.muted}>Enable camera permission in Settings.</Text>
        <TouchableOpacity 
          style={styles.permissionButton} 
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.scannerContainer}>
        <CameraView
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          enableTorch={torchEnabled}
          onBarcodeScanned={scanned ? undefined : onBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        
        <View style={styles.scanFrame} />

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>Scan QR Code for Enquiry</Text>
          <Text style={styles.instructionsSubtext}>Align QR code within the frame</Text>
        </View>

        {scanned && (
          <View style={styles.overlay}>
            <Ionicons name="checkmark-circle" size={60} color="#1C4B46" />
            <Text style={styles.overlayText}>QR Code Scanned!</Text>
            <Text style={styles.overlaySubtext}>Logging your enquiry...</Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.torchButton}
          onPress={() => setTorchEnabled(!torchEnabled)}
        >
          <Ionicons 
            name={torchEnabled ? "flash" : "flash-off"} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>

        {scanned && (
          <TouchableOpacity 
            style={styles.scanAgainButton}
            onPress={() => { setScanned(false); setIsProcessing(false); }}
          >
            <Text style={styles.scanAgainText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#000",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  muted: {
    color: "#999",
    marginTop: 12,
    textAlign: "center",
    fontSize: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#fff",
    marginBottom: 8,
  },
  scannerContainer: {
    flex: 1,
    position: "relative",
  },
  scanFrame: {
    position: "absolute",
    top: "30%",
    left: "10%",
    right: "10%",
    height: 250,
    borderWidth: 2,
    borderColor: "#1C4B46",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  instructionsContainer: {
    position: "absolute",
    top: "20%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  instructionsText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  instructionsSubtext: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
  },
  overlaySubtext: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 8,
  },
  torchButton: {
    position: "absolute",
    bottom: 40,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  scanAgainButton: {
    position: "absolute",
    bottom: 40,
    left: 30,
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: "#1C4B46",
    borderRadius: 28,
    shadowColor: "#1C4B46",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scanAgainText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  permissionButton: {
    backgroundColor: "#1C4B46",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 28,
    marginTop: 24,
    shadowColor: "#1C4B46",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});

