import {
  Text,
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
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
import SetTimer from "@/components/SetTimer";
import SharedLoadCard from "@/components/SharedLoadCard";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface ShareLoad {
  share_id: number;
  user: string;
  residence: string;
  machine: string;
  capacity: number;
  notes: string;
  participants: number[];
  machine_id: number;
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
  const [userData, setUserData] = useState<string | null>(null);
  const { token, isAuthenticated, isLoading } = useAuth();
  const [userId, setUserId] = useState<number>(0);

  // list of available residences for selection
  const [residences, setResidences] = useState<Residence[]>([]);

  // sets the residence for the create a load form
  const [selectedResidenceName, setSelectedResidenceName] = useState<
    string | null
  >(null);
  const [selectedResidence, setSelectedResidence] = useState<number>();

  // all the states for the create a load details
  const [laundryDetails, setLaundryDetails] = useState("");
  const [capacity, setCapacity] = useState<number>(2);
  const [machineList, setMachineList] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(
    null
  );

  // current active tab
  const [activeTab, setActiveTab] = useState<"findLoad" | "createLoad">(
    "findLoad"
  );

  // all the shared loads created, to be fill with data from database
  const [loads, setLoads] = useState<ShareLoad[]>([]);

  // all the needed states for start a load
  const [visible, setVisible] = useState<boolean>(false);
  const [startMachine, setStartMachine] = useState<string>("");
  const [startMachineId, setStartMachineId] = useState<number>(0);
  const [shareId, setShareId] = useState<number>(0);

  const [loading, setLoading] = useState(true);

  // gets the corresponding machines based on the selected residence
  useEffect(() => {
    if (selectedResidenceName) {
      console.log("Residence has been updated to:", selectedResidenceName);
      axios
        .get(`${API_URL}/share/residence/${selectedResidence}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          //console.log(response.data);
          console.log(
            "Corresponding machine data has been fetched successfully"
          );
          const machineData = response.data.machines;
          setMachineList(machineData);
        })
        .catch((error) => {
          Alert.alert("Error", "Failed to fetch machines.");
          console.error(error);
        });
    }
  }, [selectedResidence]);

  // used in the residence dropdown for create a load
  const handleSelectResidence = (item: any) => {
    console.log("Selected: ", item);
    setSelectedResidence(item.value);
    setSelectedResidenceName(item.label);
    setSelectedMachine(null);
    setSelectedMachineId(null);
  };

  // used in the machine dropdown for create a load
  const handleSelectMachine = (item: any) => {
    console.log("Selected: ", item);
    setSelectedMachine(item.label);
    setSelectedMachineId(item.value);
  };

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

  const fetchLoads = useCallback(() => {
    console.log("Fetching SharedLoads...");
    setLoading(true);
    if (isAuthenticated && token) {
      axios
        .get(`${API_URL}/share/shared_loads`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setLoads(response.data.loads);
          if (!userData) {
            setUserData(response.data.user_handle);
            setUserId(response.data.user_id);
          }
        })
        .catch((error) => {
          Alert.alert("Error", "Failed to fetch loads.");
          console.error(error);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const resetForm = () => {
    setSelectedResidenceName(null);
    setLaundryDetails("");
    setCapacity(2);
    setSelectedMachine(null);
    setSelectedMachineId(null);
  };

  // The following are all the functions needed for Find a Load tab
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
        })
        .catch((error) => {
          let message = "Something went wrong.";

          if (
            error.response &&
            error.response.data &&
            error.response.data.detail
          ) {
            message = error.response.data.detail;
          }

          Alert.alert("Error", message);
        })
        .finally(() => {
          setActiveTab("findLoad");
          fetchLoads();
          resetForm();
        });
    }
  };

  const handleJoinLoad = (share_id: number) => {
    axios
      .post(`${API_URL}/share/join_load/${share_id}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log(response.data.message);
      })
      .catch((error) => {
        let message = "Something went wrong.";

        if (
          error.response &&
          error.response.data &&
          error.response.data.detail
        ) {
          message = error.response.data.detail;
        }

        Alert.alert("Error", message);
      })
      .finally(() => fetchLoads());
  };

  const handleQuitLoad = (share_id: number) => {
    axios
      .post(`${API_URL}/share/quit_load/${share_id}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log(response.data.message);
      })
      .catch((error) => {
        let message = "Something went wrong.";

        if (
          error.response &&
          error.response.data &&
          error.response.data.detail
        ) {
          message = error.response.data.detail;
        }

        Alert.alert("Error", message);
      })
      .finally(() => fetchLoads());
  };

  const handleStartLoad = (
    machine_id: number,
    machine_name: string,
    share_id: number
  ) => {
    setStartMachine(machine_name);
    setStartMachineId(machine_id);
    setShareId(share_id);
    setVisible(true);
  };

  const confirmDelete = (share_id: number) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDelete(share_id),
        },
      ],
      { cancelable: true }
    );
  };

  const handleDelete = (share_id: number) => {
    axios
      .post(`${API_URL}/share/delete_load/${share_id}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log(response.data.message);
      })
      .catch((error) => {
        let message = "Something went wrong.";

        if (
          error.response &&
          error.response.data &&
          error.response.data.detail
        ) {
          message = error.response.data.detail;
        }

        Alert.alert("Error", message);
      })
      .finally(() => fetchLoads());
  };

  const handleStart = (duration: number, share_id: number) => {
    console.log(
      `Starting machine_id: ${startMachineId} (${startMachine}) for ${duration} mins`
    );
    axios
      .post(
        `${API_URL}/share/start_load/${startMachineId}`,
        {
          duration: duration,
          share_id: share_id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((message) => {
        console.log(message.data);
        Alert.alert(
          "Load Started",
          "Your load has been started succesfully! You can track the status and collect your laundry from the home page later.",
          [
            {
              text: "OK",
              onPress: () => {
                setVisible(false);
              },
            },
          ],
          { cancelable: false }
        );
      })
      .catch((error) => {
        let message = "Something went wrong.";

        if (
          error.response &&
          error.response.data &&
          error.response.data.detail
        ) {
          message = error.response.data.detail;
        }

        Alert.alert("Error", message);
      })
      .finally(() => fetchLoads());
  };

  useFocusEffect(fetchResidences);
  useFocusEffect(fetchLoads);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#EF7C00" />
      </View>
    );
  }

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
            {loading ? (
              <ActivityIndicator size="large" color="#EF7C00" />
            ) : (
              // Find Load cards
              <FlatList
                data={loads}
                renderItem={({ item }: { item: ShareLoad }) => (
                  <SharedLoadCard
                    item={item}
                    userData={userData}
                    userId={userId}
                    confirmDelete={confirmDelete}
                    handleStartLoad={handleStartLoad}
                    handleJoinLoad={handleJoinLoad}
                    handleQuitLoad={handleQuitLoad}
                  />
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={() => (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      There are no active shared loads currently {"\n"} {"\n"}
                      Feel free to create one from the Create a Load tab
                    </Text>
                  </View>
                )}
              />
            )}
            {/* Refresh Button fetches all shared loads and list of residences from database */}
            <TouchableOpacity
              style={styles.fab}
              onPress={() => {
                fetchResidences();
                fetchLoads();
              }}
            >
              <Text style={styles.fabText}> ↻ </Text>
            </TouchableOpacity>
            <SetTimer
              visible={visible}
              selectedMachineId={startMachineId}
              selectedMachineName={startMachine}
              onStart={handleStart}
              onClose={() => setVisible(false)}
              share_id={shareId}
            />
          </>
        ) : (
          // the create load form
          <ScrollView style={styles.scrollView} nestedScrollEnabled={true}>
            <View style={styles.form}>
              <Text style={styles.label}>Residence</Text>
              <View style={styles.dropdown}>
                <Dropdown
                  label="Select your Residence: "
                  items={residences}
                  onSelect={handleSelectResidence}
                  value={selectedResidenceName}
                />
              </View>
              {/* Machine dropdown will only appear after residence has been selected */}
              {selectedResidenceName && (
                <>
                  <Text style={styles.label}>Machine</Text>
                  <View style={styles.dropdown}>
                    <Dropdown
                      label="Select your Machine: "
                      items={machineList}
                      onSelect={handleSelectMachine}
                      value={selectedMachine}
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
                  value="2"
                />
              </View>

              <Text style={styles.label}>
                Laundry Notes (Include Preferred Time of Laundry){" "}
              </Text>
              <TextInput
                style={styles.input}
                value={laundryDetails}
                onChangeText={setLaundryDetails}
                placeholder="e.g. Bedsheets only, starting load at 10am"
              />
              <View style={styles.createButton}>
                <TouchableOpacity
                  onPress={handleCreateLoad}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}> Create Your Load </Text>
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
  createButton: {
    marginVertical: responsiveHeight(2),
  },
  button: {
    marginTop: 8,
    backgroundColor: "#007bff",
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: responsiveHeight(20),
  },
  emptyText: {
    fontSize: RFValue(12),
    color: "#EF7C00",
    fontStyle: "italic",
    textAlign: "center",
    paddingHorizontal: responsiveWidth(10),
  },
});
