import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MoodButton = ({ emoji, label }) => (
  <View style={styles.moodItem}>
    <Text style={styles.moodEmoji}>{emoji}</Text>
  </View>
);

const HomeCard = ({ title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

const WorkerHome = ({ navigation }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    const load = async () => {
      const n = await AsyncStorage.getItem('userName');
      setName(n || 'Usuario');
    };
    load();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {name}</Text>
        <Text style={styles.subtitle}>¿Cómo te sientes hoy?</Text>

        <View style={styles.moodRow}>
          <MoodButton emoji="🙂" />
          <MoodButton emoji="😊" />
          <MoodButton emoji="😐" />
          <MoodButton emoji="🙁" />
          <MoodButton emoji="😢" />
        </View>
      </View>

      <View style={styles.chatBox}>
        <Text style={styles.chatLabel}>Chat profesional</Text>
        <TextInput style={styles.chatInput} placeholder="¿Estás pasando por alguna situación?" />
        <TouchableOpacity style={styles.chatButton} onPress={() => navigation.navigate('Chat')}>
          <Text style={styles.chatButtonText}>Iniciar conversación</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <HomeCard title="Bienestar diario" subtitle="Rutinas, meditaciones" onPress={() => alert('Bienestar diario (simulado)')} />
        <HomeCard title="Progreso personal" subtitle="Gráficos de evolución" onPress={() => alert('Progreso personal (simulado)')} />
        <HomeCard title="Hablar con un especialista" subtitle="Contacta a un profesional" onPress={() => navigation.navigate('Appointment')} />
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF4FF',
    padding: 18,
  },
  header: {
    marginTop: 12,
  },
  greeting: {
    fontSize: 20,
    color: '#0B3D91',
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    color: '#5A709A',
    fontSize: 14,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  moodItem: {
    width: 42,
    height: 42,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8EEFF',
  },
  moodEmoji: {
    fontSize: 18,
  },
  chatBox: {
    marginTop: 18,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
  },
  chatLabel: {
    color: '#0B3D91',
    fontWeight: '700',
    marginBottom: 8,
  },
  chatInput: {
    backgroundColor: '#F1FBFF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8EEFF',
    marginBottom: 10,
  },
  chatButton: {
    backgroundColor: '#6F5FB3',
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: 'center',
  },
  chatButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  quickActions: {
    marginTop: 18,
    gap: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#0B3D91',
    fontWeight: '700',
    marginBottom: 6,
    fontSize: 16,
  },
  cardSubtitle: {
    color: '#6C7DA6',
    fontSize: 13,
  },
});

export default WorkerHome;
