import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PsychologistHome = ({ navigation }) => {
  const [doctorName, setDoctorName] = useState('Dr. Psicólogo');
  const [nextAppointment, setNextAppointment] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const name = await AsyncStorage.getItem('userName');
        const email = await AsyncStorage.getItem('userEmail');
        if (name) setDoctorName(`Dr. ${name}`);
        else if (email) setDoctorName(`Dr. ${email.split('@')[0]}`);

        // Simulación: cargar próxima cita (en una app real vendría de la API)
        // Valores de ejemplo
        const mockNext = {
          patientName: 'María Pérez',
          datetime: new Date(Date.now() + 1000 * 60 * 60 * 24) // mañana
        };
        setNextAppointment(mockNext);
      } catch (error) {
        console.error('Error loading user', error);
      }
    };
    loadUser();
  }, []);

  const formatPreviewDate = (dateObj) => {
    if (!dateObj) return '';
    const today = new Date();
    const isToday = dateObj.toDateString() === today.toDateString();
    if (isToday) return 'Hoy';
    return dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatPreviewTime = (dateObj) => {
    if (!dateObj) return '';
    return dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{doctorName}</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Patients')}
        >
          <Text style={styles.buttonTitle}>Lista de pacientes</Text>
        </TouchableOpacity>

        <View
          style={styles.appointmentPreview}
        >
          <Text style={styles.previewTitle}>Próxima cita</Text>
          {nextAppointment ? (
            <View>
              <Text style={styles.previewDate}>{formatPreviewDate(nextAppointment.datetime)}</Text>
              <Text style={styles.previewTime}>{formatPreviewTime(nextAppointment.datetime)}</Text>
              <Text style={styles.previewPatient}>{nextAppointment.patientName}</Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>No hay citas próximas</Text>
          )}
        </View>

        {/* Removed 'Ver agenda' for psychologists - they don't have the appointments section */}
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
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#007AFF',
  },
  buttonsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 14,
  },
  buttonTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appointmentPreview: {
    width: '100%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    alignItems: 'flex-start',
    marginBottom: 14,
    elevation: 2,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#007AFF',
  },
  previewDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 5,
  },
  previewTime: {
    fontSize: 16,
    color: '#666',
    marginBottom: 6,
  },
  previewPatient: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 4,
  },
  emptyText: {
    color: '#999',
  }
});

export default PsychologistHome;
