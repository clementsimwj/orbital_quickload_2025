import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { responsiveWidth, responsiveHeight } from "react-native-responsive-dimensions";
import { RFValue } from "react-native-responsive-fontsize";

type Props = {
  key : number;
  name: string;
  type: string;
  status: string | null;
};

const MachineData: React.FC<Props> = ({ name, status }) => {
  const availableImage = '../assets/images/availableImage.png';
  const hourglassImage = '../assets/images/hourglass.png';
  const isInUse = status === "in use";
  const iconURL = isInUse ? require(hourglassImage) : require(availableImage);
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{name}</Text>
      <View style={styles.statusContainer}>
        <Image style={styles.icon} source={iconURL} resizeMode="contain"/>
      </View>
    </View>
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
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: responsiveHeight(2)
  },
  name: {
    fontWeight: "bold",
    fontSize: RFValue(16)
  },
  status: {
    fontWeight: "500",
    fontSize: 14,
  },
  statusContainer : {
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon : {
    width: responsiveWidth(8),
    height: responsiveHeight(8)
  },
  statusText : {
    fontWeight: '600',
    fontStyle: 'italic'
  }
});