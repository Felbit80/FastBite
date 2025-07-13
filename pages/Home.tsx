import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, FlatList, Alert } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useFonts } from "expo-font";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import AppLoading from "expo-app-loading";

type RootStackParamList = {
  Search: undefined;
  Profile: undefined;
};

type Restaurant = {
  id: number;
  name: string;
  rating: number;
  description: string;
  image: string;
  category: string;
};

type Dish = {
  id: number;
  name: string;
  rating: number;
  description: string;
  image: string;
  price: number;
  time: string;
};

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<string>("R. Rio Branco");
  const [locationLoading, setLocationLoading] = useState(true);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [fontsLoaded] = useFonts({
    "BeVietnamPro-Semibold": require("../assets/fonts/BeVietnamPro-SemiBold.ttf"),
  });

  // Função para solicitar permissão e obter localização
  const requestLocationPermission = async () => {
    try {
      setLocationLoading(true);

      // Solicita permissão para acessar a localização
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permissão negada", "Para uma melhor experiência, permita o acesso à localização.", [
          { text: "OK", onPress: () => setLocationLoading(false) },
        ]); 
        return;
      }

      // Obtém a localização atual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Converte coordenadas em endereço
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addressResponse.length > 0) {
        const address = addressResponse[0];
        const street = address.street || "Endereço não encontrado";
        const fullAddress = `${street}`;

        setCurrentLocation(fullAddress);
      }
    } catch (error) {
      console.error("Erro ao obter localização:", error);
      Alert.alert("Erro de localização", "Não foi possível obter sua localização atual.", [{ text: "OK" }]);
    } finally {
      setLocationLoading(false);
    }
  };

  // Função para carregar dados da API
  const loadData = async () => {
    try {
      setLoading(true);
      const restaurantsResponse = await fetch("https://apifakedelivery.vercel.app/restaurants");
      const restaurantsData = await restaurantsResponse.json();
      const dishesResponse = await fetch("https://apifakedelivery.vercel.app/foods");
      const dishesData = await dishesResponse.json();
      setRestaurants(restaurantsData);
      setDishes(dishesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    requestLocationPermission();
  }, []);

  const renderRestaurantItem = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity style={styles.restaurantCard}>
      <Image source={{ uri: item.image }} style={styles.restaurantImage} />
      <View style={styles.restaurantInfo}>
        <View style={styles.restaurantHeader}>
          <Text style={[styles.restaurantName, styles.baseText]}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={[styles.rating, styles.baseText]}>{item.rating}</Text>
          </View>
        </View>
        <Text style={[styles.restaurantDescription, styles.baseText]}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderDishItem = ({ item }: { item: Dish }) => (
    <TouchableOpacity style={styles.dishCard}>
      <View style={styles.dishInfo}>
        <View style={styles.dishHeader}>
          <Image source={{ uri: item.image }} style={styles.dishImage} />
          <View style={styles.flexColumn}>
            <View style={styles.flexRow}>
              <Text style={[styles.dishName, styles.baseText]}>{item.name}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.starIcon}>⭐</Text>
                <Text style={[styles.rating, styles.baseText]}>{item.rating}</Text>
              </View>
            </View>
            <Text style={[styles.dishDescription, styles.baseText]}>{item.description}</Text>
          </View>
        </View>

        <View style={styles.dishFooter}>
          <View style={styles.dishDetails}>
            <View style={styles.timeContainer}>
              <Image style={styles.timeIcon} source={require("../assets/imgs/iconTime.png")}></Image>
              <Text style={[styles.deliveryTime, styles.baseText]}>{item.time}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Image style={styles.priceSymbol} source={require("../assets/imgs/iconPrice.png")}></Image>
              <Text style={[styles.price, styles.baseText]}>{item.price.toFixed(2)}</Text>
            </View>
          </View>
          <View style={styles.dishActions}>
            <TouchableOpacity style={styles.orderButton}>
              <Text style={[styles.orderButtonText, styles.baseText]}>Pedir</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={[styles.addToCartText, styles.baseText]}>Adicionar à sacola</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoContainer}>
          <Image source={require("../assets/imgs/icon.png")} style={styles.logo}></Image>
        </TouchableOpacity>
        <TouchableOpacity style={styles.locationContainer} onPress={requestLocationPermission}>
          <Text style={styles.locationIcon}></Text>
          <Text style={[styles.locationLabel, styles.baseText]}>{locationLoading ? "Carregando..." : currentLocation}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationButton}>
          <Image source={require("../assets/imgs/iconNotifications.png")} style={styles.notificationIcon}></Image>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={[styles.welcomeText, styles.baseText]}>E aí chefe? Vai um lanche?</Text>
        </View>

        <Image source={require("../assets/imgs/banner.png")} style={styles.banner}></Image>

        {/* Restaurantes Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.baseText]}>Restaurantes</Text>
          <FlatList
            data={restaurants}
            renderItem={renderRestaurantItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          />
        </View>

        {/* Pratos Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.baseText]}>Pratos</Text>
          <FlatList
            data={dishes}
            renderItem={renderDishItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Image style={styles.navIconActive} source={require("../assets/imgs/iconHome.png")}></Image>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Search")}>
          <Image style={styles.navIcon} source={require("../assets/imgs/iconSearch.png")}></Image>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Profile")}>
          <Image style={styles.navIcon} source={require("../assets/imgs/iconProfile.png")}></Image>
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
    marginBottom: verticalScale(16)
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
  section: {
    marginBottom: verticalScale(30),
  },
  sectionTitle: {
    fontSize: moderateScale(28),
    fontWeight: "bold",
    color: "#333",
    marginBottom: verticalScale(15),
    paddingHorizontal: scale(20),
  },
  carouselContainer: {
    paddingHorizontal: scale(20),
  },
  itemSeparator: {
    width: scale(16),
  },
  restaurantCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: scale(16),
    padding: scale(16),
    width: scale(300),
    flexDirection: "row",
  },
  restaurantImage: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(12),
    marginRight: scale(16),
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  restaurantName: {
    fontSize: moderateScale(20),
    color: "#333",
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(8),
    marginLeft: scale(8),
    alignSelf: "flex-start",
  },
  starIcon: {
    fontSize: moderateScale(12),
    marginRight: scale(4),
  },
  rating: {
    fontSize: moderateScale(14),
    color: "#fff",
    fontWeight: "bold",
  },
  restaurantDescription: {
    fontSize: moderateScale(14),
    color: "#444",
    lineHeight: moderateScale(18),
  },
  dishCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: scale(16),
    padding: scale(16),
    width: scale(300),
    flexDirection: "row",
  },
  dishImage: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(12),
    marginRight: scale(16),
  },
  dishInfo: {
    flex: 1,
  },
  dishHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: verticalScale(16),
    height: verticalScale(80),
  },
  flexRow: {
    display: "flex",
    flexDirection: "row",
    width: scale(172),
  },
  dishName: {
    fontSize: moderateScale(20),
    color: "#333",
    flex: 1,
  },
  dishDescription: {
    fontSize: moderateScale(14),
    color: "#444",
    lineHeight: moderateScale(18),
    marginBottom: verticalScale(12),
    marginTop: verticalScale(8),
    width: scale(180),
  },
  dishFooter: {
    gap: verticalScale(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dishDetails: {
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "flex-start",
    height: verticalScale(60),
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: verticalScale(30),
    marginTop: verticalScale(-5),
  },
  timeIcon: {
    height: verticalScale(20),
    width: scale(25),
    marginRight: scale(8),
  },
  deliveryTime: {
    fontSize: moderateScale(16),
    color: "#444",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(-10),
  },
  priceSymbol: {
    height: verticalScale(20),
    width: scale(25),
    marginRight: scale(8),
  },
  price: {
    fontSize: moderateScale(16),
    color: "#444",
    fontWeight: "bold",
  },
  dishActions: {
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    height: verticalScale(60),
    width: scale(150),
  },
  orderButton: {
    backgroundColor: "#FF6600",
    paddingVertical: verticalScale(8),
    borderRadius: scale(20),
    width: scale(150),
  },
  orderButtonText: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontWeight: "bold",
    textAlign: "center",
  },
  addToCartText: {
    color: "#FF6600",
    fontSize: moderateScale(12),
    fontWeight: "600",
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
    opacity: .5
  },
});
