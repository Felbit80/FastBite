import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Image } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import * as Font from "expo-font";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

const customFonts = {
  "BeVietnamPro-Semibold": require("./assets/fonts/BeVietnamPro-SemiBold.ttf"),
};

export default function Login() {

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#f8f9fa" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  baseText: {
    fontFamily: "BeVietnamPro-Semibold",
  },
  container: {
    flex: 1,
    backgroundColor: "fff",
  },
});
