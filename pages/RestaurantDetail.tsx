import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, FlatList, Alert } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useFonts } from "expo-font";
import { NavigationProp, useNavigation, RouteProp, useRoute } from "@react-navigation/native";
import * as Location from "expo-location";

type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  Profile: undefined;
  RestaurantDetail: { restaurantId: number };
  ProductDetail: { productId: number };
  OrderForm: { item: any; type: 'restaurant' | 'product' };
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

export default function RestaurantDetail() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<string>("R. Rio Branco");
  const [locationLoading, setLocationLoading] = useState(true);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'RestaurantDetail'>>();
  const { restaurantId } = route.params;

  const [fontsLoaded] = useFonts({
    "BeVietnamPro-Semibold": require("../assets/fonts/BeVietnamPro-SemiBold.ttf"),
  });

  const requestLocationPermission = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permissão negada", "Para uma melhor experiência, permita o acesso à localização.", [
          { text: "OK", onPress: () => setLocationLoading(false) },
        ]);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addressResponse.length > 0) {
        const address = addressResponse[0];
        const street = address.street || "Endereço não encontrado";
        setCurrentLocation(street);
      }
    } catch (error) {
      console.error("Erro ao obter localização:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const restaurantsResponse = await fetch("https://apifakedelivery.vercel.app/restaurants");
      const restaurantsData = await restaurantsResponse.json();
      const foundRestaurant = restaurantsData.find((r: Restaurant) => r.id === restaurantId);
      setRestaurant(foundRestaurant);

      const dishesResponse = await fetch("https://apifakedelivery.vercel.app/foods");
      const dishesData = await dishesResponse.json();
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

  const renderDishItem = ({ item }: { item: Dish }) => (
    <TouchableOpacity 
      style={styles.dishCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
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
            <TouchableOpacity 
              style={styles.orderButton}
              onPress={() => navigation.navigate('OrderForm', { item, type: 'product' })}
            >
              <Text style={[styles.orderButtonText, styles.baseText]}>Pedir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={[styles.baseText, { textAlign: 'center', marginTop: verticalScale(50) }]}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={[styles.baseText, { textAlign: 'center', marginTop: verticalScale(50) }]}>Restaurante não encontrado</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, styles.baseText]}>← Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.locationContainer}>
          <Text style={[styles.locationLabel, styles.baseText]}>{locationLoading ? "Carregando..." : currentLocation}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationButton}>
          <Image source={require("../assets/imgs/iconNotifications.png")} style={styles.notificationIcon}></Image>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Restaurant Info */}
        <View style={styles.restaurantSection}>
          <Image source={{ uri: restaurant.image }} style={styles.restaurantMainImage} />
          <View style={styles.restaurantMainInfo}>
            <View style={styles.restaurantMainHeader}>
              <Text style={[styles.restaurantMainName, styles.baseText]}>{restaurant.name}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.starIcon}>⭐</Text>
                <Text style={[styles.rating, styles.baseText]}>{restaurant.rating}</Text>
              </View>
            </View>
            <Text style={[styles.restaurantMainDescription, styles.baseText]}>{restaurant.description}</Text>
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.baseText]}>Cardápio Disponível</Text>
          <FlatList
            data={dishes}
            renderItem={renderDishItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.dishSeparator} />}
          />
        </View>
      </ScrollView>
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
  flexRow: {
    display: "flex",
    flexDirection: "row",
    width: scale(172),
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
  backButton: {
    fontSize: moderateScale(16),
    color: "#FF6600",
    fontWeight: "600",
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
  content: {
    flex: 1,
  },
  restaurantSection: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(30),
  },
  restaurantMainImage: {
    width: "100%",
    height: verticalScale(200),
    borderRadius: scale(16),
    marginBottom: verticalScale(16),
  },
  restaurantMainInfo: {
    backgroundColor: "#f5f5f5",
    borderRadius: scale(16),
    padding: scale(16),
  },
  restaurantMainHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(12),
  },
  restaurantMainName: {
    fontSize: moderateScale(24),
    color: "#333",
    fontWeight: "bold",
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
  restaurantMainDescription: {
    fontSize: moderateScale(16),
    color: "#444",
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(12),
  },
  restaurantCategory: {
    fontSize: moderateScale(14),
    color: "#666",
    marginBottom: verticalScale(16),
  },
  orderRestaurantButton: {
    backgroundColor: "#FF6600",
    paddingVertical: verticalScale(12),
    borderRadius: scale(25),
    alignItems: "center",
  },
  orderRestaurantButtonText: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },
  section: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(30),
  },
  sectionTitle: {
    fontSize: moderateScale(24),
    fontWeight: "bold",
    color: "#333",
    marginBottom: verticalScale(20),
  },
  dishCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: scale(16),
    padding: scale(16),
  },
  dishSeparator: {
    height: verticalScale(16),
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
  dishImage: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(12),
    marginRight: scale(16),
  },
  dishName: {
    fontSize: moderateScale(18),
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
    fontSize: moderateScale(14),
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
    fontSize: moderateScale(14),
    color: "#444",
    fontWeight: "bold",
  },
  dishActions: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: verticalScale(60),
    width: scale(100),
  },
  orderButton: {
    backgroundColor: "#FF6600",
    paddingVertical: verticalScale(8),
    borderRadius: scale(20),
    width: scale(100),
  },
  orderButtonText: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontWeight: "bold",
    textAlign: "center",
  },
});