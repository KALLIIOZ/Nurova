import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser, loginUser } from '../api/client';
import { LeaderIcon, WorkerIcon, PsychologistRoleIcon } from '../components/icons';

const RegisterScreen = ({ navigation }) => {
  const [stage, setStage] = useState('role'); // 'role' or 'form'
  const [selectedRole, setSelectedRole] = useState(null);

  // form state
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [age, setAge] = useState('');
  const [company, setCompany] = useState('');
  const [department, setDepartment] = useState('');
  const [tenure, setTenure] = useState('');
  const [position, setPosition] = useState('');
  // psychologist-specific
  const [specialty, setSpecialty] = useState('');
  const [experience, setExperience] = useState('');
  const [docs, setDocs] = useState(null);

  const handleRegister = async () => {
    // When worker role, require the worker-specific fields as well
    if (selectedRole === 'worker') {
      if (!name.trim() || !lastName.trim() || !email.trim() || !password || !company.trim()) {
        Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
        return;
      }
    } else if (selectedRole === 'psychologist') {
      // psychologist requires specialty and experience
      if (!name.trim() || !lastName.trim() || !email.trim() || !password || !specialty.trim() || !experience.trim()) {
        Alert.alert('Error', 'Por favor completa todos los campos obligatorios para psicólogo');
        return;
      }
    } else if (selectedRole === 'manager') {
      if (!name.trim() || !lastName.trim() || !email.trim() || !password || !company.trim() || !position.trim()) {
        Alert.alert('Error', 'Por favor completa todos los campos obligatorios para líder o gerente');
        return;
      }
    } else {
      if (!name.trim() || !email.trim() || !password) {
        Alert.alert('Error', 'Por favor completa todos los campos');
        return;
      }
    }

    if (password !== confirm) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    try {
      // Try to register with backend API; fallback to local mock when offline
      const payload = {
        name,
        last_name: lastName,
        email,
        password,
        role: selectedRole || 'worker',
        company,
        position,
        department,
        age: age ? Number(age) : undefined,
      };

      let registeredUser = null;
      try {
        registeredUser = await registerUser(payload);
      } catch (apiErr) {
        // ignore, fallback to local mock below
        registeredUser = null;
      }

      if (registeredUser) {
        // Attempt a login to get token
        try {
          const loginResp = await loginUser({ email, password });
          if (loginResp && loginResp.access_token && loginResp.user) {
            await AsyncStorage.setItem('userToken', loginResp.access_token);
            await AsyncStorage.setItem('userEmail', loginResp.user.email);
            await AsyncStorage.setItem('userId', loginResp.user.id.toString());
            await AsyncStorage.setItem('userRole', loginResp.user.role);
            await AsyncStorage.setItem('userName', loginResp.user.name);
            navigation.replace('RegistrationComplete');
            return;
          }
        } catch (loginErr) {
          // fallback to continue
        }
      }

      // If API didn't work, fallback to local simulated persistence
      const id = Date.now();
      const token = `token-${id}`;

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userId', id.toString());
      await AsyncStorage.setItem('userRole', selectedRole || 'worker');
      await AsyncStorage.setItem('userName', name);
      // Save worker-specific info
      if (selectedRole === 'worker') {
        if (lastName) await AsyncStorage.setItem('userLastName', lastName);
        if (age) await AsyncStorage.setItem('userAge', age.toString());
        if (company) await AsyncStorage.setItem('userCompany', company);
        if (department) await AsyncStorage.setItem('userDepartment', department);
        if (tenure) await AsyncStorage.setItem('userTenure', tenure);
      }
      // Save psychologist-specific info
      if (selectedRole === 'psychologist') {
        if (specialty) await AsyncStorage.setItem('userSpecialty', specialty);
        if (experience) await AsyncStorage.setItem('userExperience', experience.toString());
        if (docs) await AsyncStorage.setItem('userDocs', docs);
      }
      // Save manager-specific info
      if (selectedRole === 'manager') {
        if (company) await AsyncStorage.setItem('userCompany', company);
        if (position) await AsyncStorage.setItem('userPosition', position);
      }

      // show the registration complete confirmation screen first
      navigation.replace('RegistrationComplete');
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la cuenta');
    }
  };

  const proceedToForm = () => {
    if (!selectedRole) return;
    setStage('form');
  };

  const goBackToRole = () => setStage('role');

  return (
    <View style={styles.container}>
      {stage === 'role' ? (
        <View>
          <Text style={styles.title}>¿Cuál es tu rol en la organización?</Text>
          <Text style={styles.helper}>Elige el rol que te represente</Text>

          <View style={styles.bigRoleContainer}>
            <TouchableOpacity
              style={[styles.bigRole, selectedRole === 'worker' && styles.bigRoleSelected]}
              onPress={() => setSelectedRole('worker')}
            >
              <WorkerIcon width={36} height={36} color={selectedRole === 'worker' ? '#0B3D91' : '#666'} />
              <Text style={styles.bigRoleText}>Trabajador</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bigRole, selectedRole === 'psychologist' && styles.bigRoleSelected]}
              onPress={() => setSelectedRole('psychologist')}
            >
              <PsychologistRoleIcon width={36} height={36} color={selectedRole === 'psychologist' ? '#0B3D91' : '#666'} />
              <Text style={styles.bigRoleText}>Psicólogo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bigRole, selectedRole === 'manager' && styles.bigRoleSelected]}
              onPress={() => setSelectedRole('manager')}
            >
              <LeaderIcon width={36} height={36} color={selectedRole === 'manager' ? '#0B3D91' : '#666'} />
              <Text style={styles.bigRoleText}>Líder o gerente</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, !selectedRole && styles.primaryButtonDisabled]}
            onPress={proceedToForm}
            disabled={!selectedRole}
          >
            <Text style={styles.primaryButtonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <View style={styles.formHeaderRow}>
            <TouchableOpacity onPress={goBackToRole} style={styles.backSmall}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Regístrate</Text>

            <View style={{ width: 40 }} />
          </View>

          {/* Role icon and label */}
          <View style={styles.roleTop}>
            <View style={styles.roleIconCircle}>
              {selectedRole === 'worker' && <WorkerIcon width={44} height={44} color="#0B3D91" />}
              {selectedRole === 'psychologist' && <PsychologistRoleIcon width={44} height={44} color="#0B3D91" />}
              {selectedRole === 'manager' && <LeaderIcon width={44} height={44} color="#0B3D91" />}
            </View>
            <Text style={styles.centerRoleLabel}>{selectedRole === 'manager' ? 'Líder o gerente' : selectedRole === 'psychologist' ? 'Psicólogo' : 'Trabajador'}</Text>
          </View>

          {/* Worker -- more fields */}
          {selectedRole === 'worker' ? (
            <>
              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Nombre</Text>
              <TextInput value={name} onChangeText={setName} placeholder="Nombre" style={styles.input} />

              <Text style={styles.inputLabel}>Apellido</Text>
              <TextInput value={lastName} onChangeText={setLastName} placeholder="Apellido" style={styles.input} />

              <Text style={styles.inputLabel}>Edad</Text>
              <TextInput value={age} onChangeText={setAge} placeholder="Edad" keyboardType="numeric" style={styles.input} />

              <Text style={styles.inputLabel}>Correo electrónico</Text>
              <TextInput value={email} onChangeText={setEmail} placeholder="Correo electrónico" keyboardType="email-address" autoCapitalize="none" style={styles.input} />

              <Text style={styles.inputLabel}>Contraseña</Text>
              <TextInput value={password} onChangeText={setPassword} placeholder="Contraseña" secureTextEntry style={styles.input} />

              <Text style={styles.inputLabel}>Confirmar contraseña</Text>
              <TextInput value={confirm} onChangeText={setConfirm} placeholder="Confirmar contraseña" secureTextEntry style={styles.input} />

              <Text style={styles.inputLabel}>Empresa</Text>
              <TextInput value={company} onChangeText={setCompany} placeholder="Empresa" style={styles.input} />

              <Text style={styles.inputLabel}>Área o departamento</Text>
              <TextInput value={department} onChangeText={setDepartment} placeholder="Área o departamento" style={styles.input} />

              <Text style={styles.inputLabel}>Tiempo en la empresa</Text>
              <TextInput value={tenure} onChangeText={setTenure} placeholder="Tiempo en la empresa" style={styles.input} />
            </>
          ) : selectedRole === 'psychologist' ? (
            <>
              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Nombre</Text>
              <TextInput value={name} onChangeText={setName} placeholder="Nombre" style={styles.input} />

              <Text style={styles.inputLabel}>Apellido</Text>
              <TextInput value={lastName} onChangeText={setLastName} placeholder="Apellido" style={styles.input} />

              <Text style={styles.inputLabel}>Correo electrónico</Text>
              <TextInput value={email} onChangeText={setEmail} placeholder="Correo electrónico" keyboardType="email-address" autoCapitalize="none" style={styles.input} />

              <Text style={styles.inputLabel}>Contraseña</Text>
              <TextInput value={password} onChangeText={setPassword} placeholder="Contraseña" secureTextEntry style={styles.input} />

              <Text style={styles.inputLabel}>Confirmar contraseña</Text>
              <TextInput value={confirm} onChangeText={setConfirm} placeholder="Confirmar contraseña" secureTextEntry style={styles.input} />

              <Text style={styles.inputLabel}>Especialidad</Text>
              <TextInput value={specialty} onChangeText={setSpecialty} placeholder="Especialidad" style={styles.input} />

              <Text style={styles.inputLabel}>Años de experiencia</Text>
              <TextInput value={experience} onChangeText={setExperience} placeholder="Años de experiencia" keyboardType="numeric" style={styles.input} />

              <Text style={[styles.inputLabel, { marginTop: 6 }]}>Documentos profesionales</Text>
              <TouchableOpacity style={styles.docsRow} onPress={() => Alert.alert('Adjuntar', 'Funcionalidad de adjuntar archivo no configurada en este ejemplo')}>
                <Text style={styles.attachText}>Adjuntar archivo</Text>
              </TouchableOpacity>
            </>
          ) : selectedRole === 'manager' ? (
            <>
              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Nombre</Text>
              <TextInput value={name} onChangeText={setName} placeholder="Nombre" style={styles.input} />

              <Text style={styles.inputLabel}>Apellido</Text>
              <TextInput value={lastName} onChangeText={setLastName} placeholder="Apellido" style={styles.input} />

              <Text style={styles.inputLabel}>Correo electrónico</Text>
              <TextInput value={email} onChangeText={setEmail} placeholder="Correo electrónico" keyboardType="email-address" autoCapitalize="none" style={styles.input} />

              <Text style={styles.inputLabel}>Contraseña</Text>
              <TextInput value={password} onChangeText={setPassword} placeholder="Contraseña" secureTextEntry style={styles.input} />

              <Text style={styles.inputLabel}>Confirmar contraseña</Text>
              <TextInput value={confirm} onChangeText={setConfirm} placeholder="Confirmar contraseña" secureTextEntry style={styles.input} />

              <Text style={styles.inputLabel}>Empresa</Text>
              <TextInput value={company} onChangeText={setCompany} placeholder="Empresa" style={styles.input} />

              <Text style={styles.inputLabel}>Posición</Text>
              <TextInput value={position} onChangeText={setPosition} placeholder="Posición" style={styles.input} />
            </>
          ) : (
            // default minimal form for other roles
            <>
              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Nombre completo</Text>
              <TextInput value={name} onChangeText={setName} placeholder="Tu nombre completo" style={styles.input} />

              <Text style={styles.inputLabel}>Correo electrónico</Text>
              <TextInput value={email} onChangeText={setEmail} placeholder="Correo electrónico" keyboardType="email-address" autoCapitalize="none" style={styles.input} />

              <Text style={styles.inputLabel}>Contraseña</Text>
              <TextInput value={password} onChangeText={setPassword} placeholder="Contraseña" secureTextEntry style={styles.input} />

              <Text style={styles.inputLabel}>Confirmar contraseña</Text>
              <TextInput value={confirm} onChangeText={setConfirm} placeholder="Confirmar contraseña" secureTextEntry style={styles.input} />
            </>
          )}

          <View style={{ marginTop: 6, marginBottom: 8, alignItems: 'center' }}>
            <Text style={{ color: '#0B3D91', fontWeight: '700' }}>
              Rol seleccionado: <Text style={{ color: '#9AAFE0', fontWeight: '700' }}>{selectedRole === 'manager' ? 'Líder o gerente' : selectedRole === 'psychologist' ? 'Psicólogo' : 'Trabajador'}</Text>
            </Text>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
            <Text style={styles.primaryButtonText}>Crear cuenta</Text>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.needAccount}>¿Ya tienes una cuenta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.registerLink}> Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF4FF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0B3D91',
    textAlign: 'center',
    marginBottom: 10,
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
  roleSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 6,
    marginBottom: 12,
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
  bigRoleContainer: {
    marginTop: 16,
  },
  bigRole: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 28,
    padding: 18,
    marginVertical: 8,
    justifyContent: 'flex-start',
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#D8EEFF',
  },
  bigRoleSelected: {
    backgroundColor: '#F9FBFF',
    borderColor: '#BFDFFF',
  },
  bigRoleText: {
    fontSize: 16,
    marginLeft: 18,
    color: '#0B3D91',
    fontWeight: '700'
  },
  docsRow: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#D8EEFF',
    alignItems: 'center',
  },
  attachText: {
    color: '#007AFF',
    fontWeight: '700',
  },
  roleTop: {
    alignItems: 'center',
    marginVertical: 8,
  },
  roleIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#D8EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    alignSelf: 'center',
  },
  centerRoleLabel: {
    marginTop: 10,
    color: '#0B3D91',
    fontWeight: '700',
  },
  helper: {
    textAlign: 'center',
    color: '#9AAFE0',
    marginTop: 6,
    fontSize: 13,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backSmall: {
    width: 40,
  },
  backText: {
    fontSize: 20,
    color: '#0B3D91'
  },
  roleLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    width: 80,
  },
  primaryButton: {
    backgroundColor: '#FFA65C',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 6,
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

export default RegisterScreen;
