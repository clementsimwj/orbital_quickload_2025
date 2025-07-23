import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
} from "react-native-responsive-dimensions";

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

type Props = {
  item: ShareLoad;
  userData: string | null;
  userId: number;
  confirmDelete: (share_id: number) => void;
  handleStartLoad: (
    machine_id: number,
    machine: string,
    share_id: number
  ) => void;
  handleJoinLoad: (share_id: number) => void;
  handleQuitLoad: (share_id: number) => void;
};

const SharedLoadCard: React.FC<Props> = ({
  item,
  userData,
  userId,
  confirmDelete,
  handleStartLoad,
  handleJoinLoad,
  handleQuitLoad,
}) => {
  const deleteImage = "../assets/images/delete.png";
  return (
    <View style={styles.card}>
      <View style={styles.cardTitleContainer}>
        <Text style={styles.cardTitle}>{item.user}</Text>
        {item.user == userData && (
          <TouchableOpacity onPress={() => confirmDelete(item.share_id)}>
            <Image
              style={styles.icon}
              source={require(deleteImage)}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
      <Text>🧺 Machine: {item.machine}</Text>
      <Text>🏠 Residence: {item.residence} </Text>
      <Text>
        👤 Participants: {item.participants.length + 1} / {item.capacity}
      </Text>
      <Text>📝 Note: {item.notes}</Text>

      {item.user == userData ? (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#12C72F" }]}
          onPress={() =>
            handleStartLoad(item.machine_id, item.machine, item.share_id)
          }
        >
          <Text style={styles.buttonText}>Start Load</Text>
        </TouchableOpacity>
      ) : item.participants.includes(userId) ? (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "red" }]}
          onPress={() => handleQuitLoad(item.share_id)}
        >
          <Text style={styles.buttonText}>Quit Load</Text>
        </TouchableOpacity>
      ) : item.participants.length + 1 == item.capacity ? (
        <></>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleJoinLoad(item.share_id)}
        >
          <Text style={styles.buttonText}>Join Load</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SharedLoadCard;

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(2),
    marginHorizontal: responsiveWidth(5),
    backgroundColor: "#ffffffff",
    borderRadius: 10,
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "left",
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
  icon: {
    marginHorizontal: responsiveWidth(1),
    width: responsiveWidth(6),
    height: responsiveHeight(6),
  },
  cardTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    marginRight: responsiveWidth(2),
  },
});
