import {
  Text,
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Button,
  Alert,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import ListingItem from "@/components/ListingItem";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface Item {
  item_id: number;
  item_name: string;
  item_price: number;
  item_desc: string | null;
}

export default function Listing() {
  const { token, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDelete = async (item_id: number) => {
    if (!token) return;
    try {
      await axios.delete(`${API_URL}/store/${item_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prevItems) =>
        prevItems.filter((item) => item.item_id !== item_id)
      );
    } catch (error) {
      Alert.alert("Error", "Failed to delete item. Please try again.");
      console.error(error);
    }
  };

  const fetchItems = async () => {
    console.log("Fetching Items...");
    if (isAuthenticated && token) {
      await axios
        .get(`${API_URL}/store/my-items`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const responseData = response.data;
          console.log(responseData);
          setItems(responseData);
        })
        .catch((error) => {
          Alert.alert("Error", "Failed to fetch machines.");
          console.error(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      let intervalId: NodeJS.Timeout;

      fetchItems();
      intervalId = setInterval(fetchItems, 10000);

      return () => clearInterval(intervalId);
    }, [isAuthenticated, token])
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#EF7C00" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.upperWrapper}>
        <Text style={styles.title}>My Listings: </Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#EF7C00" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.item_id.toString()}
          renderItem={({ item }: { item: Item }) => (
            <ListingItem
              item_id={item.item_id}
              item_name={item.item_name}
              item_price={item.item_price}
              item_desc={item.item_desc}
              onDelete={handleDelete}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: responsiveHeight(10),
          }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Hmmm...it looks like your listing is empty. Add some items now
              </Text>
            </View>
          )}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => router.push("/add")}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
    paddingVertical: responsiveHeight(5),
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(12),
  },
  title: {
    color: "#EF7C00",
    fontSize: RFValue(20),
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    bottom: responsiveHeight(2.5),
    right: responsiveWidth(5),
    backgroundColor: "#EF7C00",
    width: responsiveWidth(15),
    height: responsiveHeight(7),
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabText: {
    color: "white",
    fontSize: RFValue(30),
    lineHeight: 30,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: responsiveHeight(20),
  },
  emptyText: {
    fontSize: RFValue(12),
    color: "#EF7C00",
    fontStyle: "italic",
    textAlign: "center",
    paddingHorizontal: responsiveWidth(10),
  },
});
