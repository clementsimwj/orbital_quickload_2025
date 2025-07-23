import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
} from "react-native-responsive-dimensions";
import Dropdown from "@/components/Dropdown";

interface Residence {
  value: number;
  label: string;
}

interface Machine {
  machine_id: number;
  machine_name: string;
}

type Props = {
  residences: Residence[];
  handleSelectResidence: (item: any) => void;
  selectedResidenceName: string | null;
  machineList: Machine[];
  handleSelectMachine: (item: any) => void;
  selectedMachine: string | null;
  setCapacity: (capacity: number) => void;
  laundryDetails: string;
  setLaundryDetails: (details: string) => void;
  handleCreateLoad: () => void;
};

const CreateSharedLoadForm: React.FC<Props> = ({
  residences,
  handleSelectResidence,
  selectedResidenceName,
  machineList,
  handleSelectMachine,
  selectedMachine,
  setCapacity,
  laundryDetails,
  setLaundryDetails,
  handleCreateLoad,
}) => {
  return (
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

        <Text style={styles.label}>Max Participants (Including Yourself) </Text>
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
          <TouchableOpacity onPress={handleCreateLoad} style={styles.button}>
            <Text style={styles.buttonText}> Create Your Load </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default CreateSharedLoadForm;

const styles = StyleSheet.create({
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
});
