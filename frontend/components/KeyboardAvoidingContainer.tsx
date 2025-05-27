import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
  View
} from "react-native";
import React from 'react';
import { responsiveHeight } from "react-native-responsive-dimensions";

interface KeyboardAvoidingContainerProps {
  children: React.ReactNode;
  style?: any;
  backgroundColor?: string;
}

const KeyboardAvoidingContainer: React.FC<KeyboardAvoidingContainerProps> = ({children, style, backgroundColor}) => {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: backgroundColor || "#003D7C" }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={responsiveHeight(10)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {children}
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
export default KeyboardAvoidingContainer;
