import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
} from "react-native-responsive-dimensions";
import { RFValue } from "react-native-responsive-fontsize";

type Props = {
  id: string;
  name: string;
  status: string;
  time?: string;
  handlePress: (
    machine_id: number,
    machine_name: string,
    status: string
  ) => void;
};

const MachineData: React.FC<Props> = ({
  id,
  name,
  status,
  time,
  handlePress,
}) => {
  const availableImage = "../assets/images/availableImage.png";
  const hourglassImage = "../assets/images/hourglass.png";
  const isInUse = status === "In-Use";
  const iconURL = isInUse ? require(hourglassImage) : require(availableImage);
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => handlePress(Number(id), String(name), status)}
    >
      <Text style={styles.name}>{name}</Text>
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{isInUse ? time + " mins" : ""}</Text>
        <Image style={styles.icon} source={iconURL} resizeMode="contain" />
      </View>
    </TouchableOpacity>
  );
};

export default MachineData;

const styles = StyleSheet.create({
  container: {
    width: responsiveWidth(80),
    flexDirection: "row",
    backgroundColor: "white",
    justifyContent: "space-between",
    paddingVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(2),
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: responsiveHeight(2),
  },
  name: {
    fontWeight: "bold",
    fontSize: RFValue(16),
  },
  status: {
    fontWeight: "500",
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: responsiveWidth(8),
    height: responsiveHeight(8),
  },
  statusText: {
    fontWeight: "600",
    fontStyle: "italic",
  },
});
