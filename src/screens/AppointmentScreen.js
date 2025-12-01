import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';

const AppointmentScreen = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Simulación de datos del psicólogo asignado
  const psychologist = {
    name: "Dra. María González",
    specialty: "Psicóloga Clínica",
    experience: "10 años de experiencia"
  };

  // Simulación de horarios disponibles
  const availableHours = [
    "09:00", "10:00", "11:00",
    "16:00", "17:00", "18:00"
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
      const formattedDate = selectedDate.toLocaleDateString();
      alert(`Cita agendada con ${psychologist.name} para el ${formattedDate} a las ${selectedTime}`);
    } else {
      alert('Por favor selecciona fecha y hora');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Información del psicólogo */}
      <View style={styles.psychologistCard}>
        <Text style={styles.psychologistName}>{psychologist.name}</Text>
        <Text style={styles.psychologistInfo}>{psychologist.specialty}</Text>
        <Text style={styles.psychologistInfo}>{psychologist.experience}</Text>
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
        <Text style={styles.scheduleButtonText}>Agendar Cita</Text>
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
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
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  scheduleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AppointmentScreen;