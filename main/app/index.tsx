import { View } from "react-native";
import GoogleAuth from "../src/components/auth/google-auth";

export default function Index() {
  return (
    <View style={{ flex: 1 }}>
      <GoogleAuth />
    </View>
  );
}
