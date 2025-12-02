import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAppointment } from '../api/client';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';

const AppointmentScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Simulación de datos del psicólogo asignado
  const psychologist = {
    name: "Laura Herrera",
    specialty: "Psicóloga organizacional",
    experience: "7 años de experiencia"
  };

  // Simulación de horarios disponibles (ejemplo reducido, formato amigable)
  const availableHours = [
    '10:00 am',
    '11:00 am',
    '2:00 pm',
  ];

  // Obtener la fecha actual para el calendario
  const today = new Date();
  const currentDate = today.toISOString().split('T')[0];

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset selected time when date changes
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleSchedule = () => {
    if (selectedDate && selectedTime) {
      (async () => {
        try {
          // Compose a ISO datetime from selected date + time string like '10:00 am'
          const date = selectedDate;
          // parse time
          const m = selectedTime.match(/(\d+):(\d+)\s*(am|pm)/i);
          let hour = 9, minute = 0;
          if (m) {
            hour = parseInt(m[1], 10);
            minute = parseInt(m[2], 10);
            const ampm = m[3].toLowerCase();
            if (ampm === 'pm' && hour < 12) hour += 12;
            if (ampm === 'am' && hour === 12) hour = 0;
          }

          const start = new Date(date);
          start.setHours(hour, minute, 0, 0);

          const userId = await AsyncStorage.getItem('userId');
          const payload = {
            user_id: userId ? Number(userId) : 0,
            psych_id: null,
            start_time: start.toISOString(),
            duration_minutes: 60,
            notes: ''
          };

          try {
            await createAppointment(payload);
            alert(`Cita agendada con ${psychologist.name} para el ${start.toLocaleDateString()} a las ${selectedTime}`);
          } catch (e) {
            // network error -> fallback to local confirmation
            alert(`Cita (local) agendada con ${psychologist.name} para el ${start.toLocaleDateString()} a las ${selectedTime}`);
          }
        } catch (e) {
          alert('Error al agendar cita');
        }
      })();
    } else {
      alert('Por favor selecciona fecha y hora');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Programar cita</Text>
        <View style={{ width: 40 }} />
      </View>
      {/* Información del psicólogo */}
      <View style={styles.psychologistCardAlt}>
        <View style={styles.psychAvatar} />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.psychologistName}>{psychologist.name}</Text>
          <Text style={styles.psychologistInfo}>{psychologist.specialty}</Text>
        </View>
      </View>

      {/* Calendario */}
      <View style={styles.calendarContainer}>
        <Text style={styles.sectionTitle}>Selecciona una fecha</Text>
        <Calendar
          style={styles.calendar}
          current={currentDate}
          minDate={currentDate}
          maxDate={new Date(today.getFullYear(), today.getMonth() + 2, 0).toISOString().split('T')[0]}
          onDayPress={(day) => handleDateSelect(new Date(day.timestamp))}
          markedDates={{
            [selectedDate ? selectedDate.toISOString().split('T')[0] : '']: {
              selected: true,
              selectedColor: '#007AFF',
            },
          }}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#007AFF',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#007AFF',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: '#007AFF',
            selectedDotColor: '#ffffff',
            arrowColor: '#007AFF',
            monthTextColor: '#2d4150',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14
          }}
        />
      </View>

      {/* Horarios */}
      <View style={styles.timeContainer}>
        <Text style={styles.sectionTitle}>Horarios disponibles</Text>
        <View style={styles.timeGrid}>
          {availableHours.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeButton,
                selectedTime === time && styles.selectedTime
              ]}
              onPress={() => handleTimeSelect(time)}
            >
              <Text style={[
                styles.timeText,
                selectedTime === time && styles.selectedTimeText
              ]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Botón de agendar */}
      <TouchableOpacity
        style={[
          styles.scheduleButton,
          (!selectedDate || !selectedTime) && styles.disabledButton
        ]}
        onPress={handleSchedule}
        disabled={!selectedDate || !selectedTime}
      >
        <Text style={styles.scheduleButtonText}>Confirmar</Text>
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
  psychologistCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  psychologistName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  psychologistInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 3,
  },
  calendarContainer: {
    marginBottom: 20,
  },
  calendar: {
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#007AFF',
  },
  timeContainer: {
    marginBottom: 20,
  },
  timeGrid: {
    marginTop: 8,
  },
  timeButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8EEFF',
  },
  selectedTime: {
    backgroundColor: '#007AFF',
  },
  timeText: {
    color: '#333',
    fontSize: 16,
  },
  selectedTimeText: {
    color: 'white',
  },
  scheduleButton: {
    backgroundColor: '#FFA65C',
    padding: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginVertical: 20,
    width: '100%'
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  scheduleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 18,
  },
  backButton: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 22,
    color: '#20304E',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#20304E',
  },
  psychologistCardAlt: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  psychAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F7FB',
  },
});

export default AppointmentScreen;