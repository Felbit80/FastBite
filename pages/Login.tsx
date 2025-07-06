import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Image } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useNavigation } from "@react-navigation/native";

const customFonts = {
  "BeVietnamPro-Semibold": require("../assets/fonts/BeVietnamPro-SemiBold.ttf"),
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      alert("Por favor, insira um email válido.");
      return;
    }

    if (password.length < 8) {
      alert("A senha deve conter pelo menos 8 caracteres.");
      return;
    }

    try {
      const response = await fetch("https://apifakedelivery.vercel.app/users");
      const users = await response.json();

      const matchedUser = users.find((user: any) => user.email === email && user.senha === password);

      if (matchedUser) {
        alert("Login Válido");
      } else {
        alert("Email ou senha incorretos.");
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor. Tente novamente.");
      console.error("Erro ao buscar usuários:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#f8f9fa" />

      <View style={styles.content}>
        {/* Logo e título */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require("../assets/imgs/icon.png")} style={styles.logo}></Image>
          </View>
          <Text style={[styles.title, styles.baseText]}>FastBite</Text>
        </View>

        {/* Texto de boas-vindas */}
        <View style={styles.welcomeContainer}>
          <Text style={[styles.welcomeText, styles.baseText]}>Seja bem-vindo novamente!</Text>
          <Text style={[styles.welcomeText, styles.baseText]}>Faça seu login:</Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          {/* Campo Email */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, styles.baseText]}>Email</Text>
            <TextInput
              style={[styles.input, styles.baseText]}
              placeholder="Digite seu nome"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Campo Senha */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, styles.baseText]}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, styles.baseText]}
                placeholder="Digite sua senha"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                <Image
                  style={styles.iconShowPassword}
                  source={
                    showPassword
                      ? require("../assets/imgs/iconPasswordVisible.png")
                      : require("../assets/imgs/iconPasswordInvisible.png")
                  }
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Link Esqueceu senha */}
          <TouchableOpacity activeOpacity={.8}>
            <Text style={[styles.forgotPassword, styles.baseText]}>Esqueceu sua senha?</Text>
          </TouchableOpacity>

          {/* Botão de Login */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={.8}>
            <Text style={[styles.loginButtonText, styles.baseText]}>Logar </Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: "fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(32),
    paddingTop: verticalScale(60),
  },
  header: {
    alignItems: "center",
    marginBottom: verticalScale(24),
  },
  logoContainer: {
    width: scale(80),
    height: scale(80),
    backgroundColor: "#FF6600",
    borderRadius: scale(20),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  logo: {
    width: scale(110),
    height: scale(110),
  },
  title: {
    fontSize: moderateScale(40),
    fontWeight: "bold",
    color: "#FF6600",
  },
  welcomeContainer: {
    alignItems: "center",
    marginBottom: verticalScale(48),
  },
  welcomeText: {
    fontSize: moderateScale(22),
    color: "#FF6600",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: moderateScale(24),
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: verticalScale(24),
  },
  label: {
    fontSize: moderateScale(20),
    fontWeight: "600",
    color: "#333",
    marginBottom: verticalScale(8),
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    fontSize: moderateScale(16),
    backgroundColor: "#fff",
    color: "#333",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: scale(12),
    backgroundColor: "#fff",
    paddingRight: scale(16),
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    fontSize: moderateScale(16),
    color: "#333",
  },
  eyeIcon: {
    padding: scale(4),
  },
  iconShowPassword: {
    opacity: 100,
    height: verticalScale(30),
    width: scale(30)
  },
  forgotPassword: {
    color: "#FF6600",
    fontSize: moderateScale(18),
    fontWeight: "500",
    textAlign: "center",
    marginTop: verticalScale(16),
    marginBottom: verticalScale(32),
  },
  loginButton: {
    backgroundColor: "#FF6600",
    paddingVertical: verticalScale(18),
    borderRadius: scale(40),
    alignItems: "center",
    marginTop: verticalScale(16),
  },
  loginButtonText: {
    color: "#fff",
    fontSize: moderateScale(22),
    fontWeight: "bold",
  },
});
