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
  ScrollView,
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
import Dropdown from '../components/Dropdown';
import axios from "axios";
import SetTimer from "@/components/SetTimer";

interface Washer {
  machine_id: number;
  machine_type: 'washer' | 'dryer';
  status: 'available' | 'in use' | 'complete' | null;
  machine_name: string;
}

export default function Index() {
  //Authentication Check:
  const { token, logout, isAuthenticated, isLoading } = useAuth();
  const [userData, setUserData] = useState<String>();
  const [loadingUser, setLoadingUser] = useState(true);
  const [machines, setMachines] = useState<Washer[]>([]);
  const [loadingMachines, setLoadingMachines] = useState(false);

  const items = [
  { value : 0, label: "Ridge View Residential College"},
  { value : 1, label: "Residential College 4"},
  { value : 2, label: "Tembusu College"},
  { value : 3, label: "College of Alice and Peter Tan"},
  { value : 4, label: "Acacia College"},
];


  const [selectedResidence, setSelectedResidence] = useState<number>();
  const [selectedMachineId, setSelectedMachineId] = useState<number|null>(null);
  const [selectedMachineName, setSelectedMachineName] = useState<string>('');

  //Handle select residence from dropdown menu
  const handleSelect = (item: any) => {
    console.log("Selected: ", item)
    setSelectedResidence(item.value);
  };

  //Handle selecting available machines
  const handlePress = (machine_id: number, machine_name: string, status: string | null) => {
    if (status === "available") {
      setSelectedMachineId(machine_id);
      setSelectedMachineName(machine_name);
    }
  };

  //Handle Starting Machine Logic here
  const handleStart = (duration: number) => {
    console.log(`Starting machine_id: ${selectedMachineId} (${selectedMachineName}) for ${duration} mins`);
    //Add API call here
    axios.post(`http://10.0.2.2:8000/${selectedMachineId}`, {
      duration: 45
    }, {
      headers: {Authorization: `Bearer ${token}`}
    }).then((message) => console.log(message))
      .catch((error) => Alert.alert("Error", error));
    setSelectedMachineId(null); // Hide timer modal
  };

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
        Alert.alert("Error", error);
        setLoadingUser(false);
      });
    } else {
      setLoadingUser(false);
    }
  }, [isAuthenticated, token]);

useEffect(() => {
  let intervalId: NodeJS.Timeout;
  const fetchMachines = () => {
    console.log("Fetching Machines...")
    if (isAuthenticated && token && selectedResidence !== undefined) {
      setLoadingMachines(true);
      axios.get(`http://10.0.2.2:8000/${selectedResidence}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const newData = response.data;
        const dataChanged =
          machines.length !== newData.length ||
          machines.some((oldMachine, index) => {
            const newMachine = newData[index];
            return (
              oldMachine.machine_id !== newMachine.machine_id ||
              oldMachine.status !== newMachine.status
            );
          });

        if (dataChanged) {
          setMachines(newData);
        }
        setLoadingMachines(false);
      })
      .catch((error) => {
        Alert.alert("Error", "Failed to fetch machines.");
        console.error(error);
        setLoadingMachines(false);
      });
    }
  };
  fetchMachines();
  intervalId = setInterval(fetchMachines, 5000);
  return () => clearInterval(intervalId);
}, [isAuthenticated, token, selectedResidence]);

  if (isLoading || loadingUser) {
    return (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" />
            </View>)
  }
  if (!isAuthenticated) return <Redirect href='/login'/>



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.upperWrapper}>
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
          <TouchableOpacity onPress={logout}>
            <Image style={styles.logoutImage} resizeMode='contain'source={require("../assets/images/logoutButton.png")}/>
          </TouchableOpacity>
          <Text style={styles.title}>Welcome: </Text>
        </View>
        {userData ? (<Text style={styles.user}>{userData}</Text>) : (<Text style={styles.user}>Unknown User!</Text>)}
      </View>
      <View style={{alignItems: 'flex-start', justifyContent: 'center', marginVertical: responsiveHeight(2)}}>
          <Text style={{marginBottom: responsiveHeight(1), fontSize: RFValue(15), color: "#c8cac9"}}>Residence:</Text>
          <Dropdown label="Select your Residences: "
                    items = {items}
                    onSelect={handleSelect}/>
      </View>
      <Text style={{fontSize: RFValue(15), color: "#c8cac9", fontWeight:'bold'}}>Washing Machine Status:</Text>
{selectedResidence !== undefined && !loadingMachines && (
  <FlatList
    data={machines}
    keyExtractor={(item) => item.machine_id.toString()}
    renderItem={({ item }) => (
      <MachineData
        key={item.machine_id}
        type={item.machine_type}
        name={item.machine_name}
        status={item.status}
        onPress={() => handlePress(item.machine_id, item.machine_name, item.status)}
        isSelected={selectedMachineId === item.machine_id}
      />
    )}
    contentContainerStyle={{
      padding: 16,
      paddingBottom: 100,
    }}
    showsVerticalScrollIndicator={false}
    // ✅ Optional if items might be added/removed and you want scroll to stick
    maintainVisibleContentPosition={{
      minIndexForVisible: 0,
    }}
    // ✅ Add space between items
    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
    // ✅ Show the timer modal after the list
    ListFooterComponent={
      selectedMachineId !== null ? (
        <SetTimer
          visible={true}
          selectedMachineId={selectedMachineId}
          selectedMachineName={selectedMachineName}
          onStart={handleStart}
          onClose={() => setSelectedMachineId(null)}
        />
      ) : null
    }
  />
)}
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003D7C",
    alignItems: "center",
  },
  upperWrapper : {
    backgroundColor: "#EF7C00",
    paddingVertical: responsiveHeight(5),
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(12)
  },
  title: {
    fontFamily: "Epilogue-ExtraBold",
    fontWeight: "bold",
    color: "white",
    marginVertical: responsiveWidth(5),
    fontSize: RFValue(40),
    marginHorizontal: responsiveWidth(10),
  },
  user : {
    color: "#cdf4f8",
    fontSize : RFValue(20),
    fontStyle: 'italic'

  },
  logoutImage : {
    width: responsiveWidth(8),
    height: responsiveHeight(8),
  },
  card : {
    marginVertical: responsiveHeight(3),
  }
});