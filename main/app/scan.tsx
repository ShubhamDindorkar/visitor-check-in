import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Platform, StyleSheet, Text, TextInput, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera, CameraView, BarcodeScanningResult } from "expo-camera";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

type PermissionStatus = "unknown" | "granted" | "denied";

type VisitPayload = {
  visitorName: string;
  visitorMobile: string;
  patientName: string;
};

export default function ScanScreen() {
  const [permission, setPermission] = useState<PermissionStatus>("unknown");
  const [scanned, setScanned] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [rawData, setRawData] = useState<string>("");
  const [form, setForm] = useState<VisitPayload>({ visitorName: "", visitorMobile: "", patientName: "" });

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setPermission(status === "granted" ? "granted" : "denied");
      } catch (e) {
        setPermission("denied");
      }
    })();
  }, []);

  const parseQr = useCallback((data: string): Partial<VisitPayload> => {
    try {
      const obj = JSON.parse(data);
      const visitorName = typeof obj?.visitorName === "string" ? obj.visitorName : "";
      const visitorMobile = typeof obj?.visitorMobile === "string" ? obj.visitorMobile : "";
      const patientName = typeof obj?.patientName === "string" ? obj.patientName : "";
      return { visitorName, visitorMobile, patientName };
    } catch {
      return { visitorName: data || "", visitorMobile: "", patientName: "" };
    }
  }, []);

  const onBarCodeScanned = useCallback(async ({ data }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    setRawData(String(data ?? ""));
    const parsed = parseQr(String(data ?? ""));
    setForm(prev => ({ ...prev, ...parsed }));
    Alert.alert("Scanned", "QR code captured. Review details and save.");
  }, [parseQr, scanned]);

  const canSubmit = useMemo(() => {
    return form.visitorName.trim().length > 0 && form.patientName.trim().length > 0;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      Alert.alert("Missing info", "Please provide visitor and patient names.");
      return;
    }

    const user = auth().currentUser;
    const createdBy = user?.uid ?? "unknown";

    try {
      setIsSubmitting(true);
      const ts = firestore.FieldValue.serverTimestamp();
      await firestore().collection("visits").add({
        visitorName: form.visitorName.trim(),
        visitorMobile: form.visitorMobile.trim(),
        patientName: form.patientName.trim(),
        status: "checked_in",
        checkInTime: ts,
        createdAt: ts,
        date: ts,
        createdBy,
        _raw: rawData,
        _device: Platform.OS,
      });
      Alert.alert("Success", "Visit checked in successfully.");
      setForm({ visitorName: "", visitorMobile: "", patientName: "" });
      setRawData("");
      setScanned(false);
    } catch (error) {
      Alert.alert("Error", "Failed to save visit. Please try again.");
      // eslint-disable-next-line no-console
      console.error("Failed to add visit:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, form.patientName, form.visitorMobile, form.visitorName, rawData]);

  if (permission === "unknown") {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Requesting camera permission…</Text>
      </SafeAreaView>
    );
  }

  if (permission === "denied") {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.title}>Camera access is required to scan QR codes.</Text>
        <Text style={styles.muted}>Enable camera permission in Settings and try again.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.scannerContainer}>
        <CameraView
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={scanned ? undefined : onBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Visit details</Text>
        <TextInput
          style={styles.input}
          placeholder="Visitor name"
          value={form.visitorName}
          onChangeText={(t) => setForm((p) => ({ ...p, visitorName: t }))}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Visitor mobile"
          value={form.visitorMobile}
          onChangeText={(t) => setForm((p) => ({ ...p, visitorMobile: t }))}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Patient name"
          value={form.patientName}
          onChangeText={(t) => setForm((p) => ({ ...p, patientName: t }))}
          autoCapitalize="words"
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Button title={isSubmitting ? "Saving…" : "Save visit"} onPress={handleSubmit} disabled={!canSubmit || isSubmitting} />
          </View>
          <View style={styles.rowItem}>
            <Button title="Scan Again" onPress={() => { setScanned(false); setRawData(""); }} />
          </View>
        </View>
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
  },
  muted: {
    color: "#666",
    marginTop: 12,
    textAlign: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  scannerContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
});


