import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, TextInput, Alert } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useFonts } from "expo-font";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import AppLoading from "expo-app-loading";

type RootStackParamList = {
  Home: undefined;
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

export default function Search() {
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<string>("R. Rio Branco");
  const [locationLoading, setLocationLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);

  const [fontsLoaded] = useFonts({
    "BeVietnamPro-Semibold": require("../assets/fonts/BeVietnamPro-SemiBold.ttf"),
  });

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

const renderRestaurantCard = ({ item }: { item: Restaurant | Dish }) => (
    <TouchableOpacity style={styles.restaurantCard} key={item.id}>
      <Image source={{ uri: item.image }} style={styles.restaurantImage} />
      <View style={styles.restaurantInfo}>
        <Text style={[styles.restaurantName, styles.baseText]}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
        </View>
      </View>
      {"price" in item && (
        <View style={styles.priceContainer}>
          <Image style={styles.priceSymbol} source={require("../assets/imgs/iconPrice.png")}></Image>
          <Text style={styles.price}>{item.price}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const filteredRestaurants = restaurants.filter((restaurant) => restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredDishes = dishes.filter((dish) => dish.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoContainer}>
          <Image source={require("../assets/imgs/icon.png")} style={styles.logo}></Image>
        </TouchableOpacity>
        <TouchableOpacity style={styles.locationContainer} onPress={requestLocationPermission}>
          <Text style={[styles.locationLabel, styles.baseText]}>{locationLoading ? "Carregando..." : currentLocation}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationButton}>
          <Image source={require("../assets/imgs/iconNotifications.png")} style={styles.notificationIcon}></Image>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            style={[styles.searchInput, styles.baseText]}
            placeholder="Pesquise por um tópico"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchButton}>
            <Image source={require("../assets/imgs/iconSearch.png")} style={styles.searchIcon}></Image>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsTitle, styles.baseText]}>Resultados</Text>

          {filteredRestaurants.map((restaurant) => renderRestaurantCard({ item: restaurant }))}
          {filteredDishes.map((dish) => renderRestaurantCard({ item: dish }))}

          {filteredRestaurants.length === 0 && filteredDishes.length === 0 && searchQuery !== "" && (
            <Text style={[styles.baseText, { color: "#999", marginTop: 10 }]}>Nenhum resultado encontrado.</Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
          <Image style={styles.navIcon} source={require("../assets/imgs/iconHome.png")}></Image>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Image style={styles.navIconActive} source={require("../assets/imgs/iconSearch.png")}></Image>
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
  searchContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(20),
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: scale(25),
    paddingHorizontal: scale(15),
    height: verticalScale(50),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(16),
    color: "#333",
    paddingVertical: verticalScale(10),
  },
  searchButton: {
    padding: scale(5),
  },
  searchIcon: {
    width: scale(22),
    height: verticalScale(22),
  },
  content: {
    flex: 1,
  },
  resultsContainer: {
    paddingHorizontal: scale(20),
  },
  resultsTitle: {
    fontSize: moderateScale(24),
    color: "#333",
    fontWeight: "600",
    marginBottom: verticalScale(20),
  },
  restaurantCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: scale(15),
    padding: scale(15),
    marginBottom: verticalScale(15),
  },
  restaurantImage: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(10),
    marginRight: scale(15),
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: moderateScale(18),
    color: "#333",
    fontWeight: "600",
    marginBottom: verticalScale(5),
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: moderateScale(14),
    color: "#666",
    backgroundColor: "#e0e0e0",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    borderRadius: scale(10),
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceSymbol: {
    height: verticalScale(30),
    width: scale(30),
  },
  price: {
    fontSize: moderateScale(16),
    color: "#333",
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
    opacity: 0.5,
  },
});
