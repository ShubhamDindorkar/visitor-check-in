import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// QR Scanner temporarily removed

const { width } = Dimensions.get('window');

interface DashboardButtonProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

const DashboardButton: React.FC<DashboardButtonProps> = ({
  title,
  subtitle,
  icon,
  color,
  onPress,
}) => (
  <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress}>
    <View style={styles.buttonContent}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={32} color="#ffffff" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.buttonTitle}>{title}</Text>
        <Text style={styles.buttonSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#ffffff" style={styles.chevron} />
    </View>
  </TouchableOpacity>
);

interface VisitorDashboardProps {
  userName: string;
  userEmail: string;
  onSignOut: () => void;
}

const VisitorDashboard: React.FC<VisitorDashboardProps> = ({
  userName,
  userEmail,
  onSignOut,
}) => {
  // Scanner state removed

  const handleViewPatients = () => {
    console.log('View Patients pressed');
    // TODO: Navigate to patients list
  };

  const handleAddVisitor = () => {
    console.log('Add Visitor pressed');
    // TODO: Navigate to add visitor form
  };

  const handleCheckIn = () => {
    console.log('Check In pressed');
    Alert.alert('Check In', 'Manual check-in feature coming soon!');
  };

  const handleReports = () => {
    console.log('Reports pressed');
    // TODO: Navigate to reports
  };

  const handleSettings = () => {
    console.log('Settings pressed');
    // TODO: Navigate to settings
  };

  const handleEmergency = () => {
    console.log('Emergency pressed');
    // TODO: Handle emergency protocol
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
          </View>
          <TouchableOpacity style={styles.signOutButton} onPress={onSignOut}>
            <Ionicons name="log-out-outline" size={20} color="#dc3545" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Today's Visitors</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        {/* Main Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <DashboardButton
            title="View Patients"
            subtitle="Browse and manage patient records"
            icon="people-outline"
            color="#4CAF50"
            onPress={handleViewPatients}
          />
          <DashboardButton
            title="Add Visitor"
            subtitle="Register a new visitor"
            icon="person-add-outline"
            color="#2196F3"
            onPress={handleAddVisitor}
          />
          <DashboardButton
            title="Check In"
            subtitle="Process visitor check-in"
            icon="checkmark-circle-outline"
            color="#FF9800"
            onPress={handleCheckIn}
          />
        </View>

        {/* Secondary Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>
          <DashboardButton
            title="Reports"
            subtitle="View visitor statistics and reports"
            icon="bar-chart-outline"
            color="#9C27B0"
            onPress={handleReports}
          />
          <DashboardButton
            title="Settings"
            subtitle="Configure app preferences"
            icon="settings-outline"
            color="#607D8B"
            onPress={handleSettings}
          />
        </View>

        {/* Emergency Section */}
        <View style={styles.section}>
          <DashboardButton
            title="Emergency Protocol"
            subtitle="Access emergency procedures"
            icon="warning-outline"
            color="#F44336"
            onPress={handleEmergency}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Visitor Management System</Text>
          <Text style={styles.footerSubtext}>Version 1.0.0</Text>
        </View>
      </ScrollView>

        {/* QR Scanner removed for now */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6c757d',
  },
  signOutButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fed7d7',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  button: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  chevron: {
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6c757d',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#adb5bd',
  },
});

export default VisitorDashboard;
