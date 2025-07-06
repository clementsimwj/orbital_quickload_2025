import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import { router } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

export default function AddItem() {
  const { token, logout, isAuthenticated, isLoading } = useAuth();
  const [itemName, setItemName] = useState<string>("");
  const [itemPrice, setItemPrice] = useState<string>(""); // string for input, convert later
  const [itemDesc, setItemDesc] = useState<string>("");
  const [itemSeller, setItemSeller] = useState<string>("");

  const handleCancel = () => {
  const hasChanges = itemName.trim() || itemPrice.trim() || itemDesc.trim();

  if (hasChanges) {
    Alert.alert(
      "Discard changes?",
      "Are you sure you want to discard your changes?",
      [
        { text: "Keep Editing", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => router.back(),
        },
      ]
    );
  } else {
    router.back();
  }
};

  const handleSubmit = async () => {
    console.log(itemName);
    console.log(itemPrice);
    console.log(itemDesc);
    if (!itemName.trim()) {
      Alert.alert("Validation", "Please enter an item name");
      return;
    }
    if (!itemPrice.trim() || isNaN(Number(itemPrice))) {
      Alert.alert("Validation", "Please enter a valid price");
      return;
    }
    const newItem = {
      item_name: itemName,
      item_price: Number(itemPrice),
      item_desc: itemDesc,
    };

    console.log(newItem);
    //Send newItem to backend
    axios.post("http://10.0.2.2:8000/store/add_item", newItem, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      console.log(res.data);
      Alert.alert("Success", "Item added!");
      router.back();
    })
    .catch((err) => {
      console.error(err.response?.data || err.message);
      Alert.alert("Error", "Could not add item.");
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, paddingVertical: responsiveHeight(5), paddingHorizontal:responsiveWidth(2) }}>
        <TouchableOpacity onPress={handleCancel} style={{ marginBottom: responsiveHeight(3) }}>
          <Text style={{ color: "#EF7C00", fontSize: RFValue(12) }}>Cancel</Text>
        </TouchableOpacity>
        <View style={{paddingHorizontal: responsiveWidth(3)}}>
          <View style={{marginVertical: responsiveHeight(2)}}>
            <Text style={styles.label}>Item Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter item name"
              value={itemName}
              onChangeText={setItemName}
            />
          </View>
          <View style={{marginVertical: responsiveHeight(2)}}>
            <Text style={styles.label}>Item Price:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter item price in $"
              value={itemPrice}
              keyboardType="numeric"
              onChangeText={setItemPrice}
            />
          </View>
          <View style={{marginVertical: responsiveHeight(2)}}>
            <Text style={styles.label}>Item Description:</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Enter item description"
              value={itemDesc}
              multiline
              onChangeText={setItemDesc}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003D7C",
  },
  label: {
    fontSize: RFValue(12),
    color: "white",
    marginBottom: responsiveHeight(1),
  },
  input: {
    backgroundColor: "white",
    borderRadius: 6,
    paddingHorizontal: responsiveWidth(2),
    paddingVertical: responsiveHeight(1),
    fontSize: RFValue(12),
  },
  submitButton: {
    marginTop: responsiveHeight(30),
    marginHorizontal: responsiveWidth(7),
    backgroundColor: "#EF7C00",
    paddingHorizontal: responsiveWidth(1),
    paddingVertical: responsiveHeight(3),
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: RFValue(12),
    fontWeight: "bold",
  },
});
