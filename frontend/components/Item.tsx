import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type ItemProps = {
    item_id: number;
    item_name: string;
    item_price: number;
    item_desc: string | null;
    item_seller: string;
};

const Item: React.FC<ItemProps> = ({item_id, item_name, item_price, item_desc, item_seller }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{item_name}</Text>
      <Text style={styles.price}>Price: ${item_price.toFixed(2)}</Text>
      <Text style={styles.desc}>{item_desc}</Text>
      <Text style={styles.seller}>Seller: @{item_seller}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 2, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  seller: {
    fontSize: 12,
    color: '#999',
  },
});

export default Item;
