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
        }

        return {
          tabBarIcon: ({ focused }) => (
            <Image
              source={iconSource}
              style={{ width: responsiveWidth(7), 
                    height: responsiveHeight(3),
                    tintColor: focused ? "#FFFFFF" : "#FFFFFF99" }}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? "#FFFFFF" : "#FFFFFF99", 
                fontWeight: "bold", 
                fontSize: RFValue(12)}}>
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
