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
import React, { useState, useEffect, useCallback } from "react";
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
  capacity: number;
  notes: string;
}

interface Residence {
  value: number;
  label: string;
}

interface Machine {
  machine_id: number;
  machine_name: string;
}

export default function Share() {
  const [userData, setUserData] = useState<String | null>(null);
  const { token, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const [selectedResidenceName, setSelectedResidenceName] = useState<
    string | null
  >(null);
  const [selectedResidence, setSelectedResidence] = useState<number>();

  useEffect(() => {
    if (selectedResidenceName) {
      console.log("Residence has been updated to:", selectedResidenceName);
      axios
        .get(`${API_URL}/share/${selectedResidence}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          //console.log(response.data);
          console.log(
            "Corresponding machine data has been fetched successfully"
          );
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
    }
  }, [selectedResidence]);

  const handleSelectResidence = (item: any) => {
    console.log("Selected: ", item);
    setSelectedResidence(item.value);
    setSelectedResidenceName(item.label);
  };

  const [laundryDetails, setLaundryDetails] = useState("");
  const [capacity, setCapacity] = useState<number>(2);
  const [machineList, setMachineList] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(
    null
  );

  const handleSelectMachine = (item: any) => {
    console.log("Selected: ", item);
    setSelectedMachine(item.label);
    setSelectedMachineId(item.value);
  };

  const [activeTab, setActiveTab] = useState<"findLoad" | "createLoad">(
    "findLoad"
  );

  const [residences, setResidences] = useState<Residence[]>([]);

  const fetchResidences = useCallback(() => {
    axios
      .get(`${API_URL}/share/residences`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        console.log("Residences have been fetched");
        setResidences(response.data);
      })
      .catch((error) => {
        Alert.alert("Error", "Failed to fetch residences.");
        console.error(error);
      });
  }, []);

  useFocusEffect(fetchResidences);

  const [loads, setLoads] = useState<ShareLoad[]>([]);

  const fetchLoads = useCallback(() => {
    console.log("Fetching SharedLoads...");
    if (isAuthenticated && token) {
      axios
        .get(`${API_URL}/share/shared_loads`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setLoads(response.data);
        })
        .catch((error) => {
          Alert.alert("Error", "Failed to fetch loads.");
          console.error(error);
        })
        .finally(() => {
          console.log("Operation ended!");
        });
    }
  }, []);

  useFocusEffect(fetchLoads);

  const resetForm = () => {
    setSelectedResidenceName(null);
    setLaundryDetails("");
    setCapacity(2);
    setSelectedMachine(null);
  };

  const handleCreateLoad = () => {
    if (!selectedMachine) {
      Alert.alert("Please select a machine");
    } else if (!selectedResidenceName) {
      Alert.alert("Please select a residence");
    } else if (laundryDetails == "") {
      Alert.alert("Please input your load details");
    } else {
      axios
        .post(
          `${API_URL}/share/create_load`,
          {
            machine: selectedMachineId,
            capacity: capacity,
            notes: laundryDetails,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          console.log(response.data.message);
          fetchLoads();
        })
        .catch((error) => Alert.alert("Error", error));

      setActiveTab("findLoad");
      resetForm();
    }
  };

  const renderLoadCard = ({ item }: { item: ShareLoad }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.user}</Text>
      <Text>🧺 Machine: {item.machine}</Text>
      <Text>🏠 Residence: {item.residence} </Text>
      <Text>👤 Max Participants: {item.capacity}</Text>
      <Text>📝 Note: {item.notes}</Text>
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
          <>
            <FlatList
              data={loads}
              renderItem={renderLoadCard}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
            <TouchableOpacity
              style={styles.fab}
              onPress={() => {
                fetchResidences();
                fetchLoads();
              }}
            >
              <Text style={styles.fabText}> ↻ </Text>
            </TouchableOpacity>
          </>
        ) : (
          <ScrollView style={styles.scrollView} nestedScrollEnabled={true}>
            <View style={styles.form}>
              <Text style={styles.label}>Residence</Text>
              <View style={styles.dropdown}>
                <Dropdown
                  label="Select your Residence: "
                  items={residences}
                  onSelect={handleSelectResidence}
                />
              </View>
              {selectedResidenceName && (
                <>
                  <Text style={styles.label}>Machine</Text>
                  <View style={styles.dropdown}>
                    <Dropdown
                      label="Select your Machine: "
                      items={machineList}
                      onSelect={handleSelectMachine}
                    />
                  </View>
                </>
              )}

              <Text style={styles.label}>
                Max Participants (Including Yourself){" "}
              </Text>
              <View style={styles.dropdown}>
                <Dropdown
                  label="2"
                  items={[{ label: "2" }, { label: "3" }, { label: "4" }]}
                  onSelect={(item: any) => setCapacity(parseInt(item.label))}
                />
              </View>

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
                <TouchableOpacity
                  onPress={handleCreateLoad}
                  style={styles.joinButton}
                >
                  <Text style={styles.joinButtonText}> Create Your Load </Text>
                </TouchableOpacity>
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
  fab: {
    position: "absolute",
    bottom: responsiveHeight(2.5),
    right: responsiveWidth(5),
    backgroundColor: "#EF7C00",
    width: responsiveWidth(15),
    height: responsiveHeight(7),
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabText: {
    color: "white",
    fontSize: RFValue(30),
    lineHeight: 30,
    fontWeight: "bold",
  },
});
