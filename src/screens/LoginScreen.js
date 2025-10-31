import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Logo local (usa require para assets empaquetados)
  // Ruta relativa desde este archivo hasta /assets es ../../assets/NUROVA.png
  const logo = require('../../assets/NUROVA.png');

  const handleLogin = async () => {
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    // Aquí normalmente harías una llamada a tu API para verificar las credenciales
    // Por ahora, simularemos un login exitoso
    try {
      // Simulación de respuesta de API
      const mockApiResponse = {
        token: 'dummy-token',
        user: {
          id: 2, // Este sería el ID que determina el rol
          email: email,
          role: 'admin'
        }
      };

      await AsyncStorage.setItem('userToken', mockApiResponse.token);
      await AsyncStorage.setItem('userEmail', mockApiResponse.user.email);
      await AsyncStorage.setItem('userId', mockApiResponse.user.id.toString());
      await AsyncStorage.setItem('userRole', mockApiResponse.user.role);
      
      navigation.replace('MainTabs');
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al iniciar sesión');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={logo}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 30,
    borderRadius: 75,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;