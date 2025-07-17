import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import RestaurantDetail from "./pages/RestaurantDetail";
import ProductDetail from "./pages/ProductDetail";
import OrderForm from "./pages/OrderForm";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Search" component={Search} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="RestaurantDetail" component={RestaurantDetail} />
        <Stack.Screen name="ProductDetail" component={ProductDetail} />
        <Stack.Screen name="OrderForm" component={OrderForm} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}