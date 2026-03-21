import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const ProfileScreen = ({ navigation }) => {
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userPhoto, setUserPhoto] = useState(null);
  const [userPhone, setUserPhone] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [userAge, setUserAge] = useState('');
  const [userCompany, setUserCompany] = useState('');
  const [userDepartment, setUserDepartment] = useState('');
  const [userTenure, setUserTenure] = useState('');
  const [userSpecialty, setUserSpecialty] = useState('');
  const [userExperience, setUserExperience] = useState('');
  const [userDocs, setUserDocs] = useState(null);
  const [userPosition, setUserPosition] = useState('');

  useEffect(() => {
    loadUserData();

    // reload when coming back from edit screen
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data) {
        // Map API response to state
        setUserEmail(response.data.email);
        setUserName(response.data.name);
        setUserRole(response.data.role);

        // These fields are not yet in API, but if we had them:
        // setUserCompany(response.data.company);

        // Fallback or load from local storage if mixed usage intended? 
        // For clean state, we trust API. If API is minimal, we show minimal.
        // But to keep the UI looking "full" as the user might expect, we can defaults:
        setUserCompany('Nuova');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback
      const email = await AsyncStorage.getItem('userEmail');
      const role = await AsyncStorage.getItem('userRole');
      if (email) setUserEmail(email);
      if (role) setUserRole(role);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('userName');
      await AsyncStorage.removeItem('userId');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al cerrar sesión');
    }
  };

  let displayName = userName ? `${userName}${userLastName ? ' ' + userLastName : ''}` : (userEmail || 'Usuario');
  if (userRole === 'psychologist' && userName) {
    const startsWithTitle = /^\s*(Dra\.|Dr\.)/i.test(userName);
    if (!startsWithTitle) displayName = `Dra. ${displayName}`;
  }

  const getRoleDetails = () => {
    if (userRole === 'psychologist') {
      return [
        { label: 'Correo', value: userEmail || 'No registrado' },
        { label: 'Teléfono', value: userPhone || 'Agregar teléfono' },
        { label: 'Especialidad', value: userSpecialty || '-' },
        { label: 'Años de experiencia', value: userExperience || '-' },
        { label: 'Documentos', value: userDocs ? 'Adjuntos' : 'No adjuntos' },
      ];
    }
    if (userRole === 'admin') {
      return [
        { label: 'Correo', value: userEmail || 'No registrado' },
        { label: 'Departamento', value: 'Dirección' },
        { label: 'Rol', value: 'Administrador' },
      ];
    }
    if (userRole === 'manager') {
      return [
        { label: 'Correo', value: userEmail || 'No registrado' },
        { label: 'Apellido', value: userLastName || '-' },
        { label: 'Empresa', value: userCompany || '-' },
        { label: 'Posición', value: userPosition || '-' },
      ];
    }
    return [
      { label: 'Correo', value: userEmail || 'No registrado' },
      { label: 'Apellido', value: userLastName || '-' },
      { label: 'Edad', value: userAge || '-' },
      { label: 'Empresa', value: userCompany || 'Nuova' },
      { label: 'Área / Departamento', value: userDepartment || '-' },
      { label: 'Tiempo en la empresa', value: userTenure || '-' },
    ];
  };

  const roleLabel = userRole
    ? (userRole === 'psychologist' ? 'Psicóloga' : (userRole === 'admin' ? 'Administrador' : (userRole === 'manager' ? 'Líder' : 'Trabajador')))
    : '';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topArea}>
        {userRole !== 'manager' && userRole !== 'admin' ? (
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        ) : null}

        {userPhoto ? (
          <Image source={{ uri: userPhoto }} style={styles.avatarLarge} />
        ) : (
          <View style={styles.avatarLargePlaceholder}>
            <Text style={styles.avatarTextLarge}>{displayName[0] ? displayName[0].toUpperCase() : '?'}</Text>
          </View>
        )}

        <Text style={styles.bigName}>{displayName}</Text>
        <Text style={styles.roleSub}>{roleLabel}</Text>
      </View>

      <View style={styles.detailsCard}>
        {userRole === 'manager' || userRole === 'admin' ? (
          <>
            <View style={styles.rowBlock}>
              <Text style={styles.blockLabel}>Posición</Text>
              <Text style={styles.blockValue}>{userPosition || '-'}</Text>
            </View>
            <View style={styles.rowBlock}>
              <Text style={styles.blockLabel}>Correo electrónico</Text>
              <Text style={styles.blockValue}>{userEmail || '-'}</Text>
            </View>
            <View style={styles.rowBlock}>
              <Text style={styles.blockLabel}>Empresa</Text>
              <Text style={styles.blockValue}>{userCompany || '-'}</Text>
            </View>
          </>
        ) : userRole === 'worker' ? (
          <>
            <View style={styles.rowBlock}>
              <Text style={styles.blockLabel}>Edad</Text>
              <Text style={styles.blockValue}>{userAge ? `${userAge} años` : '-'}</Text>
            </View>
            <View style={styles.rowBlock}>
              <Text style={styles.blockLabel}>Correo electrónico</Text>
              <Text style={styles.blockValue}>{userEmail || '-'}</Text>
            </View>
            <View style={styles.rowBlock}>
              <Text style={styles.blockLabel}>Empresa</Text>
              <Text style={styles.blockValue}>{userCompany || '-'}</Text>
            </View>
            <View style={styles.rowBlock}>
              <Text style={styles.blockLabel}>Área o departamento</Text>
              <Text style={styles.blockValue}>{userDepartment || '-'}</Text>
            </View>
          </>
        ) : (
          getRoleDetails().map((row) => (
            <View key={row.label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue}>{row.value}</Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF4FF',
    padding: 20,
  },
  topArea: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  editButtonText: {
    color: '#007AFF',
    fontWeight: '700',
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    borderWidth: 6,
    borderColor: '#F5F7FB',
    marginBottom: 12,
  },
  avatarLargePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    borderWidth: 6,
    borderColor: '#F5F7FB',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextLarge: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0B3D91'
  },
  bigName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0B3D91',
    marginBottom: 4,
  },
  roleSub: {
    fontSize: 14,
    color: '#0B3D91',
    opacity: 0.8,
    marginBottom: 12,
    fontWeight: '700',
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 12,
    padding: 18,
  },
  rowBlock: {
    marginBottom: 12,
  },
  blockLabel: {
    color: '#0B3D91',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  blockValue: {
    color: '#6C7DA6',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#777',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B3D91',
  },
  logoutButton: {
    backgroundColor: '#FFA65C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    width: '80%',
    alignSelf: 'center',
    marginBottom: 40,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;