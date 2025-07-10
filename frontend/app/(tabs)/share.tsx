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
import Dropdown from "@/components/Dropdown";


export default function Share() {
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

  const items = [
  { value : 0, label: "Ridge View Residential College"},
  { value : 1, label: "Residential College 4"},
  { value : 2, label: "Tembusu College"},
  { value : 3, label: "College of Alice and Peter Tan"},
  { value : 4, label: "Acacia College"},
];

  const [selectedResidenceName, setSelectedResidenceName] = useState<string | null>(null);
  const [selectedResidence, setSelectedResidence] = useState<number>();

  const handleSelect = (item: any) => {
    console.log("Selected: ", item)
    setSelectedResidence(item.value);
    setSelectedResidenceName(item.label);
  };

  return (
    <KeyboardAvoidingContatiner>
      <SafeAreaView style={styles.container}>
        <View style={styles.upperWrapper}>
          <Image
            style={styles.logo}
            resizeMode="contain"
            source={require("../../assets/images/share.png")}
          />
          <Text style={styles.title}>Share your Load:</Text>
        </View>
        <View style={styles.lowerWrapper}>
          <View style={{alignItems: 'flex-start', justifyContent: 'center', marginVertical: responsiveHeight(2)}}>
            <Text style={{marginBottom: responsiveHeight(1), fontSize: RFValue(15), color: "#c8cac9"}}>Residence:</Text>
            <Dropdown label="Select your Residences: "
                    items = {items}
                    onSelect={handleSelect}/>
          </View>
          <TouchableOpacity style={styles.button}>
            <Image style={{width: responsiveWidth(20), height: responsiveHeight(12)}} source={require('../../assets/images/shareLoad.png')} resizeMode="contain"/>
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
    marginLeft: responsiveWidth(3),
    fontSize: RFValue(27),
  },
  logo: {
    width: responsiveWidth(20),
    height: responsiveHeight(20),
  },
  lowerWrapper: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(5),
  },
  button: {
    paddingHorizontal: responsiveWidth(2),
    borderRadius: 50,
    flex: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EF7C00",
      elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  }
});
