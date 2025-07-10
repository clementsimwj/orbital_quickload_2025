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
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import KeyboardAvoidingContatiner from "@/components/KeyboardAvoidingContainer";
import { useAuth } from '@/context/AuthContext'
import Item from "@/components/Item";

interface Item {
    currentUser: number | null;
    item_id: number;
    item_name: string;
    item_price: number;
    item_desc: string | null;
    item_seller: string;
    item_sellerId: number;
}

export default function Store() {
  const { token, isAuthenticated, isLoading, logout } = useAuth();
  const[userId, setUserId] = useState<number | null>(null);
  const router = useRouter();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    console.log("Fetching Items...")
    if (isAuthenticated && token) {
      axios.get(`http://10.0.2.2:8000/store/items`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const responseData = response.data;
        const itemData = responseData.Items;
        const currUser = responseData.User;
        console.log(itemData);
        setItems(itemData);
        setUserId(currUser.user_id);
      })
      .catch((error) => {
        Alert.alert("Error", "Failed to fetch machines.");
        console.error(error);
      }).finally(() => {
        setLoading(false);
      });
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      let intervalId: NodeJS.Timeout;

      fetchItems();
      intervalId = setInterval(fetchItems, 5000);

      return () => clearInterval(intervalId);
    }, [isAuthenticated, token])
  );

  /*useEffect(() => {
    let intervalId: NodeJS.Timeout;
    fetchItems();
    intervalId = setInterval(fetchItems, 5000);
    return () => clearInterval(intervalId);
  }, [isAuthenticated, token]);*/

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
          <TouchableOpacity onPress={logout} style={{marginRight:responsiveWidth(2)}}>
            <Image style={styles.logoutImage} resizeMode='contain'source={require("../../assets/images/logoutButton.png")}/>
          </TouchableOpacity>
          <Image
            style={styles.logo}
            resizeMode="contain"
            source={require("../../assets/images/market.png")}
          />
          <Text style={styles.title}>QuickMarket:</Text>
        </View>
           {loading ? (
            <ActivityIndicator size="large" color="#EF7C00" />
            ) : (
              <FlatList
                data={items}
                keyExtractor={(item) => item.item_id.toString()}
                renderItem={({ item }: { item: Item }) => (
                  <Item
                    currentUser={userId}
                    item_id={item.item_id}
                    item_name={item.item_name}
                    item_price={item.item_price}
                    item_desc={item.item_desc}
                    item_seller={item.item_seller}
                    item_sellerId={item.item_sellerId}
                  />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{padding: 16, paddingBottom: responsiveHeight(10)}}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                ListEmptyComponent={() => (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      Hmmm...it looks like the marketplace is empty for now!
                    </Text>
                  </View>
                )}
              />
          )}
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003D7C",
    alignItems: "center"
  },
  upperWrapper: {
    paddingVertical: responsiveHeight(5),
    paddingHorizontal: responsiveWidth(12),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EF7C00",
  },
  title: {
    fontFamily: "Epilogue-ExtraBold",
    fontWeight: "bold",
    color: "white",
    marginVertical: responsiveWidth(5),
    fontSize: RFValue(30),
    marginLeft: responsiveWidth(2)
  },
  logo: {
    width: responsiveWidth(20),
    height: responsiveHeight(20),
  },
  lowerWrapper: {
    flex: 1,
    paddingBottom: responsiveHeight(3),
    paddingHorizontal: responsiveWidth(5),
  },
  logoutImage : {
    width: responsiveWidth(8),
    height: responsiveHeight(8),
  },
  fab: {
  position: 'absolute',
  bottom: responsiveHeight(2.5),
  right: responsiveWidth(5),
  backgroundColor: '#EF7C00',
  width: responsiveWidth(15),
  height: responsiveHeight(7),
  borderRadius: 50,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 3,
},
fabText: {
  color: 'white',
  fontSize: RFValue(30),
  lineHeight: 30,
  fontWeight: 'bold',
},
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: responsiveHeight(20),
  },
  emptyText: {
    fontSize: RFValue(12),
    color: '#EF7C00',
    fontStyle: "italic",
    textAlign: 'center',
    paddingHorizontal: responsiveWidth(10),
  },
});
