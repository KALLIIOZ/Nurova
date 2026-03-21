import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';

const PatientRecord = ({ route }) => {
  const { patientId, patientName } = route.params || {};
  const [record, setRecord] = useState(null);

  useEffect(() => {
    // Aquí cargarías la info real desde la API usando patientId
    // Por ahora simulamos datos que la API debería devolver
    const mockRecord = {
      id: patientId || '1',
      name: patientName || 'Nombre del trabajador',
      mood_state: 'Estable', // Estable | Inestable | Muy inestable
      applied_tools: [
        'Técnica de relajación',
        'Diario Cognitivo',
        'Escala de ánimo breve'
      ],
      clinical_notes: 'Paciente presenta mejoría en la regulación emocional. Seguir trabajando exposición gradual y reestructuración cognitiva.'
    };

    setRecord(mockRecord);
  }, [patientId]);

  if (!record) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{record.name}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Estado de ánimo</Text>
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{record.mood_state}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Herramientas aplicadas</Text>
        {record.applied_tools.map((t, i) => (
          <View key={i} style={styles.toolItem}>
            <Text style={styles.toolText}>• {t}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notas clínicas</Text>
        <Text style={styles.notesText}>{record.clinical_notes}</Text>
      </View>

      {/* Ejemplo de lo que la API debería devolver (comentario) */}
      {/*
        API patient record response example:
        {
          "id": "1",
          "name": "María Pérez",
          "mood_state": "Estable", // Estable | Inestable | Muy inestable
          "applied_tools": ["Técnica de relajación", "Diario Cognitivo", "Escala de ánimo breve"],
          "clinical_notes": "Texto de notas clínicas..."
        }
      */}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF4FF',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF',
  },
  stateBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  stateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  toolItem: {
    paddingVertical: 6,
  },
  toolText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  notesText: {
    color: '#333',
    fontSize: 14,
  }
});

export default PatientRecord;
