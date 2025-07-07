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
  const isPressable = currentUser !== item_sellerId;
  return (
    <TouchableOpacity disabled={!isPressable} 
      style={[styles.container, { opacity: isPressable ? 1 : 0.5 }
        ]}
    >
      <View>
        <Text style={styles.itemName}>{item_name}</Text>
        <Text style={styles.itemSeller}>@{item_seller}</Text>
      </View>
      <Text style={styles.price}>${item_price.toFixed(2)}</Text>
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
  }


});

export default Item;
