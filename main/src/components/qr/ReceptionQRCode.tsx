import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface ReceptionQRCodeProps {
  size?: number;
  facilityName?: string;
}

/**
 * General QR code to be displayed at reception desk
 * When scanned, it triggers quick check-in for returning visitors
 */
export default function ReceptionQRCode({ 
  size = 300,
  facilityName = "Hospital Reception"
}: ReceptionQRCodeProps) {
  // Deep link that opens the app directly to quick check-in
  // Uses the app's scheme defined in app.json
  const qrData = "main://quick-checkin";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Check-In</Text>
      <Text style={styles.subtitle}>Scan to check in</Text>
      
      <View style={styles.qrContainer}>
        <QRCode
          value={qrData}
          size={size}
          backgroundColor="white"
          color="black"
        />
      </View>
      
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionTitle}>How to use:</Text>
        <Text style={styles.instruction}>1. Open the visitor app</Text>
        <Text style={styles.instruction}>2. Tap "Scan QR" from menu</Text>
        <Text style={styles.instruction}>3. Point camera at this QR code</Text>
        <Text style={styles.instruction}>4. You'll be checked in automatically!</Text>
      </View>
      
      <Text style={styles.note}>
        First-time visitors: Please register at the desk first
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  qrContainer: {
    padding: 30,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#000',
  },
  instructionContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  instruction: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  note: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
});

