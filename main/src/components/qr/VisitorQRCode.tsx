import React from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface VisitorQRCodeProps {
  visitorName: string;
  visitorMobile: string;
  patientName?: string;
  size?: number;
}

/**
 * Generates a QR code containing visitor information that can be scanned
 * for quick check-in on future visits
 */
export default function VisitorQRCode({ 
  visitorName, 
  visitorMobile, 
  patientName = "",
  size = 200 
}: VisitorQRCodeProps) {
  // Create JSON data matching the format expected by scan.tsx
  const qrData = JSON.stringify({
    visitorName,
    visitorMobile,
    patientName
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Visitor QR Code</Text>
      <Text style={styles.subtitle}>Save this QR code for quick check-in next time</Text>
      
      <View style={styles.qrContainer}>
        <QRCode
          value={qrData}
          size={size}
          backgroundColor="white"
          color="black"
        />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Name:</Text>
        <Text style={styles.infoValue}>{visitorName}</Text>
        
        <Text style={styles.infoLabel}>Mobile:</Text>
        <Text style={styles.infoValue}>{visitorMobile}</Text>
        
        {patientName && (
          <>
            <Text style={styles.infoLabel}>Patient:</Text>
            <Text style={styles.infoValue}>{patientName}</Text>
          </>
        )}
      </View>
      
      <Text style={styles.instruction}>
        Screenshot this QR code or scan it directly on your next visit
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 24,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

