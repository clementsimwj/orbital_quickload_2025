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
import KeyboardAvoidingContatiner from "../components/KeyboardAvoidingContainer";
import { useAuth } from '@/context/AuthContext'


export default function Login() {
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
            source={require("../assets/images/logo.png")}
          />
          <Text style={styles.title}>QuickLoad</Text>
        </View>
        <View style={styles.lowerWrapper}>
          <View>
            <Text
              style={{
                color: "white",
                marginVertical: responsiveHeight(1),
                fontSize: RFValue(15),
              }}
            >
              Telegram Handle:
            </Text>
            <TextInput value={username} onChangeText={setUsername}
              style={styles.textBox}
              placeholder="Do not include '@'"
            ></TextInput>
          </View>
          <View>
            <Text
              style={{
                color: "white",
                marginVertical: responsiveHeight(1),
                fontSize: RFValue(15),
              }}
            >
              Password:
            </Text>
            <TextInput value={password} onChangeText={setPassword}
              style={styles.textBox}
              secureTextEntry={true}
              placeholder="Enter your password"
            ></TextInput>
          </View>
          <TouchableOpacity
            style={{ marginVertical: responsiveHeight(2) }}
            onPress={() => router.push("/register")}
          >
            <Text style={{ color: "#EF7C00" }}>
              Don't have an account? Create one.
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Proceed</Text>
          </TouchableOpacity>
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
    fontSize: RFValue(40),
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
  textBox: {
    borderRadius: 10,
    width: responsiveWidth(75),
    backgroundColor: "white",
    marginVertical: responsiveHeight(2),
  },
  button: {
    marginVertical: responsiveHeight(10),
    borderRadius: 10,
    backgroundColor: "#EF7C00",
    paddingVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(5),
  },
  buttonText: {
    fontFamily: "Epilogue-ExtraBold",
    fontSize: RFValue(20),
    color: "white",
  },
});
