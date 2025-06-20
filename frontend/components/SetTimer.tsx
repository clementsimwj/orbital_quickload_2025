import React, { useState, useEffect } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";

type SetTimer = {
  visible: boolean;
  selectedMachineId: number;
  selectedMachineName: string;
  onStart: (duration: number) => void;
  onClose: () => void;
};

const SetTimer: React.FC<SetTimer> = ({
  visible,
  selectedMachineId,
  selectedMachineName,
  onStart,
  onClose,
}) => {
  const [time, setTime] = useState<number>(30);

  const increment = () => setTime(time < 60 ? time + 5 : time); //maximum time allowed is 60 minutes
  const decrement = () => setTime(time > 5 ? time - 5 : time); //minimum time allowed is 5 minutes
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalBox}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={{ fontSize: 23, color: "red" }}> x </Text>
          </TouchableOpacity>

          <Text style={styles.washerName}>{selectedMachineName}</Text>
          <Text style={styles.subheader}>Set timer (minutes)</Text>

          <View style={styles.timerControlPosition}>
            <TouchableOpacity onPress={decrement}>
              <Text style={styles.timerControlButton}> — </Text>
            </TouchableOpacity>

            <Text style={styles.timeText}>{time}</Text>

            <TouchableOpacity onPress={increment}>
              <Text style={styles.timerControlButton}> + </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => {
            console.log("Start button pressed with time: ", time);
            onStart(time);
            onClose();
          }} style={styles.startButton}>
            <Text style={{ color: "white", fontSize: 18 }}>Start</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SetTimer;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(27, 25, 25, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 30,
    width: "75%",
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 5,
    right: 8,
  },
  washerName: {
    fontSize: 20,
    marginBottom: 4,
    fontWeight: "bold",
  },
  subheader: {
    fontSize: 14,
    color: "grey",
    marginBottom: 20,
  },
  timerControlPosition: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 24,
  },
  timerControlButton: {
    fontSize: 30,
    color: "#615f5f",
  },
  timeText: {
    fontSize: 32,
    fontWeight: "500",
    minWidth: 60,
    textAlign: "center",
  },
  startButton: {
    backgroundColor: "#12C72F",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
});