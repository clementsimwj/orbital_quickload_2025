import {
  Text,
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Button,
  Alert,
  FlatList,
  ScrollView,
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import React, { useState } from "react";
import axios from "axios";
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Redirect, useFocusEffect } from "expo-router";
import KeyboardAvoidingContatiner from "@/components/KeyboardAvoidingContainer";
import { useAuth } from "@/context/AuthContext";
import Dropdown from "@/components/Dropdown";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface ShareLoad {
  user: string;
  residence: string;
  machine: string;
  loadDuration: string;
  notes: string;
}

interface Residence {
  residence_id: number;
  residence_name: string;
}

interface Machine {
  machine_id: number;
  machine_name: string;
}

export default function Share() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState<String | null>(null);
  const { login, token, isAuthenticated } = useAuth();
  const handleLogin = async () => {
    const success = await login(username, password);
    if (success) {
      router.replace("/");
    } else {
      Alert.alert("Login Failed", "Invalid Credentials");
    }
  };
  const router = useRouter();

  //const [residences, setResidences] = useState<Residence[]>([]);

  const residences = [
    { value: 0, label: "Ridge View Residential College" },
    { value: 1, label: "Residential College 4" },
    { value: 2, label: "Tembusu College" },
    { value: 3, label: "College of Alice and Peter Tan" },
    { value: 4, label: "Acacia College" },
  ];

  const [selectedResidenceName, setSelectedResidenceName] = useState<
    string | null
  >(null);
  const [selectedResidence, setSelectedResidence] = useState<number>();

  const handleSelect = (item: any) => {
    console.log("Selected: ", item);
    setSelectedResidence(item.value);
    setSelectedResidenceName(item.label);
    console.log(selectedResidence);
    axios
      .get(`${API_URL}/share/${selectedResidence}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log(response.data);
        const machineData = response.data.machines;
        if (!userData) {
          setUserData(response.data.user_handle);
        }
        setMachineList(machineData);
      })
      .catch((error) => {
        Alert.alert("Error", "Failed to fetch machines.");
        console.error(error);
      });
  };

  const handleSelectMachine = (item: any) => {
    console.log("Selected: ", item);
    setSelectedMachine(item.label);
    setSelectedMachineId(item.value);
  };

  const [activeTab, setActiveTab] = useState<"findLoad" | "createLoad">(
    "findLoad"
  );

  const [laundryDetails, setLaundryDetails] = useState("");
  const [duration, setDuration] = useState(30);
  const [machineList, setMachineList] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(
    null
  );

  const [loads, setLoads] = useState<ShareLoad[]>([
    {
      user: "User 1",
      machine: "Dryer 2",
      residence: "Ridge View Residential College",
      loadDuration: "20 mins",
      notes: "Towels only",
    },
    {
      user: "User 2",
      machine: "Washer 3",
      residence: "Ridge View Residential College",
      loadDuration: "30 mins",
      notes: "Dark clothes",
    },
  ]);

  const resetForm = () => {
    setSelectedResidenceName(null);
    setLaundryDetails("");
    setDuration(30);
    setSelectedMachine(null);
  };

  const handleCreateLoad = () => {
    const newLoad = {
      id: Date.now().toString(),
      user: `${userData}`,
      residence: `${selectedResidenceName}`,
      machine: `${selectedMachine}`,
      loadDuration: `${duration} mins`,
      notes: laundryDetails,
    };
    if (!selectedMachine) {
      Alert.alert("Please select a machine");
    } else if (!selectedResidenceName) {
      Alert.alert("Please select a residence");
    } else if (!duration) {
      Alert.alert("Please input a duration");
    } else if (duration < 5 || duration > 60) {
      Alert.alert("Please input a valid duration (time between 5 and 60)");
    } else if (laundryDetails == "") {
      Alert.alert("Please input your load details");
    } else {
      setLoads([newLoad, ...loads]);
      setActiveTab("findLoad");
      resetForm();
    }
  };

  const renderLoadCard = ({ item }: { item: ShareLoad }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.user}</Text>
      <Text> {item.machine}</Text>
      <Text>🏠 Residence: {item.residence} </Text>
      <Text>⏳ Duration: {item.loadDuration}</Text>
      <Text>🧺 {item.notes}</Text>
      <TouchableOpacity style={styles.joinButton}>
        <Text style={styles.joinButtonText}>Join Load</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isAuthenticated) return <Redirect href="/login" />;

  return (
    <KeyboardAvoidingContatiner>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.upperWrapper}>
          <Image
            style={styles.logo}
            resizeMode="contain"
            source={require("../../assets/images/share.png")}
          />
          <Text style={styles.title}>Share your Load:</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "findLoad" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("findLoad")}
          >
            <Text
              style={
                activeTab === "findLoad"
                  ? styles.activeText
                  : styles.inactiveText
              }
            >
              Find a Load
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "createLoad" && styles.activeTab,
            ]}
            onPress={() => {
              setActiveTab("createLoad");
              resetForm();
            }}
          >
            <Text
              style={
                activeTab === "createLoad"
                  ? styles.activeText
                  : styles.inactiveText
              }
            >
              Create a Load
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === "findLoad" ? (
          <FlatList
            data={loads}
            renderItem={renderLoadCard}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <ScrollView style={styles.scrollView}>
            <View style={styles.form}>
              <Text style={styles.label}>Residence</Text>
              <View style={styles.dropdown}>
                <Dropdown
                  label="Select your Residence: "
                  items={residences}
                  onSelect={handleSelect}
                />
              </View>
              {selectedResidenceName && (
                <>
                  <Text style={styles.label}>Machine</Text>
                  <Dropdown
                    label="Select your Machine: "
                    items={machineList}
                    onSelect={handleSelectMachine}
                  />
                </>
              )}

              <Text style={styles.label}>Set Duration (minutes)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                onChangeText={(text) => setDuration(parseInt(text))}
              />

              <Text style={styles.label}>
                Laundry Notes (Include Preferred Time of Laundry){" "}
              </Text>
              <TextInput
                style={styles.input}
                value={laundryDetails}
                onChangeText={setLaundryDetails}
                placeholder="e.g. Towels only, warm wash"
              />
              <View style={styles.createButton}>
                <Button title="Create Your Load" onPress={handleCreateLoad} />
              </View>
            </View>
          </ScrollView>
        )}
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
    paddingVertical: responsiveHeight(3),
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },

  tabSwitcher: {
    flexDirection: "row",
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: responsiveHeight(1.5),
    borderBottomWidth: responsiveWidth(0.75),
    borderColor: "#ffffffff",
    alignItems: "center",
  },
  activeTab: {
    borderColor: "#EF7C00",
  },
  activeText: {
    color: "#EF7C00",
    fontWeight: "bold",
    fontSize: 17,
  },
  inactiveText: {
    color: "#ffffffff",
    fontSize: 14,
  },
  form: {
    gap: 12,
    backgroundColor: "#ffffffff",
    marginHorizontal: responsiveWidth(4),
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(1.5),
    borderRadius: 20,
  },
  label: {
    marginTop: responsiveHeight(0.5),
    fontWeight: "bold",
  },
  input: {
    borderColor: "#000000ff",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  dropdown: {
    alignItems: "flex-start",
    justifyContent: "center",
  },
  card: {
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(2),
    marginHorizontal: responsiveWidth(5),
    backgroundColor: "#ffffffff",
    borderRadius: 10,
    marginBottom: 12,
  },
  createButton: {
    marginVertical: responsiveHeight(2),
  },
  cardTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  joinButton: {
    marginTop: 8,
    backgroundColor: "#007bff",
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
  },
  joinButtonText: {
    color: "white",
    fontWeight: "600",
  },
  scrollView: {
    flexGrow: 1,
    flex: 1,
  },
});
