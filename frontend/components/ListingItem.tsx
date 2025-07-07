import { Link } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { RFValue } from 'react-native-responsive-fontsize';

type Props = {
    item_id: number;
    item_name: string;
    item_price: number;
    item_desc: string | null;
    onDelete: (item_id: number) => void
};

const ListingItem: React.FC<Props> = ({item_id, item_name, item_price, item_desc, onDelete}) => {
  const editImage = '../assets/images/edit.png';
  const deleteImage = '../assets/images/delete.png';
  const confirmDelete = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(item_id) },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
          {item_name}
        </Text>
        <Text style={styles.price}>${item_price.toFixed(2)}</Text>
      </View>
      <View style={styles.iconContainer}>
        <Link href={{ pathname: "/edit/[item_id]", params: { item_id: item_id.toString() } }} asChild>
          <TouchableOpacity>
            <Image style={styles.icon} source={require(editImage)} resizeMode="contain" />
          </TouchableOpacity>
        </Link>
        <TouchableOpacity onPress={confirmDelete}>
          <Image style={styles.icon} source={require(deleteImage)} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
container: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: responsiveWidth(5),
  paddingVertical: responsiveHeight(3),
  width: responsiveWidth(80),
  backgroundColor: "white",
  marginVertical: responsiveHeight(1),
  borderRadius: 10,
},
leftContent: {
  flex: 1,
  marginRight: responsiveWidth(2),
  justifyContent: "center"
},
itemName: {
  fontSize: RFValue(20),
  maxWidth: responsiveWidth(45),
},
price: {
  fontSize: RFValue(20),
  fontWeight: "bold",
  color: "green",
},
iconContainer: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: responsiveWidth(15)
},
icon: {
  marginHorizontal: responsiveWidth(1),
  width: responsiveWidth(6),
  height: responsiveHeight(6),
},



});

export default ListingItem;
