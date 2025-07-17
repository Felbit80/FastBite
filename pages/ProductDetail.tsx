import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, Alert } from "react-native";
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

type Dish = {
  id: number;
  name: string;
  rating: number;
  description: string;
  image: string;
  price: number;
  time: string;
};

export default function ProductDetail() {
  const [product, setProduct] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<string>("R. Rio Branco");
  const [locationLoading, setLocationLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProductDetail'>>();
  const { productId } = route.params;

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
      const dishesResponse = await fetch("https://apifakedelivery.vercel.app/foods");
      const dishesData = await dishesResponse.json();
      const foundProduct = dishesData.find((p: Dish) => p.id === productId);
      setProduct(foundProduct);
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

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const getTotalPrice = () => {
    return product ? (product.price * quantity).toFixed(2) : "0.00";
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={[styles.baseText, { textAlign: 'center', marginTop: verticalScale(50) }]}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={[styles.baseText, { textAlign: 'center', marginTop: verticalScale(50) }]}>Produto não encontrado</Text>
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
        {/* Product Image */}
        <View style={styles.imageSection}>
          <Image source={{ uri: product.image }} style={styles.productMainImage} />
        </View>

        {/* Product Info */}
        <View style={styles.productSection}>
          <View style={styles.productMainInfo}>
            <View style={styles.productMainHeader}>
              <Text style={[styles.productMainName, styles.baseText]}>{product.name}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.starIcon}>⭐</Text>
                <Text style={[styles.rating, styles.baseText]}>{product.rating}</Text>
              </View>
            </View>
            <Text style={[styles.productMainDescription, styles.baseText]}>{product.description}</Text>
            
            <View style={styles.productDetails}>
              <View style={styles.timeContainer}>
                <Image style={styles.timeIcon} source={require("../assets/imgs/iconTime.png")}></Image>
                <Text style={[styles.deliveryTime, styles.baseText]}>Tempo de entrega: {product.time}</Text>
              </View>
              <View style={styles.priceContainer}>
                <Image style={styles.priceSymbol} source={require("../assets/imgs/iconPrice.png")}></Image>
                <Text style={[styles.price, styles.baseText]}>R$ {product.price.toFixed(2)}</Text>
              </View>
            </View>

            {/* Quantity Selector */}
            <View style={styles.quantitySection}>
              <Text style={[styles.quantityLabel, styles.baseText]}>Quantidade:</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity style={styles.quantityButton} onPress={decreaseQuantity}>
                  <Text style={[styles.quantityButtonText, styles.baseText]}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.quantityValue, styles.baseText]}>{quantity}</Text>
                <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
                  <Text style={[styles.quantityButtonText, styles.baseText]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Total Price */}
            <View style={styles.totalSection}>
              <Text style={[styles.totalLabel, styles.baseText]}>Total:</Text>
              <Text style={[styles.totalPrice, styles.baseText]}>R$ {getTotalPrice()}</Text>
            </View>

            {/* Order Button */}
            <TouchableOpacity 
              style={styles.orderButton}
              onPress={() => navigation.navigate('OrderForm', { 
                item: { ...product, quantity, totalPrice: parseFloat(getTotalPrice()) }, 
                type: 'product' 
              })}
            >
              <Text style={[styles.orderButtonText, styles.baseText]}>Fazer Pedido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  imageSection: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(20),
  },
  productMainImage: {
    width: "100%",
    height: verticalScale(250),
    borderRadius: scale(16),
  },
  productSection: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(30),
  },
  productMainInfo: {
    backgroundColor: "#f5f5f5",
    borderRadius: scale(16),
    padding: scale(20),
  },
  productMainHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  productMainName: {
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
  productMainDescription: {
    fontSize: moderateScale(16),
    color: "#444",
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(20),
  },
  productDetails: {
    marginBottom: verticalScale(24),
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(12),
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
  },
  priceSymbol: {
    height: verticalScale(20),
    width: scale(25),
    marginRight: scale(8),
  },
  price: {
    fontSize: moderateScale(18),
    color: "#444",
    fontWeight: "bold",
  },
  quantitySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(20),
    paddingVertical: verticalScale(16),
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  quantityLabel: {
    fontSize: moderateScale(18),
    color: "#333",
    fontWeight: "600",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    backgroundColor: "#FF6600",
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    color: "#fff",
    fontSize: moderateScale(20),
    fontWeight: "bold",
  },
  quantityValue: {
    fontSize: moderateScale(20),
    color: "#333",
    fontWeight: "bold",
    marginHorizontal: scale(20),
    minWidth: scale(30),
    textAlign: "center",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(24),
    paddingVertical: verticalScale(16),
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  totalLabel: {
    fontSize: moderateScale(20),
    color: "#333",
    fontWeight: "bold",
  },
  totalPrice: {
    fontSize: moderateScale(24),
    color: "#FF6600",
    fontWeight: "bold",
  },
  orderButton: {
    backgroundColor: "#FF6600",
    paddingVertical: verticalScale(16),
    borderRadius: scale(25),
    alignItems: "center",
  },
  orderButtonText: {
    color: "#fff",
    fontSize: moderateScale(18),
    fontWeight: "bold",
  },
});