import { Tabs } from "expo-router";
import { Image, Text } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => {
        // Define icons for each tab
        let iconSource: number;
        let labelText: string;

        if (route.name === "index") {
          iconSource = require("../../assets/images/home.png");
          labelText = "Home";
        } else if (route.name === "store") {
          iconSource = require("../../assets/images/market.png");
          labelText = "Market";
        } else if (route.name === "share") {
          iconSource = require("../../assets/images/share.png");
          labelText = "Share";
        } else if (route.name === "listing") {
          iconSource = require("../../assets/images/listing.png");
          labelText = "Listing";
        } else {
          //need to cover all cases else code will break
          iconSource = require("../../assets/images/home.png");
          labelText = "Default";
        }

        return {
          tabBarIcon: ({ focused }) => (
            <Image
              source={iconSource}
              style={{
                width: responsiveWidth(7),
                height: responsiveHeight(3),
                tintColor: focused ? "#FFFFFF" : "#FFFFFF99",
              }}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                color: focused ? "#FFFFFF" : "#FFFFFF99",
                fontWeight: "bold",
                fontSize: RFValue(12),
              }}
            >
              {labelText}
            </Text>
          ),
          tabBarStyle: {
            backgroundColor: "#EF7C00",
          },
          headerShown: false,
        };
      }}
    />
  );
}
