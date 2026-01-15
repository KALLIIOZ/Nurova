import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { DepartmentsIcon, CalendarIcon } from '../components/icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PsychologistHome = ({ navigation }) => {
  const [userName, setUserName] = useState('Psicólogo');
  const [nextAppointment, setNextAppointment] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const name = await AsyncStorage.getItem('userName');
        const email = await AsyncStorage.getItem('userEmail');
        if (name) setUserName(name);
        else if (email) setUserName(email.split('@')[0]);

        // ejemplo de próxima cita (simulado)
        const mockNext = {
          patientId: '1',
          patientName: 'María Pérez',
          datetime: new Date(), // hoy
        };
        setNextAppointment(mockNext);
      } catch (error) {
        console.error('Error loading user', error);
      }
    };

    loadUser();
  }, []);

  const formatGreetingName = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.split(' ');
    const last = parts.length > 1 ? parts[parts.length - 1] : parts[0];
    const honorific = last.toLowerCase().endsWith('a') ? 'Dra.' : 'Dr.'; // heuristic
    return `${honorific} ${last}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hola, {formatGreetingName(userName)}</Text>
      <Text style={styles.subtitle}>Gestión de pacientes y consultas</Text>

      <View style={styles.homeCards}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Patients')}>
          <View style={styles.cardIcon}><DepartmentsIcon width={28} height={28} color={'#0B3D91'} /></View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Mis pacientes</Text>
            <Text style={styles.cardSubtitle}>Lista y detalles</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => {
            if (nextAppointment) navigation.navigate('PatientRecord', { patientId: nextAppointment.patientId, patientName: nextAppointment.patientName });
          }}
        >
          <View style={styles.cardIcon}><CalendarIcon width={28} height={28} color={'#0B3D91'} /></View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Hoy</Text>
            {nextAppointment ? (
              <Text style={styles.cardSubtitle}>Próxima consulta {new Date(nextAppointment.datetime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</Text>
            ) : (
              <Text style={styles.cardSubtitle}>No hay consultas hoy</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#EAF4FF',
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
    color: '#0B3D91',
  },
  subtitle: {
    color: '#254061',
    marginBottom: 18,
    fontSize: 14,
  },
  homeCards: {
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DCEFFC',
    elevation: 2,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#DCEFFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    backgroundColor: '#fff'
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B3D91'
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#5E6B7C',
    marginTop: 6,
  }
});

export default PsychologistHome;
