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

  const handleSelect = (item: any) => {
    console.log("Selected: ", item)
    setSelectedResidence(item.value);
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
  if (isAuthenticated && token && selectedResidence != undefined) {
    setLoadingMachines(true);
    axios.get(`http://10.0.2.2:8000/${selectedResidence}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
      setMachines(response.data); // List[MachineOut]
      setLoadingMachines(false);
    })
    .catch((error) => {
      Alert.alert("Error", "Failed to fetch machines.");
      console.error(error);
      setLoadingMachines(false);
    });
  }
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
      <View style={styles.card}>
          {(selectedResidence !== undefined) && !loadingMachines && (
          <>
          {machines.map((machine) => (
            <MachineData
              key = {machine.machine_id}
              type = {machine.machine_type}
              name={machine.machine_name}
              status={machine.status}
            />
          ))}
          </>
        )}
      </View>
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