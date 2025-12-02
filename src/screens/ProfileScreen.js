import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      const email = await AsyncStorage.getItem('userEmail');
      const name = await AsyncStorage.getItem('userName');
      const role = await AsyncStorage.getItem('userRole');
      const photo = await AsyncStorage.getItem('userPhoto');
      const phone = await AsyncStorage.getItem('userPhone');
      const lastName = await AsyncStorage.getItem('userLastName');
      const age = await AsyncStorage.getItem('userAge');
      const company = await AsyncStorage.getItem('userCompany');
      const department = await AsyncStorage.getItem('userDepartment');
      const tenure = await AsyncStorage.getItem('userTenure');
      const specialty = await AsyncStorage.getItem('userSpecialty');
      const experience = await AsyncStorage.getItem('userExperience');
      const docs = await AsyncStorage.getItem('userDocs');
      const position = await AsyncStorage.getItem('userPosition');

      if (email) setUserEmail(email);
      if (name) setUserName(name);
      if (role) setUserRole(role);
      if (photo) setUserPhoto(photo);
      if (phone) setUserPhone(phone);
      if (lastName) setUserLastName(lastName);
      if (age) setUserAge(age);
      if (company) setUserCompany(company);
      if (department) setUserDepartment(department);
      if (tenure) setUserTenure(tenure);
      if (specialty) setUserSpecialty(specialty);
      if (experience) setUserExperience(experience);
      if (docs) setUserDocs(docs);
      if (position) setUserPosition(position);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('userName');
      await AsyncStorage.removeItem('userPhoto');
      await AsyncStorage.removeItem('userPhone');
      await AsyncStorage.removeItem('userId');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al cerrar sesión');
    }
  };

  let displayName = userName ? `${userName}${userLastName ? ' ' + userLastName : ''}` : (userEmail || 'Usuario');
  // For psychologist mock: prefix with Dra. if not already present
  if (userRole === 'psychologist' && userName) {
    const startsWithTitle = /^\s*(Dra\.|Dr\.)/i.test(userName);
    if (!startsWithTitle) displayName = `Dra. ${displayName}`;
  }

  // Prepare role-adapted details (fallback placeholders when info is missing)
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

    // default / worker
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
    <View style={styles.container}>
      <View style={styles.topArea}>
        {/* hide edit for manager/admin to match the leader view mock */}
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
        {userRole === 'worker' ? (
          <Text style={styles.roleSub}>Trabajadora</Text>
        ) : userRole === 'manager' || userRole === 'admin' ? (
          // show the actual position/title as role subtitle for managers/admins
          <Text style={styles.roleSub}>{userPosition || roleLabel}</Text>
        ) : (
          roleLabel ? <Text style={styles.roleSub}>{roleLabel}</Text> : null
        )}
      </View>

      <View style={styles.detailsCard}>
        {/* manager / leader specific layout */}
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

            <View style={styles.rowBlock}>
              <Text style={styles.blockLabel}>Departamentos encargados</Text>
              {/* Try to parse multiple departments if stored as CSV; otherwise show fallback list */}
              {userDepartment ? (
                userDepartment.split(/[;,|\n]/).map((d, idx) => (
                  <Text key={idx} style={styles.blockValue}>• {d.trim()}</Text>
                ))
              ) : (
                <>
                  <Text style={styles.blockValue}>• Contabilidad de costos</Text>
                  <Text style={styles.blockValue}>• Cuentas por pagar</Text>
                  <Text style={styles.blockValue}>• Cuentas por cobrar</Text>
                </>
              )}
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
          // other roles keep previous rows
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF4FF',
    padding: 20,
  },
  profileInfo: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
  },
  email: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '700',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: 6,
  },
  leftHeader: { width: 36 },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  editButtonText: {
    color: '#007AFF',
    fontWeight: '700',
  },

  profileCard: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 6,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 56,
    marginBottom: 10,
    backgroundColor: '#007AFF',
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
  topArea: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
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
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#007AFF',
    marginBottom: 6,
  },
  roleLabel: {
    fontSize: 14,
    color: '#007AFF',
    opacity: 0.8,
    fontWeight: '600',
  },

  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 14,
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
  extraButton: {
    marginTop: 12,
    backgroundColor: '#F2F7FB',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  extraButtonText: {
    color: '#007AFF',
    fontWeight: '700',
  },
  settingItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FFA65C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    width: '80%',
    alignSelf: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;