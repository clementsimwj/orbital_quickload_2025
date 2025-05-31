import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { RFValue } from "react-native-responsive-fontsize";

const Dropdown = ({ label, items, onSelect }) => {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(null);

  const toggleDropdown = () => setVisible(!visible);

  const handleSelect = (item) => {
    setSelected(item);
    setVisible(false);
    onSelect && onSelect(item);
  };

  return (
    <View>
      <TouchableOpacity style={styles.dropdownHeader} onPress={toggleDropdown}>
        <Text style={{ flex: 1, fontSize: RFValue(15) }}>
          {selected?.label || label}
        </Text>
        <Image
          style={{
            width: responsiveWidth(5),
            height: responsiveWidth(5),
          }}
          resizeMode="contain"
          source={require("../assets/images/dropdownArrow.png")}
        />
      </TouchableOpacity>

      {visible && (
        <View style={styles.dropdownList}>
          <ScrollView>
            {items.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.item}
                onPress={() => handleSelect(item)}
              >
                <Text>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default Dropdown;

const styles = StyleSheet.create({
  dropdownHeader: {
    width: responsiveWidth(75),
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: responsiveWidth(2),
    borderRadius: 10,
    flexDirection: "row",
  },
  dropdownList: {
    position: "absolute",
    top: "100%",
    zIndex: 10,
    overflow: "hidden",
    alignSelf: "center",
    width: responsiveWidth(75),
    maxHeight: responsiveHeight(25),
    marginTop: responsiveHeight(0),
    borderRadius: 6,
    backgroundColor: "#fff",
    elevation: 3,
  },
  item: {
    padding: responsiveHeight(2),
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
  },
});
