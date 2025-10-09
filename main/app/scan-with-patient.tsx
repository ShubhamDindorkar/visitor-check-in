import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Try/catch import for expo-camera to handle missing module gracefully
let CameraView: any = null;
let useCameraPermissions: any = null;

try {
  const cameraModule = require("expo-camera");
  CameraView = cameraModule.CameraView;
  useCameraPermissions = cameraModule.useCameraPermissions;
} catch (error) {
  console.warn("Camera module not available:", error);
}

export default function ScanWithPatient() {
  const { patientName } = useLocalSearchParams();
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions ? useCameraPermissions() : [null, () => {}];
  const [scanned, setScanned] = useState<boolean>(false);
  const [torchEnabled, setTorchEnabled] = useState<boolean>(false);

  useEffect(() => {
    setCameraAvailable(!!CameraView && !!useCameraPermissions);
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const onBarCodeScanned = useCallback(async ({ data }: any) => {
    if (scanned) return;
    setScanned(true);
    
    const qrData = String(data ?? "");
    console.log("QR Code scanned:", qrData);
    console.log("Selected patient:", patientName);
    
    // Navigate to quick check-in with patient name
    router.push({
      pathname: "/quick-checkin",
      params: { 
        selectedPatient: patientName?.toString() || ""
      }
    });
  }, [scanned, patientName]);

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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Selected Patient Badge */}
      <View style={styles.patientBadge}>
        <Ionicons name="person" size={20} color="#fff" />
        <Text style={styles.patientBadgeText}>{patientName}</Text>
      </View>

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
          <Text style={styles.instructionsText}>Scan reception QR code</Text>
          <Text style={styles.instructionsSubtext}>Align QR code within the frame</Text>
        </View>

        {/* Success Overlay */}
        {scanned && (
          <View style={styles.overlay}>
            <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            <Text style={styles.overlayText}>QR Code Scanned!</Text>
            <Text style={styles.overlaySubtext}>Checking in {patientName}...</Text>
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
  patientBadge: {
    position: "absolute",
    top: 50,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2196F3",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 10,
    gap: 8,
  },
  patientBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
    borderColor: "#4CAF50",
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
  },
  scanAgainText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

