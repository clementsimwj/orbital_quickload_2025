import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { responsiveWidth, responsiveHeight } from "react-native-responsive-dimensions";
import { RFValue } from "react-native-responsive-fontsize";

type Props = {
  name: string;
  type: string;
  status: string | null;
  machineUserId?: number | null;
  currentUserId?: number | null;
  onPress?: () => void;
  isSelected?: boolean;
  children?: React.ReactNode;
  timeRemaining: number | null;
};

const MachineData: React.FC<Props> = ({ name, status, type, timeRemaining, machineUserId, currentUserId, onPress, isSelected, children }) => {
  const availableImage = '../assets/images/availableImage.png';
  const hourglassImage = '../assets/images/hourglass.png';
  const collectImage = '../assets/images/collect.png';
  const isAvailable = status === "available";
  console.log(timeRemaining);
  const isDone = status === "complete";
  const isOwned = isDone && machineUserId === currentUserId;
  const isPressable = isAvailable || isOwned;
  const iconURL = isAvailable ? require(availableImage) : isDone ? require(collectImage) : require(hourglassImage);

  return (
    <TouchableOpacity
      onPress={isPressable ? onPress : undefined}
      disabled={!isPressable}
      style={[
        styles.container,
        { opacity: isPressable ? 1 : 0.5 },
      ]}
    >
      <Text style={styles.name}>{name}</Text>
      <View style={styles.statusContainer}>
        <Image style={styles.icon} source={iconURL} resizeMode="contain" />
        {status === "in use" && timeRemaining !== null && (
          <Text>{`Time remaining: ${Math.round(((timeRemaining - (8*60*60))/60))} mins`}</Text>
        )}
      </View>
      {isSelected && children}
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