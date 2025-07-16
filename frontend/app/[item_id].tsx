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
  ScrollView,
  Linking,
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
  const [seller, setSeller] = useState<number | null>(null);
  const [sellerName, setSellerName] = useState<string>("");
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
        setSellerName(itemData.item_seller);
        setSeller(itemData.item_sellerId);
      } catch (err) {
        console.error(err);
        setError("Failed to load item.");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [item_id]);

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
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
          style={styles.buttonCancel}
        >
          <Text style={styles.buttonCancel}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.container}>
        <Text>No item found.</Text>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
          style={styles.buttonCancel}
        >
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
        <Text
          style={{
            fontSize: RFValue(12),
            fontWeight: "bold",
            marginHorizontal: responsiveWidth(10),
          }}
        >
          Price:
        </Text>
        <Text style={styles.title}>${Number(price).toFixed(2)}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.name}>{name}</Text>
        <Text style={{ fontStyle: "italic", color: "blue" }}>
          By: @{sellerName}
        </Text>
        <Text
          style={{ fontWeight: "bold", marginVertical: responsiveHeight(2) }}
        >
          Description:{" "}
        </Text>
        <View
          style={{
            height: responsiveHeight(0.2),
            backgroundColor: "#EF7C00",
            width: "100%",
            marginBottom: responsiveHeight(2),
          }}
        />
        <ScrollView>
          <Text style={styles.desc}>{desc}</Text>
        </ScrollView>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        <TouchableOpacity
          style={styles.buttonCancel}
          onPress={() => {
            router.back();
          }}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonDeal}
          onPress={() => {
            Linking.openURL(`https://t.me/${sellerName}`);
          }}
        >
          <Text style={styles.buttonText}>Deal</Text>
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
  upperWrapper: {
    alignSelf: "center",
    width: responsiveWidth(90),
    borderColor: "#EF7C00",
    borderWidth: 4,
    borderRadius: 10,
    marginTop: responsiveHeight(8),
    paddingVertical: responsiveHeight(5),
    alignItems: "flex-start",
    backgroundColor: "#e9e8e9",
  },
  title: {
    marginHorizontal: responsiveWidth(10),
    textAlign: "left",
    color: "#EF7C00",
    fontSize: RFValue(35),
    fontWeight: "bold",
  },
  buttonCancel: {
    backgroundColor: "#f05c83",
    marginHorizontal: responsiveWidth(5),
    borderRadius: 30,
    paddingVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(3),
  },
  buttonText: {
    color: "white",
    fontSize: RFValue(16),
  },
  buttonDeal: {
    backgroundColor: "#10a773",
    marginHorizontal: responsiveWidth(5),
    borderRadius: 30,
    paddingVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(3),
  },
  card: {
    alignSelf: "center",
    width: responsiveWidth(90),
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#EF7C00",
    marginVertical: responsiveHeight(3),
    marginHorizontal: responsiveWidth(2),
    paddingHorizontal: responsiveWidth(10),
    backgroundColor: "#e9e8e9",
    flex: 0,
    alignItems: "flex-start",
    paddingBottom: responsiveHeight(5),
  },
  name: {
    marginTop: responsiveHeight(2),
    color: "black",
    fontSize: RFValue(30),
    marginBottom: responsiveHeight(5),
  },
  desc: {
    fontStyle: "italic",
  },
});
