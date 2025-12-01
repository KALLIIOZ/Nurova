import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LeaderIcon, WorkerIcon, PsychologistRoleIcon } from '../components/icons';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Logo local (usa require para assets empaquetados)
  // Ruta relativa desde este archivo hasta /assets es ../../assets/NUROVA.png
  const logo = require('../../assets/NUROVA.png');
  const [selectedRole, setSelectedRole] = useState('worker');

  const handleLogin = async () => {
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    // Aquí normalmente harías una llamada a tu API para verificar las credenciales
    // Por ahora, simularemos un login exitoso
    try {
      // Simulación de respuesta de API basada en el rol seleccionado
      const roleMap = {
        manager: { id: 3, role: 'manager', name: 'Líder' },
        worker: { id: 1, role: 'worker', name: 'Trabajador' },
        psychologist: { id: 4, role: 'psychologist', name: 'María González' },
      };

      const selected = roleMap[selectedRole] || roleMap.worker;

      const mockApiResponse = {
        token: 'dummy-token',
        user: {
          id: selected.id,
          email: email,
          role: selected.role,
          name: selected.name
        }
      };

      await AsyncStorage.setItem('userToken', mockApiResponse.token);
      await AsyncStorage.setItem('userEmail', mockApiResponse.user.email);
      await AsyncStorage.setItem('userId', mockApiResponse.user.id.toString());
      await AsyncStorage.setItem('userRole', mockApiResponse.user.role);
      await AsyncStorage.setItem('userName', mockApiResponse.user.name);
      
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

      {/* Selector de rol: líder/gerente, trabajador, psicólogo - moved below inputs */}
      <View style={styles.roleSelectorContainer}>
        <TouchableOpacity style={[styles.roleButton, selectedRole === 'manager' && styles.roleSelected]} onPress={() => setSelectedRole('manager')}>
          <LeaderIcon width={28} height={28} color={selectedRole === 'manager' ? '#007AFF' : '#666'} />
          <Text style={styles.roleLabel}>Líder / Gerente</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.roleButton, selectedRole === 'worker' && styles.roleSelected]} onPress={() => setSelectedRole('worker')}>
          <WorkerIcon width={28} height={28} color={selectedRole === 'worker' ? '#007AFF' : '#666'} />
          <Text style={styles.roleLabel}>Trabajador</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.roleButton, selectedRole === 'psychologist' && styles.roleSelected]} onPress={() => setSelectedRole('psychologist')}>
          <PsychologistRoleIcon width={28} height={28} color={selectedRole === 'psychologist' ? '#007AFF' : '#666'} />
          <Text style={styles.roleLabel}>Psicólogo</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#EAF4FF',
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 30,
    borderRadius: 75,
  },
  roleSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  roleButton: {
    alignItems: 'center',
    padding: 6,
  },
  roleSelected: {
    backgroundColor: '#e9f2ff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roleLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    width: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#007AFF',
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