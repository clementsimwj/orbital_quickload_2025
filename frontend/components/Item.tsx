import { router, useRouter } from 'expo-router';
import { sortRoutesWithInitial } from 'expo-router/build/sortRoutes';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { RFValue } from 'react-native-responsive-fontsize';

type ItemProps = {
    currentUser: number | null;
    item_id: number;
    item_name: string;
    item_price: number;
    item_desc: string | null;
    item_seller: string;
    item_sellerId: number;
};

const Item: React.FC<ItemProps> = ({currentUser, item_id, item_name, item_price, item_desc, item_seller, item_sellerId }) => {
  const router = useRouter();
  const isPressable = currentUser !== item_sellerId;
  return (
    <TouchableOpacity disabled={!isPressable} 
      onPress={() => {router.push({pathname: "/[item_id]", params: {item_id: item_id.toString()}});}}
      style={[styles.container, { opacity: isPressable ? 1 : 0.5 }
        ]}
    >
      <View style={styles.leftContent}>
        <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">{item_name}</Text>
        <Text style={styles.itemSeller}>@{item_seller}</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>${item_price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(3),
    width: responsiveWidth(80),
    backgroundColor: 'white',
    flexDirection: "row",
    marginVertical: responsiveHeight(1),
    justifyContent: "space-between",
    borderRadius: 10,
  },
  price: {
    fontSize: RFValue(20),
    fontWeight: "bold",
    color: "green"
  },
  itemName: {
    fontSize: RFValue(20),
  },
  itemSeller: {
    fontStyle: "italic",
    color: "#1a81e5",
    fontSize: RFValue(10)
  },
  leftContent: {
    flex: 1,
    flexShrink: 1,
    marginRight: responsiveWidth(2),
    justifyContent: "center"
  },
  priceContainer : {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: responsiveWidth(20),
    flexShrink: 0
  }


});

export default Item;
