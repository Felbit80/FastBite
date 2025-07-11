import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, FlatList, Alert } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useFonts } from "expo-font";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import AppLoading from "expo-app-loading";

type RootStackParamList = {
  Home: undefined;
  Search: undefined;
};

export default function Search() {
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<string>("R. Rio Branco");
  const [locationLoading, setLocationLoading] = useState(true);
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    "BeVietnamPro-Semibold": require("../assets/fonts/BeVietnamPro-SemiBold.ttf"),
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoContainer}>
          <Image source={require("../assets/imgs/icon.png")} style={styles.logo}></Image>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationButton}>
          <Image source={require("../assets/imgs/iconNotifications.png")} style={styles.notificationIcon}></Image>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}></ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
          <Image style={styles.navIcon} source={require("../assets/imgs/iconHome.png")}></Image>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Search")}>
          <Image style={styles.navIcon} source={require("../assets/imgs/iconSearch.png")}></Image>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Image style={styles.navIconActive} source={require("../assets/imgs/iconProfile.png")}></Image>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  baseText: {
    fontFamily: "BeVietnamPro-Semibold",
  },
  flexColumn: {
    flexDirection: "column",
  },
  banner: {
    width: scale(350),
    height: verticalScale(150),
    marginBottom: verticalScale(16),
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(15),
  },
  logoContainer: {
    marginRight: scale(12),
  },
  logo: {
    width: scale(40),
    height: verticalScale(40),
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: scale(10),
  },
  locationIcon: {
    fontSize: moderateScale(16),
    marginRight: scale(6),
  },
  locationLabel: {
    fontSize: moderateScale(16),
    color: "#333",
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
  },
  notificationButton: {
    padding: scale(8),
  },
  notificationIcon: {
    width: scale(28),
    height: verticalScale(28),
  },
  welcomeContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(20),
  },
  welcomeText: {
    fontSize: moderateScale(24),
    color: "#FF6600",
    fontWeight: "600",
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingBottom: verticalScale(50),
    paddingTop: verticalScale(20),
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navIconActive: {
    height: verticalScale(30),
    width: scale(30),
    tintColor: "#FF6600",
  },
  navIcon: {
    height: verticalScale(30),
    width: scale(30),
    opacity: 0.5,
  },
});
