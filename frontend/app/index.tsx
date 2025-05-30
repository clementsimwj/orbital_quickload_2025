import {
  Linking,
  Text,
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Button,
  ActivityIndicator,
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { logout, isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" />
            </View>)
  }
  if (!isAuthenticated) return <Redirect href='/login'/>
  return (
    <View style={{ padding: 20 }}>
      <Text>Welcome to the Home page!</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}


