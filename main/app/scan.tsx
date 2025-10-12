import React, { useCallback, useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Try/catch import for expo-camera to handle missing module gracefully
let CameraView: any = null;
let useCameraPermissions: any = null;
let BarcodeScanningResult: any = null;

try {
  const { CameraView: CV, useCameraPermissions: UCP } = require("expo-camera");
  CameraView = CV;
  useCameraPermissions = UCP;
} catch (error) {
  console.warn("Camera module not available:", error);
  try {
    // Fallback: try importing directly
    const cameraModule = require("expo-camera");
    CameraView = cameraModule.CameraView || cameraModule.Camera;
    useCameraPermissions = cameraModule.useCameraPermissions;
    BarcodeScanningResult = cameraModule.BarcodeScanningResult;
  } catch (fallbackError) {
    console.warn("Camera fallback import also failed:", fallbackError);
  }
}

export default function ScanScreen() {
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions ? useCameraPermissions() : [null, () => {}];
  const [scanned, setScanned] = useState<boolean>(false);
  const [torchEnabled, setTorchEnabled] = useState<boolean>(false);

  useEffect(() => {
    console.log("Camera availability check:", {
      CameraView: !!CameraView,
      useCameraPermissions: !!useCameraPermissions,
      platform: Platform.OS
    });
    
    setCameraAvailable(!!CameraView && !!useCameraPermissions);
    
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
    
    // Force request permission on mount if not granted
    if (permission && !permission.granted) {
      console.log("Camera permission not granted, requesting...");
      requestPermission();
    }
  }, [permission, requestPermission]);

  const onBarCodeScanned = useCallback(async ({ data }: any) => {
    if (scanned) return;
    setScanned(true);
    
    const qrData = String(data ?? "");
    console.log("QR Code scanned:", qrData);
    
    // Check if this is the reception check-in QR with deep link
    if (qrData.includes("main://quick-checkin") || qrData.includes("quick-checkin")) {
      // Navigate to quick check-in page - it will handle fetching saved patient info
      router.push("/quick-checkin");
      return;
    }
    
    // Try to parse as JSON (for personal visitor QR codes)
    try {
      const parsedData = JSON.parse(qrData);
      if (parsedData.visitorMobile && parsedData.patientName) {
        // This is a personal visitor QR code - use quick check-in
        console.log("Parsed visitor QR data:", parsedData);
        router.push("/quick-checkin");
        return;
      }
    } catch (e) {
      // Not JSON, continue to fallback
    }
    
    // For any other QR code, also use quick check-in
    // The quick-checkin page will fetch the user's saved patient details
    Alert.alert("Processing", "Checking you in with your saved details...");
    setTimeout(() => {
      router.push("/quick-checkin");
    }, 500);
  }, [scanned]);

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
        <Text style={styles.muted}>Camera module is not properly installed. Please rebuild the app.</Text>
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
        <Text style={styles.title}>Camera access is required to scan QR codes.</Text>
        <Text style={styles.muted}>Enable camera permission in Settings and try again.</Text>
        <TouchableOpacity 
          style={styles.permissionButton} 
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.permissionButton, { backgroundColor: '#666', marginTop: 10 }]} 
          onPress={handleBack}
        >
          <Text style={styles.permissionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Camera View */}
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
        
        {/* Scanning Frame Overlay */}
        <View style={styles.scanFrame}>
          <View style={styles.scanFrameCorner} />
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>Point camera at QR code</Text>
          <Text style={styles.instructionsSubtext}>Align QR code within the frame</Text>
        </View>

        {/* Success Overlay */}
        {scanned && (
          <View style={styles.overlay}>
            <Ionicons name="checkmark-circle" size={60} color="#1C4B46" />
            <Text style={styles.overlayText}>QR Code Scanned!</Text>
            <Text style={styles.overlaySubtext}>Processing check-in...</Text>
          </View>
        )}

        {/* Torch Button */}
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

        {/* Scan Again Button */}
        {scanned && (
          <TouchableOpacity 
            style={styles.scanAgainButton}
            onPress={() => setScanned(false)}
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
  scanFrameCorner: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderWidth: 4,
    borderColor: "transparent",
    borderRadius: 12,
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