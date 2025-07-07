import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, SafeAreaView, TextInput } from "react-native";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import { RFValue } from "react-native-responsive-fontsize";

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
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [desc, setDesc] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!item_id) return;

    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`http://10.0.2.2:8000/store/${item_id}`, {
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
        <TouchableOpacity onPress={()=>{router.back()}} style={styles.button}>
          <Text style={styles.button}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.container}>
        <Text>No item found.</Text>
        <TouchableOpacity onPress={()=>{router.back()}} style={styles.button}>
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
            <Text style={styles.title}>${Number(price).toFixed(2)}</Text>
        </View>
        <View style={styles.card}>
            <Text>{name}</Text>
            <Text>{desc}</Text>
        </View>
        <TouchableOpacity onPress={()=>{router.back()}}>
            <Text>Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003D7C",
  },
  upperWrapper : {
    width: responsiveWidth(100),
    borderColor: "#EF7C00",
    borderWidth: 4,
    borderRadius: 10,
    marginTop: responsiveHeight(8),
    paddingVertical: responsiveHeight(5),
    alignItems: "flex-start",
    backgroundColor: "#e9e8e9",
  },
  title : {
    marginHorizontal: responsiveWidth(10),
    textAlign: 'left',
    color: "#EF7C00",
    fontSize: RFValue(35),
    fontWeight: "bold"
  },
  button: {
    backgroundColor: "#EF7C00",
    marginHorizontal: responsiveWidth(5),
    borderRadius: 20,
    paddingVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(2)
  },
  buttonText: {
    color: "white",
    fontSize: RFValue(16)
  },
  card : {
    backgroundColor: "white",
    flex: 0,
    alignItems: 'center',
    paddingBottom: responsiveHeight(15)
  },
  input: {
    backgroundColor: "white",
    width: responsiveWidth(90),
    borderWidth: 2,
    borderColor: '#EF7C00',
    padding: 10,
  },
  section : {
    marginVertical: responsiveHeight(2)
  }
});