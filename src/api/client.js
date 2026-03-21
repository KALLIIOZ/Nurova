import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './config';

/**
 * API Client - Comunica con FastAPI Backend (API Gateway)
 * Base URL: API Gateway en puerto 8000
 * 
 * Flujo de datos:
 * Frontend → API Gateway (8000) → Servicios (8001, 8002, 8003, Redis)
 */

// ============ HELPER FUNCTIONS ============

async function getAuthToken() {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

async function safeFetch(url, opts = {}) {
  try {
    // Incluir token en headers si existe
    const token = await getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...opts.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await fetch(url, {
      ...opts,
      headers,
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || `HTTP ${res.status}`);
    }
    
    return await res.json();
  } catch (err) {
    throw err;
  }
}

// ============ AUTHENTICATION ============

export async function registerUser(payload) {
  const url = `${BASE_URL}/auth/register`;
  return await safeFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload) {
  const url = `${BASE_URL}/auth/login`;
  const data = await safeFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  
  // Guardar token y datos del usuario
  if (data.access_token && data.user) {
    await AsyncStorage.setItem('userToken', data.access_token);
    await AsyncStorage.setItem('userEmail', data.user.email);
    await AsyncStorage.setItem('userId', data.user.id.toString());
    await AsyncStorage.setItem('userRole', data.user.role);
    await AsyncStorage.setItem('userName', data.user.name);
    if (data.user.last_name) {
      await AsyncStorage.setItem('userLastName', data.user.last_name);
    }
  }
  
  return data;
}

export async function logout() {
  try {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userEmail');
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('userRole');
    await AsyncStorage.removeItem('userName');
    await AsyncStorage.removeItem('userLastName');
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// ============ PATIENTS ============

export async function getPatients(skip = 0, limit = 100) {
  const url = `${BASE_URL}/patients?skip=${skip}&limit=${limit}`;
  return await safeFetch(url);
}

export async function getPatientDetails(patientId) {
  const url = `${BASE_URL}/patients/${patientId}`;
  return await safeFetch(url);
}

export async function createPatient(payload) {
  const url = `${BASE_URL}/patients`;
  return await safeFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePatient(patientId, payload) {
  const url = `${BASE_URL}/patients/${patientId}`;
  return await safeFetch(url, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// ============ APPOINTMENTS ============

export async function createAppointment(payload) {
  const url = `${BASE_URL}/appointments`;
  return await safeFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listAppointments(patientId = null, skip = 0, limit = 100) {
  let url = `${BASE_URL}/appointments?skip=${skip}&limit=${limit}`;
  if (patientId) {
    url += `&patient_id=${patientId}`;
  }
  return await safeFetch(url);
}

export async function getAppointmentDetails(appointmentId) {
  const url = `${BASE_URL}/appointments/${appointmentId}`;
  return await safeFetch(url);
}

export async function getMetrics() {
  const url = `${BASE_URL}/dashboard`;
  return await safeFetch(url);
}

// ============ CHAT (Gemini AI) ============

export async function sendChatMessage(message) {
  const url = `${BASE_URL}/chat/message?message=${encodeURIComponent(message)}`;
  return await safeFetch(url, {
    method: 'POST',
  });
}

export async function getChatHistory(skip = 0, limit = 50) {
  const url = `${BASE_URL}/chat/history?skip=${skip}&limit=${limit}`;
  return await safeFetch(url);
}

export async function clearChatHistory() {
  const url = `${BASE_URL}/chat/history`;
  return await safeFetch(url, {
    method: 'DELETE',
  });
}

// ============ SURVEYS (Google Forms) ============

export async function getSurveys(skip = 0, limit = 100) {
  const url = `${BASE_URL}/surveys?skip=${skip}&limit=${limit}`;
  return await safeFetch(url);
}

export async function getSurveyDetails(surveyId) {
  const url = `${BASE_URL}/surveys/${surveyId}`;
  return await safeFetch(url);
}

export async function createSurvey(payload) {
  const url = `${BASE_URL}/surveys`;
  return await safeFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitSurveyResponse(surveyId, responseData) {
  const url = `${BASE_URL}/surveys/${surveyId}/responses`;
  return await safeFetch(url, {
    method: 'POST',
    body: JSON.stringify(responseData),
  });
}

export async function getSurveyResponses(surveyId) {
  const url = `${BASE_URL}/surveys/${surveyId}/responses`;
  return await safeFetch(url);
}

// ============ ANALYTICS ============

export async function getDashboardOverview() {
  const url = `${BASE_URL}/dashboard`;
  return await safeFetch(url);
}

export async function getDepartmentAnalytics() {
  const url = `${BASE_URL}/analytics/departments`;
  return await safeFetch(url);
}

export async function generateAnalytics() {
  const url = `${BASE_URL}/analytics/generate`;
  return await safeFetch(url, {
    method: 'POST',
  });
}

// ============ MEDICAL RECORDS ============

export async function getPatientMedicalRecords(patientId) {
  const url = `${BASE_URL}/patients/${patientId}/medical-records`;
  return await safeFetch(url);
}

export async function createMedicalRecord(payload) {
  const url = `${BASE_URL}/medical-records`;
  return await safeFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ============ HEALTH CHECK ============

export async function healthCheck() {
  try {
    const url = `${BASE_URL}/health`;
    const data = await fetch(url).then(r => r.json());
    return data;
  } catch (error) {
    console.error('Health check failed:', error);
    return null;
  }
}
