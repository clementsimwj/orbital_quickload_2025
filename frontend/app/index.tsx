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
  Alert,
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";


export default function Index() {
  const { token, logout, isAuthenticated, isLoading } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    if(isAuthenticated && token) {
      axios.get(`http://10.0.2.2:8000/`, {
        headers : {Authorization : `Bearer ${token}`},
      })
      .then((response) => {
        setUserData(response.data.User.handle);
        setLoadingUser(false);
      })
      .catch((error) => {
        Alert.alert("Error", "Cannot fetch user data");
        setLoadingUser(false);
      });
    } else {
      setLoadingUser(false);
    }
  }, [isAuthenticated, token]);

  if (isLoading || loadingUser) {
    return (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" />
            </View>)
  }
  if (!isAuthenticated) return <Redirect href='/login'/>
  return (
    <View style={{ padding: 20 }}>
      <Text>Welcome to Quickload!</Text>
      {userData ? (<Text>{JSON.stringify(userData, null, 2)}</Text>) : (<Text>Unknown User!</Text>)}
      <Button title="Logout" onPress={logout} />
    </View>
  );
}


