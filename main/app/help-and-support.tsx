import React from "react";
import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity, Linking, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type ContactInfo = {
  type: "phone" | "email";
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const contactData: ContactInfo[] = [
  { type: "phone", value: "+91 98908 81188", icon: "call" },
  { type: "phone", value: "+91 90750 90188", icon: "call" },
  { type: "phone", value: "+91 98234 39938", icon: "call" },
  { type: "email", value: "info@kalpavrukshacare.com", icon: "mail" },
  { type: "email", value: "kothrud@kalpavrukshacare.com", icon: "mail" },
  { type: "email", value: "bavdhan@kalpavrukshacare.com", icon: "mail" },
  { type: "email", value: "punesatararoad@kalpavrukshacare.com", icon: "mail" },
  { type: "email", value: "banenx@kalpavrukshacare.com", icon: "mail" },
];

export default function HelpAndSupport() {
  const handleContactPress = async (contactInfo: ContactInfo) => {
    try {
      if (contactInfo.type === "phone") {
        const phoneUrl = `tel:${contactInfo.value}`;
        const canOpen = await Linking.canOpenURL(phoneUrl);
        if (canOpen) {
          await Linking.openURL(phoneUrl);
        } else {
          Alert.alert("Error", "Unable to make phone call");
        }
      } else if (contactInfo.type === "email") {
        const emailUrl = `mailto:${contactInfo.value}`;
        const canOpen = await Linking.canOpenURL(emailUrl);
        if (canOpen) {
          await Linking.openURL(emailUrl);
        } else {
          Alert.alert("Error", "Unable to open email client");
        }
      }
    } catch (error) {
      console.error("Error opening contact:", error);
      Alert.alert("Error", "Unable to open contact information");
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Us Title */}
        <Text style={styles.contactTitle}>Contact us</Text>
        
        {/* Contact Information */}
        <View style={styles.contactContainer}>
          {contactData.map((contact, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactItem}
              onPress={() => handleContactPress(contact)}
              activeOpacity={0.7}
            >
              <View style={styles.contactIconContainer}>
                <Ionicons 
                  name={contact.icon} 
                  size={20} 
                  color={contact.type === "phone" ? "#007AFF" : "#FF6B35"} 
                />
              </View>
              <Text style={[
                styles.contactText,
                contact.type === "phone" ? styles.phoneText : styles.emailText
              ]}>
                {contact.value}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Information */}
        <View style={styles.infoContainer}>
          {/* <Text style={styles.infoTitle}>How can we help you?</Text>
          <Text style={styles.infoText}>
            Our support team is available to assist you with any questions or concerns. 
            You can reach us through phone or email using the contact information above.
          </Text> */}
          
          {/* <Text style={styles.infoTitle}>Business Hours</Text>
          <Text style={styles.infoText}>
            Monday - Saturday: 9:00 AM - 8:00 PM{"\n"}
            Sunday: 10:00 AM - 6:00 PM
          </Text> */}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contactTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginTop: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  contactContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  contactIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  phoneText: {
    color: "#007AFF",
  },
  emailText: {
    color: "#FF6B35",
  },
  infoContainer: {
    marginTop: 32,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginTop: 24,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 8,
  },
});