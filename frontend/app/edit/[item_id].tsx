import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { RFValue } from "react-native-responsive-fontsize";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface Item {
  item_id: number;
  item_name: string;
  item_price: number;
  item_desc: string | null;
}

export default function EditPage() {
  const { token, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const { item_id } = useLocalSearchParams();

  const [item, setItem] = useState<Item | null>(null);
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!item_id) return;

    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/store/${item_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const itemData = response.data;
        setItem(response.data);
        setName(itemData.item_name);
        setPrice(itemData.item_price.toString());
        setDesc(itemData.item_desc);
      } catch (err) {
        console.error(err);
        setError("Failed to load item.");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [item_id]);

  const handleDiscard = () => {
    Alert.alert(
      "Discard Changes",
      "Are you sure you want to discard? Any changes made will not be saved.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Discard",
          style: "destructive",
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Input Error", "Item name cannot be empty.");
      return;
    }

    if (!price.trim()) {
      Alert.alert("input Error", "Item price cannot be empty.");
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      Alert.alert("Input Error", "Item price must be a valid number.");
      return;
    }
    axios
      .patch(
        `${API_URL}/store/${item_id}`,
        {
          item_name: name,
          item_price: parseFloat(price),
          item_desc: desc,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        Alert.alert("Success", "Item Updated!");
        router.back();
      })
      .catch((err) => {
        console.error(err);
        Alert.alert("Error", "Failed to update Item.");
      });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#EF7C00" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "red" }}>{error}</Text>
        <TouchableOpacity onPress={handleDiscard} style={styles.button}>
          <Text style={styles.button}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.container}>
        <Text>No item found.</Text>
        <TouchableOpacity onPress={handleDiscard} style={styles.button}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.upperWrapper}>
        <Text style={styles.title}>Editing Item: </Text>
      </View>
      <View style={styles.card}>
        <View style={styles.section}>
          <Text
            style={{
              fontSize: RFValue(12),
              color: "white",
              paddingBottom: responsiveHeight(1),
            }}
          >
            Item Name:
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={name}
          />
        </View>
        <View style={styles.section}>
          <Text
            style={{
              fontSize: RFValue(12),
              color: "white",
              paddingBottom: responsiveHeight(1),
            }}
          >
            Price:
          </Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder={price}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.section}>
          <Text
            style={{
              fontSize: RFValue(12),
              color: "white",
              paddingBottom: responsiveHeight(1),
            }}
          >
            Item Description:
          </Text>
          <TextInput
            style={styles.input}
            value={desc}
            onChangeText={setDesc}
            placeholder={desc}
          />
        </View>
      </View>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText} onPress={handleDiscard}>
            Discard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text onPress={handleSave} style={styles.buttonText}>
            Save Changes
          </Text>
        </TouchableOpacity>
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
  upperWrapper: {
    paddingVertical: responsiveHeight(10),
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(12),
  },
  title: {
    color: "#EF7C00",
    fontSize: RFValue(20),
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#EF7C00",
    marginHorizontal: responsiveWidth(5),
    borderRadius: 20,
    paddingVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(2),
  },
  buttonText: {
    color: "white",
    fontSize: RFValue(16),
  },
  card: {
    flex: 0,
    paddingBottom: responsiveHeight(15),
  },
  input: {
    backgroundColor: "white",
    width: responsiveWidth(90),
    borderWidth: 2,
    borderColor: "#EF7C00",
    padding: 10,
  },
  section: {
    marginVertical: responsiveHeight(2),
  },
});
