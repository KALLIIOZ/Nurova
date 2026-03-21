import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';

// Mostramos historial de sesiones (cada item es una sesión)
const sampleSessions = [
  {
    id: 's1',
    patientId: '1',
    patientName: 'María Pérez',
    sessionDate: '2025-11-30T10:30:00Z',
    status: 'completado',
  },
  {
    id: 's2',
    patientId: '2',
    patientName: 'Juan López',
    sessionDate: '2025-12-01T09:00:00Z',
    status: 'pendiente',
  },
  {
    id: 's3',
    patientId: '3',
    patientName: 'Ana Martínez',
    sessionDate: '2025-11-22T14:00:00Z',
    status: 'completado',
  },
];

const PatientsList = ({ navigation }) => {
  const renderItem = ({ item }) => {
    const date = new Date(item.sessionDate);
    const formattedDate = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const formattedTime = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={styles.sessionCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.sessionDate}>{formattedDate}</Text>
          <View style={[styles.statusBadge, item.status === 'completado' ? styles.statusDone : styles.statusPending]}>
            <Text style={styles.statusText}>{item.status === 'completado' ? 'Completada' : 'Pendiente'}</Text>
          </View>
        </View>

        <Text style={styles.patientName}>{item.patientName}</Text>

        <View style={styles.linkRow}>
          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={() => alert('Ver transcripción (simulado)')}>
              <Text style={styles.linkText}>Ver transcripción</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => alert('Ver minuta (simulado)')}>
              <Text style={styles.linkText}>Ver minuta</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.openButton} onPress={() => navigation.navigate('PatientRecord', { patientId: item.patientId, patientName: item.patientName })}>
            <Text style={styles.openButtonText}>Expediente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de sesiones</Text>
      <FlatList
        data={sampleSessions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#EAF4FF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF',
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  sessionDate: {
    color: '#999',
    fontSize: 12,
    marginBottom: 6,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B3D91',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusDone: {
    backgroundColor: '#F2F5F7',
    borderColor: '#d8d8d8'
  },
  statusPending: {
    backgroundColor: '#FFF7E6',
    borderColor: '#ffd7a6'
  },
  statusText: {
    fontSize: 12,
    color: '#333',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  linksContainer: {
    flexDirection: 'row'
  },
  linkText: {
    color: '#007AFF',
    marginRight: 14,
    fontSize: 14,
    textDecorationLine: 'underline'
  },
  openButton: {
    backgroundColor: '#FFA65C',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  openButtonText: {
    color: '#fff',
    fontWeight: '700'
  },
  row: {},
  name: {},
  info: {}
});

export default PatientsList;