import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import api from '../services/api';

const SurveyScreen = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [responses, setResponses] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Cargar encuestas al montar el componente
  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await api.get('/surveys');
      setSurveys(response.data);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      Alert.alert('Error', 'No se pudieron cargar las encuestas');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSurvey = async (survey) => {
    try {
      setSelectedSurvey(survey);
      setResponses({});
      
      // Intentar obtener detalles de la encuesta
      try {
        const response = await api.get(`/surveys/${survey.id}`);
        setSelectedSurvey(response.data);
      } catch (err) {
        // Si no hay detalles, usar la encuesta base
        setSelectedSurvey(survey);
      }
      
      setShowModal(true);
    } catch (error) {
      console.error('Error selecting survey:', error);
      Alert.alert('Error', 'No se pudieron cargar los detalles de la encuesta');
    }
  };

  const handleResponseChange = (fieldId, value) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmitResponse = async () => {
    if (!selectedSurvey) return;

    try {
      setSubmitting(true);
      
      const payload = {
        survey_id: selectedSurvey.id,
        responses: responses
      };

      await api.post(`/surveys/${selectedSurvey.id}/responses`, payload);
      
      Alert.alert('Éxito', 'Encuesta completada');
      setShowModal(false);
      setSelectedSurvey(null);
      setResponses({});
      
      // Recargar encuestas
      fetchSurveys();
    } catch (error) {
      console.error('Error submitting survey:', error);
      Alert.alert('Error', 'No se pudo enviar la encuesta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSurvey(null);
    setResponses({});
  };

  const renderSurveyItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.surveyCard}
      onPress={() => handleSelectSurvey(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.surveyTitle}>{item.title || 'Encuesta sin título'}</Text>
      </View>
      <Text style={styles.surveyDescription}>
        {item.description || 'Sin descripción'}
      </Text>
      {item.created_at && (
        <Text style={styles.surveyDate}>
          Creada: {new Date(item.created_at).toLocaleDateString('es-ES')}
        </Text>
      )}
      <View style={styles.responseInfo}>
        <Text style={styles.responseText}>
          Respuestas: {item.response_count || 0}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSurveyForm = () => {
    if (!selectedSurvey) return null;

    // Si la encuesta tiene un URL de Google Forms, mostrar nota
    if (selectedSurvey.form_url) {
      return (
        <ScrollView style={styles.formContainer}>
          <Text style={styles.formTitle}>{selectedSurvey.title}</Text>
          {selectedSurvey.description && (
            <Text style={styles.formDescription}>{selectedSurvey.description}</Text>
          )}
          
          <View style={styles.noteContainer}>
            <Text style={styles.noteTitle}>📝 Formulario disponible</Text>
            <Text style={styles.noteText}>
              Esta encuesta está disponible en Google Forms. Por favor, completa el formulario en tu navegador.
            </Text>
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => {
                // En una app real, usarías Linking.openURL(selectedSurvey.form_url)
                Alert.alert('Google Forms', 'Link: ' + selectedSurvey.form_url);
              }}
            >
              <Text style={styles.linkButtonText}>Abrir Formulario</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.confirmContainer}>
            <Text style={styles.confirmText}>
              Marca aquí cuando hayas completado el formulario:
            </Text>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => handleResponseChange('completed', !responses.completed)}
              >
                <Text style={styles.checkboxText}>
                  {responses.completed ? '✓' : ''}
                </Text>
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>
                He completado la encuesta
              </Text>
            </View>
          </View>
        </ScrollView>
      );
    }

    // Formulario simple con campos de texto
    return (
      <ScrollView style={styles.formContainer}>
        <Text style={styles.formTitle}>{selectedSurvey.title}</Text>
        {selectedSurvey.description && (
          <Text style={styles.formDescription}>{selectedSurvey.description}</Text>
        )}

        <View style={styles.fieldsContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Respuesta 1"
            placeholderTextColor="#999"
            value={responses.field1 || ''}
            onChangeText={(text) => handleResponseChange('field1', text)}
            multiline
          />
          <TextInput
            style={styles.textInput}
            placeholder="Respuesta 2"
            placeholderTextColor="#999"
            value={responses.field2 || ''}
            onChangeText={(text) => handleResponseChange('field2', text)}
            multiline
          />
          <TextInput
            style={styles.textInput}
            placeholder="Observaciones adicionales"
            placeholderTextColor="#999"
            value={responses.comments || ''}
            onChangeText={(text) => handleResponseChange('comments', text)}
            multiline
          />
        </View>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando encuestas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Encuestas</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchSurveys}
        >
          <Text style={styles.refreshText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {surveys.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay encuestas disponibles</Text>
        </View>
      ) : (
        <FlatList
          data={surveys}
          renderItem={renderSurveyItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Modal para completar encuesta */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={handleCloseModal}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕ Cerrar</Text>
            </TouchableOpacity>
          </View>

          {renderSurveyForm()}

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmitResponse}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Enviar Respuesta</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCloseModal}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    fontSize: 20,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 20,
  },
  surveyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 8,
  },
  surveyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  surveyDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  surveyDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  responseInfo: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  responseText: {
    fontSize: 12,
    color: '#0066cc',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    alignSelf: 'flex-start',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  formDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  fieldsContainer: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 60,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  noteContainer: {
    backgroundColor: '#e7f3ff',
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066cc',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    marginBottom: 12,
  },
  linkButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  confirmContainer: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
  },
  confirmText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ffc107',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: responses.completed ? '#ffc107' : '#fff',
  },
  checkboxText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SurveyScreen;
