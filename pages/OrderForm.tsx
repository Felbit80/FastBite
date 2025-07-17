import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, TextInput, Alert } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useFonts } from "expo-font";
import { NavigationProp, useNavigation, RouteProp, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  Profile: undefined;
  RestaurantDetail: { restaurantId: number };
  ProductDetail: { productId: number };
  OrderForm: { item: any; type: 'restaurant' | 'product' };
};

export default function OrderForm() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<string>("R. Rio Branco");
  const [locationLoading, setLocationLoading] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [observations, setObservations] = useState("");
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'OrderForm'>>();
  const { item, type } = route.params;

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
        setDeliveryAddress(street);
      }
    } catch (error) {
      console.error("Erro ao obter localização:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
    requestLocationPermission();
  }, []);

  const handleSubmitOrder = () => {
    if (!deliveryAddress.trim()) {
      Alert.alert("Erro", "Por favor, informe o endereço de entrega.");
      return;
    }

    // Simular envio do pedido
    Alert.alert(
      "Pedido Realizado!",
      `Seu pedido foi enviado com sucesso!\n\nItem: ${item.name}\nEndereço: ${deliveryAddress}\nPagamento: ${paymentMethod === 'credit' ? 'Cartão de Crédito' : paymentMethod === 'debit' ? 'Cartão de Débito' : 'Dinheiro'}`,
      [
        {
          text: "OK",
          onPress: () => navigation.navigate("Home")
        }
      ]
    );
  };

  const getItemPrice = () => {
    if (type === 'product' && item.totalPrice) {
      return item.totalPrice.toFixed(2);
    }
    return item.price ? item.price.toFixed(2) : "0.00";
  };

  const getDeliveryFee = () => {
    return "5.00"; // Taxa fixa de entrega
  };

  const getTotalPrice = () => {
    const itemPrice = parseFloat(getItemPrice());
    const deliveryFee = parseFloat(getDeliveryFee());
    return (itemPrice + deliveryFee).toFixed(2);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={[styles.baseText, { textAlign: 'center', marginTop: verticalScale(50) }]}>Carregando...</Text>
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
        <Text style={[styles.headerTitle, styles.baseText]}>Finalizar Pedido</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Image source={require("../assets/imgs/iconNotifications.png")} style={styles.notificationIcon}></Image>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.baseText]}>Resumo do Pedido</Text>
          <View style={styles.orderSummary}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, styles.baseText]}>{item.name}</Text>
              <Text style={[styles.itemDescription, styles.baseText]}>{item.description}</Text>
              {type === 'product' && item.quantity && (
                <Text style={[styles.itemQuantity, styles.baseText]}>Quantidade: {item.quantity}</Text>
              )}
              <Text style={[styles.itemPrice, styles.baseText]}>R$ {getItemPrice()}</Text>
            </View>
          </View>
        </View>

        {/* User Info */}
        {user && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, styles.baseText]}>Dados do Cliente</Text>
            <View style={styles.userInfo}>
              <Text style={[styles.userInfoText, styles.baseText]}>Nome: {user.name}</Text>
              <Text style={[styles.userInfoText, styles.baseText]}>Email: {user.email}</Text>
            </View>
          </View>
        )}

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.baseText]}>Endereço de Entrega</Text>
          <TextInput
            style={[styles.input, styles.baseText]}
            placeholder="Digite o endereço completo"
            placeholderTextColor="#999"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            multiline
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.baseText]}>Forma de Pagamento</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity 
              style={[styles.paymentOption, paymentMethod === 'credit' && styles.paymentOptionSelected]}
              onPress={() => setPaymentMethod('credit')}
            >
              <Text style={[styles.paymentOptionText, styles.baseText, paymentMethod === 'credit' && styles.paymentOptionTextSelected]}>
                Cartão de Crédito
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.paymentOption, paymentMethod === 'debit' && styles.paymentOptionSelected]}
              onPress={() => setPaymentMethod('debit')}
            >
              <Text style={[styles.paymentOptionText, styles.baseText, paymentMethod === 'debit' && styles.paymentOptionTextSelected]}>
                Cartão de Débito
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentOptionSelected]}
              onPress={() => setPaymentMethod('cash')}
            >
              <Text style={[styles.paymentOptionText, styles.baseText, paymentMethod === 'cash' && styles.paymentOptionTextSelected]}>
                Dinheiro
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Observations */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.baseText]}>Observações</Text>
          <TextInput
            style={[styles.input, styles.observationsInput, styles.baseText]}
            placeholder="Observações adicionais (opcional)"
            placeholderTextColor="#999"
            value={observations}
            onChangeText={setObservations}
            multiline
          />
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.baseText]}>Resumo de Valores</Text>
          <View style={styles.priceSummary}>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, styles.baseText]}>Subtotal:</Text>
              <Text style={[styles.priceValue, styles.baseText]}>R$ {getItemPrice()}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, styles.baseText]}>Taxa de entrega:</Text>
              <Text style={[styles.priceValue, styles.baseText]}>R$ {getDeliveryFee()}</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, styles.baseText]}>Total:</Text>
              <Text style={[styles.totalValue, styles.baseText]}>R$ {getTotalPrice()}</Text>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitOrder}>
            <Text style={[styles.submitButtonText, styles.baseText]}>Confirmar Pedido</Text>
          </TouchableOpacity>
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
  headerTitle: {
    fontSize: moderateScale(18),
    color: "#333",
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
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
  section: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: "bold",
    color: "#333",
    marginBottom: verticalScale(16),
  },
  orderSummary: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: scale(12),
    padding: scale(16),
  },
  itemImage: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(12),
    marginRight: scale(16),
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: moderateScale(18),
    color: "#333",
    fontWeight: "bold",
    marginBottom: verticalScale(4),
  },
  itemDescription: {
    fontSize: moderateScale(14),
    color: "#666",
    marginBottom: verticalScale(8),
  },
  itemQuantity: {
    fontSize: moderateScale(14),
    color: "#444",
    marginBottom: verticalScale(4),
  },
  itemPrice: {
    fontSize: moderateScale(16),
    color: "#FF6600",
    fontWeight: "bold",
  },
  userInfo: {
    backgroundColor: "#f5f5f5",
    borderRadius: scale(12),
    padding: scale(16),
  },
  userInfoText: {
    fontSize: moderateScale(16),
    color: "#333",
    marginBottom: verticalScale(8),
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(16),
    backgroundColor: "#fff",
    color: "#333",
  },
  observationsInput: {
    height: verticalScale(80),
    textAlignVertical: "top",
  },
  paymentMethods: {
    gap: verticalScale(12),
  },
  paymentOption: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: scale(12),
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(16),
    backgroundColor: "#fff",
  },
  paymentOptionSelected: {
    borderColor: "#FF6600",
    backgroundColor: "#FFF5F0",
  },
  paymentOptionText: {
    fontSize: moderateScale(16),
    color: "#333",
    textAlign: "center",
  },
  paymentOptionTextSelected: {
    color: "#FF6600",
    fontWeight: "bold",
  },
  priceSummary: {
    backgroundColor: "#f5f5f5",
    borderRadius: scale(12),
    padding: scale(16),
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  priceLabel: {
    fontSize: moderateScale(16),
    color: "#666",
  },
  priceValue: {
    fontSize: moderateScale(16),
    color: "#333",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: verticalScale(12),
    marginTop: verticalScale(8),
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: moderateScale(18),
    color: "#333",
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: moderateScale(20),
    color: "#FF6600",
    fontWeight: "bold",
  },
  submitSection: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(30),
  },
  submitButton: {
    backgroundColor: "#FF6600",
    paddingVertical: verticalScale(16),
    borderRadius: scale(25),
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: moderateScale(18),
    fontWeight: "bold",
  },
});