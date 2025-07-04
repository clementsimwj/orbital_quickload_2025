import {
  Text,
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Button,
  Alert,
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import React, { useState } from 'react';
import axios from 'axios';
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import KeyboardAvoidingContatiner from "@/components/KeyboardAvoidingContainer";
import { useAuth } from '@/context/AuthContext'


export default function Store() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const {login} = useAuth();
  const handleLogin = async () => {
    const success = await login(username, password);
    if (success) {
      router.replace('/');
    } else {
      Alert.alert('Login Failed', 'Invalid Credentials');
    }
  }
  const router = useRouter();
  return (
    <KeyboardAvoidingContatiner>
      <SafeAreaView style={styles.container}>
        <View style={styles.upperWrapper}>
          <Image
            style={styles.logo}
            resizeMode="contain"
            source={require("../../assets/images/market.png")}
          />
          <Text style={styles.title}>QuickMarket:</Text>
        </View>
        <View style={styles.lowerWrapper}>
          
        </View>
      </SafeAreaView>
    </KeyboardAvoidingContatiner>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003D7C",
  },
  upperWrapper: {
    paddingVertical: responsiveHeight(5),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EF7C00",
  },
  title: {
    fontFamily: "Epilogue-ExtraBold",
    fontWeight: "bold",
    color: "white",
    marginVertical: responsiveWidth(5),
    fontSize: RFValue(30),
    marginLeft: responsiveWidth(2)
  },
  logo: {
    width: responsiveWidth(20),
    height: responsiveHeight(20),
  },
  lowerWrapper: {
    marginVertical: responsiveHeight(10),
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(5),
  },
});
