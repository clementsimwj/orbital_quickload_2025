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
  FlatList,
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
import MachineData from "@/components/MachineData";
import Dropdown from "../components/Dropdown";
import axios from "axios";
import SetTimer from "../components/SetTimer";

interface Washer {
  id: string;
  name: string;
  status: string;
  time?: string;
}

export default function Index() {
  //Authentication Check:
  const { token, logout, isAuthenticated, isLoading } = useAuth();
  const [userData, setUserData] = useState<String>();
  const [loadingUser, setLoadingUser] = useState(true);
  const [timerVisible, setTimerVisible] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState<number>(0);
  const [selectedMachineName, setSelectedMachineName] = useState("");

  //Will be taken from database
  const items = [
    { id: "1", label: "Ridge View Residential College", value: "rvrc" },
    { id: "2", label: "Residential College 4", value: "rc4" },
    { id: "3", label: "Tembusu College", value: "tc" },
    { id: "4", label: "College of Alice and Peter Tan", value: "capt" },
    { id: "5", label: "NUSC", value: "nusc" },
    { id: "6", label: "Acacia College", value: "ac" },
  ];
  const laundryData: Record<string, Washer[]> = {
    rvrc: [
      { id: "1", name: "RVRC Washer 1", status: "Available", time: "" },
      { id: "2", name: "RVRC Washer 2", status: "In-Use", time: "10" },
    ],
    rc4: [
      { id: "3", name: "RC4 Washer 1", status: "Available", time: "" },
      { id: "4", name: "RC4 Washer 2", status: "Available", time: "" },
    ],
    tc: [
      { id: "5", name: "Tembu Washer 1", status: "Available", time: "" },
      { id: "6", name: "Tembu Washer 2", status: "Available", time: "" },
    ],
    capt: [
      { id: "7", name: "Capt Washer 1", status: "In-Use", time: "20" },
      { id: "8", name: "Capt Washer 2", status: "Available", time: "" },
    ],
    nusc: [
      { id: "9", name: "NUSC Washer 1", status: "In-Use", time: "15" },
      { id: "10", name: "NUSC Washer 2", status: "Available", time: "" },
    ],
    ac: [
      { id: "11", name: "Acacia Washer 1", status: "In-Use", time: "30" },
      { id: "12", name: "Acacia Washer 2", status: "Available", time: "" },
    ],
  };

  const [selectedResidence, setSelectedResidence] = useState<string>("");

  const handleSelect = (item: any) => {
    console.log("Selected: ", item);
    setSelectedResidence(item.value);
  };

  const handleStart = () => {};

  useEffect(() => {
    if (isAuthenticated && token) {
      axios
        .get(`http://10.0.2.2:8000/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUserData(response.data.User.handle);
          setLoadingUser(false);
        })
        .catch((error) => {
          Alert.alert("Error", error);
          setLoadingUser(false);
        });
    } else {
      setLoadingUser(false);
    }
  }, [isAuthenticated, token]);

  if (isLoading || loadingUser) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (!isAuthenticated) return <Redirect href="/login" />;

  const machines = selectedResidence ? laundryData[selectedResidence] : [];

  const handlePress = (machine_id: number, machine_name: string) => {
    setSelectedMachineId(machine_id);
    setSelectedMachineName(machine_name);
    setTimerVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.upperWrapper}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity onPress={logout}>
            <Image
              style={styles.logoutImage}
              resizeMode="contain"
              source={require("../assets/images/logoutButton.png")}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Welcome: </Text>
        </View>
        {userData ? (
          <Text style={styles.user}>{userData}</Text>
        ) : (
          <Text style={styles.user}>Unknown User!</Text>
        )}
      </View>
      <View
        style={{
          alignItems: "flex-start",
          justifyContent: "center",
          marginVertical: responsiveHeight(2),
        }}
      >
        <Text
          style={{
            marginBottom: responsiveHeight(1),
            fontSize: RFValue(15),
            color: "#c8cac9",
          }}
        >
          Residence:
        </Text>
        <Dropdown
          label="Select your Residences: "
          items={items}
          onSelect={handleSelect}
        />
      </View>
      <Text
        style={{ fontSize: RFValue(15), color: "#c8cac9", fontWeight: "bold" }}
      >
        Washing Machine Status:
      </Text>
      <View style={styles.card}>
        {selectedResidence && (
          <>
            {laundryData[selectedResidence]?.map((machine) => (
              <MachineData
                key={machine.id}
                id={machine.id}
                name={machine.name}
                status={machine.status}
                time={machine.time}
                handlePress={handlePress}
              />
            ))}
          </>
        )}
      </View>
      <SetTimer
        visible={timerVisible}
        selectedMachineId={selectedMachineId}
        selectedMachineName={selectedMachineName}
        onClose={() => setTimerVisible(false)}
        onStart={handleStart}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003D7C",
    alignItems: "center",
  },
  upperWrapper: {
    backgroundColor: "#EF7C00",
    paddingVertical: responsiveHeight(5),
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(12),
  },
  title: {
    fontFamily: "Epilogue-ExtraBold",
    fontWeight: "bold",
    color: "white",
    marginVertical: responsiveWidth(5),
    fontSize: RFValue(40),
    marginHorizontal: responsiveWidth(10),
  },
  user: {
    color: "#cdf4f8",
    fontSize: RFValue(20),
    fontStyle: "italic",
  },
  logoutImage: {
    width: responsiveWidth(8),
    height: responsiveHeight(8),
  },
  card: {
    marginVertical: responsiveHeight(3),
  },
});
