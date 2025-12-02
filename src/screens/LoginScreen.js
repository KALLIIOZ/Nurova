import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../api/client';
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
      // Try authenticating against backend API (fallback to in-app mock if network fails)
      const resp = await loginUser({ email, password });
      // backend returns { access_token, user }
      if (resp && resp.access_token && resp.user) {
        await AsyncStorage.setItem('userToken', resp.access_token);
        await AsyncStorage.setItem('userEmail', resp.user.email);
        await AsyncStorage.setItem('userId', resp.user.id.toString());
        await AsyncStorage.setItem('userRole', resp.user.role);
        await AsyncStorage.setItem('userName', resp.user.name);
        navigation.replace('MainTabs');
        return;
      }

      // If response shape unexpected, fallback
      throw new Error('API response invalid');
    } catch (error) {
      // Network or backend failed -> keep previous mock behavior so user can continue testing locally
      try {
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
      } catch (err) {
        Alert.alert('Error', 'Hubo un problema al iniciar sesión');
      }
    }
  };

  const rolePretty = selectedRole === 'manager' ? 'Líder' : selectedRole === 'psychologist' ? 'Psicólogo' : 'Trabajador';

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Inicio de sesión</Text>
      <Text style={styles.subtitle}>{rolePretty}</Text>

      <Text style={styles.inputLabel}>Correo electrónico</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#B9D9F7"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.inputLabel}>Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#B9D9F7"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity onPress={() => Alert.alert('Recuperar contraseña', 'Funcionalidad no implementada aún')}>
        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
        <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <View style={styles.registerRow}>
        <Text style={styles.needAccount}>¿Necesitas una cuenta?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}> Regístrate</Text>
        </TouchableOpacity>
      </View>

      {/* Small role icons line at bottom (visual only) */}
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
  subtitle: {
    textAlign: 'center',
    color: '#9AAFE0',
    marginBottom: 18,
    fontSize: 14,
    fontWeight: '600',
  },
  inputLabel: {
    color: '#0B3D91',
    fontWeight: '700',
    marginBottom: 6,
    marginLeft: 6,
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 30,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D8EEFF',
  },
  primaryButton: {
    backgroundColor: '#FFA65C',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  forgotText: {
    color: '#4B6EA8',
    alignSelf: 'flex-end',
    marginBottom: 6,
    marginRight: 4,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  needAccount: {
    color: '#0B3D91',
    fontWeight: '700',
  },
  registerLink: {
    color: '#9AAFE0',
    fontWeight: '700',
  },
});

export default LoginScreen;