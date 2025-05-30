import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

interface DropdownItem {
  id: string;
  label: string;
  value: string;
}

interface Washers {
  id: string;
  name: string;
  status: string;
  time?: string;
}

export default function Home() {
  const options: DropdownItem[] = [
    { id: "1", label: "Ridge View Residential College", value: "rvrc" },
    { id: "2", label: "Residential College 4", value: "rc4" },
    { id: "3", label: "Tembusu College", value: "tc" },
    { id: "4", label: "College of Alice and Peter Tan", value: "capt" },
    { id: "5", label: "NUSC", value: "nusc" },
    { id: "6", label: "Acacia College", value: "ac" },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(options[0]);

  const washerData: Record<string, Washers[]> = {
    rvrc: [
      { id: "1", name: "Washer 1", status: "Available" },
      { id: "2", name: "Washer 2", status: "In-Use", time: "10 mins" },
    ],
    rc4: [
      { id: "1", name: "RC4 Washer 1", status: "Available" },
      { id: "2", name: "RC4 Washer 2", status: "Available" },
    ],
    tc: [
      { id: "1", name: "Tembu Washer 1", status: "Available" },
      { id: "2", name: "Tembu Washer 2", status: "Available" },
    ],
    capt: [
      { id: "1", name: "Capt Washer 1", status: "In-Use", time: "20 mins" },
      { id: "2", name: "Capt Washer 2", status: "Available" },
    ],
    nusc: [
      { id: "1", name: "Nusc Washer 1", status: "In-Use", time: "15 mins" },
      { id: "2", name: "Nusc Washer 2", status: "Available" },
    ],
    ac: [
      { id: "1", name: "Acacia Washer 1", status: "In-Use", time: "30 mins" },
      { id: "2", name: "Acacia Washer 2", status: "Available" },
    ],
  };

  const machines = washerData[selectedItem.value as keyof typeof washerData]; // this guarantess that selectedItem.value is a key for washerData

  const handleSelect = (item: DropdownItem) => {
    setSelectedItem(item);
    setIsOpen(false);
  };

  const renderDropdownItem = (item: DropdownItem) => (
    <TouchableOpacity
      onPress={() => handleSelect(item)}
      style={styles.selectionBox}
    >
      <Text>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        style={[styles.selectionBox, { marginTop: "20%" }]}
      >
        <Text>{selectedItem ? selectedItem.label : "Select option"}</Text>
        <Image
          source={require("../assets/images/dropdownArrow.png")}
          resizeMode="contain"
          style={{ width: 15 }}
        />
      </TouchableOpacity>

      {isOpen && (
        <View>
          <FlatList
            data={options}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderDropdownItem(item)}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      <Text style={styles.machineHeader}>Washing Machines</Text>
      <FlatList
        data={machines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.machineCard}>
            <Text style={styles.machineName}>{item.name}</Text>
            <View style={styles.machineStatusBox}>
              {item.status === "Available" ? (
                <Text style={[styles.machineStatus, { color: "green" }]}>
                  Available
                </Text>
              ) : (
                <>
                  <Text style={[styles.machineStatus, { color: "red" }]}>
                    In Use
                  </Text>
                  <Text style={styles.machineStatus}>{item.time}</Text>
                </>
              )}
            </View>
          </View>
        )}
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
  selectionBox: {
    flexDirection: "row",
    borderRadius: 10,
    width: responsiveWidth(75),
    height: responsiveHeight(6),
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  machineHeader: {
    marginVertical: 15,
    fontSize: 25,
    alignItems: "center",
    color: "white",
    justifyContent: "center",
  },
  machineCard: {
    width: responsiveWidth(75),
    height: responsiveHeight(10),
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 10,
    marginVertical: 10,
    backgroundColor: "white",
  },
  machineName: {
    fontSize: 16,
  },
  machineStatus: {
    fontSize: 16,
    fontWeight: "600",
  },
  machineStatusBox: {
    justifyContent: "flex-start",
  },
});
