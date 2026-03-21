# Guía de Integración - Frontend & Backend

## 📡 Configuración de Conexión

### 1. Actualizar BASE_URL en `src/api/config.js`

```javascript
// Para desarrollo local:
export const BASE_URL = 'http://localhost:8000';

// Para Android emulador:
export const BASE_URL = 'http://10.0.2.2:8000';

// Para dispositivo físico:
export const BASE_URL = 'http://192.168.x.x:8000'; // IP de tu máquina
```

## 🔑 Autenticación

El cliente ahora maneja automáticamente JWT tokens:

```javascript
import { loginUser, registerUser, logout } from '../api/client';

// Login
const handleLogin = async (email, password) => {
  try {
    const response = await loginUser({
      email,
      password
    });
    // Token se guarda automáticamente en AsyncStorage
    // Usuario redirigido a MainTabs
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};

// Logout
const handleLogout = async () => {
  await logout();
  // Redirigir a LoginScreen
};
```

## 💬 Chat con IA (Gemini)

El chat ahora está conectado a la API de Gemini. Actualizar `ChatScreen.js`:

```javascript
import { sendChatMessage, getChatHistory } from '../api/client';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const history = await getChatHistory();
      // Mapear respuesta del API al formato local
      const formattedMessages = history.map(msg => ({
        id: msg.id,
        text: msg.content,
        sender: msg.sender === 'user' ? 'me' : 'other',
        timestamp: msg.timestamp
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSend = async () => {
    const content = newMessage.trim();
    if (content === '') return;

    // Agregar mensaje del usuario localmente
    const userMessage = {
      id: Date.now().toString(),
      text: content,
      sender: 'me'
    };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    try {
      // Enviar a backend
      const response = await sendChatMessage(content);
      
      // Agregar respuesta de IA
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        sender: 'other'
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    }
  };

  // ... resto del componente
};
```

## 📋 Encuestas (Google Forms)

### Integración en Chat

Agregar menú con opción de encuestas en `ChatScreen.js`:

```javascript
import { getSurveys, getSurveyDetails, submitSurveyResponse } from '../api/client';

const [showSurveyMenu, setShowSurveyMenu] = useState(false);
const [surveys, setSurveys] = useState([]);

const loadSurveys = async () => {
  try {
    const data = await getSurveys();
    setSurveys(data);
    setShowSurveyMenu(true);
  } catch (error) {
    Alert.alert('Error', 'No se pudieron cargar las encuestas');
  }
};

const handleSelectSurvey = async (surveyId) => {
  try {
    const survey = await getSurveyDetails(surveyId);
    // Navegar a pantalla de encuesta o abrir URL
    if (survey.google_form_url) {
      // Opción 1: Abrir en navegador (necesita react-native-web-browser)
      Linking.openURL(survey.google_form_url);
      
      // Opción 2: O esperar respuesta del usuario
      // Mostrar formulario personalizado
    }
  } catch (error) {
    Alert.alert('Error', 'No se pudo cargar la encuesta');
  }
};

// En el header del chat, agregar:
const renderHeader = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Chat IA</Text>
    <TouchableOpacity onPress={() => setShowSurveyMenu(!showSurveyMenu)}>
      <Text style={styles.menuButton}>⋮</Text>
    </TouchableOpacity>
  </View>
);

// Menú de opciones
{showSurveyMenu && (
  <View style={styles.surveyMenu}>
    <TouchableOpacity onPress={() => {
      setShowSurveyMenu(false);
      loadSurveys();
    }}>
      <Text style={styles.menuItem}>📋 Encuestas</Text>
    </TouchableOpacity>
  </View>
)}

// Lista de encuestas
{showSurveyMenu && surveys.length > 0 && (
  <FlatList
    data={surveys}
    renderItem={({ item }) => (
      <TouchableOpacity 
        style={styles.surveyItem}
        onPress={() => handleSelectSurvey(item.id)}
      >
        <Text style={styles.surveyTitle}>{item.title}</Text>
        <Text style={styles.surveyDesc}>{item.description}</Text>
      </TouchableOpacity>
    )}
    keyExtractor={item => item.id.toString()}
  />
)}
```

### Pantalla Separada para Encuestas (Opcional)

Crear nuevo archivo `src/screens/SurveysScreen.js`:

```javascript
import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, Linking } from 'react-native';
import { getSurveys, getSurveyDetails } from '../api/client';

const SurveysScreen = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      const data = await getSurveys();
      setSurveys(data);
    } catch (error) {
      console.error('Error loading surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeSurvey = async (surveyId) => {
    try {
      const survey = await getSurveyDetails(surveyId);
      // Abrir formulario en navegador
      Linking.openURL(survey.google_form_url);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la encuesta');
    }
  };

  const renderSurvau = ({ item }) => (
    <TouchableOpacity style={styles.surveyCard} onPress={() => handleTakeSurvey(item.id)}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.description}</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Responder →</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Encuestas</Text>
      <FlatList
        data={surveys}
        renderItem={renderSurvau}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

export default SurveysScreen;
```

## 📊 Dashboard para Managers

Actualizar `DashboardScreen.js`:

```javascript
import { getDashboardOverview, getDepartmentAnalytics } from '../api/client';

useEffect(() => {
  loadDashboard();
}, []);

const loadDashboard = async () => {
  try {
    const overview = await getDashboardOverview();
    const analytics = await getDepartmentAnalytics();
    
    setDashboard({
      completed: overview.completed_appointments,
      pending: overview.pending_appointments,
      byDepartment: analytics
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
};
```

## 👥 Gestión de Pacientes

```javascript
import { 
  getPatients, 
  getPatientDetails, 
  createPatient,
  updatePatient 
} from '../api/client';

// Listar pacientes
const [patients, setPatients] = useState([]);

useEffect(() => {
  loadPatients();
}, []);

const loadPatients = async () => {
  try {
    const data = await getPatients();
    setPatients(data);
  } catch (error) {
    console.error('Error loading patients:', error);
  }
};

// Crear paciente
const handleCreatePatient = async (patientData) => {
  try {
    const newPatient = await createPatient(patientData);
    setPatients([...patients, newPatient]);
  } catch (error) {
    Alert.alert('Error', 'No se pudo crear el paciente');
  }
};
```

## 🛠️ Manejo de Errores

Todos los endpoints pueden fallar. Usar try/catch:

```javascript
try {
  const result = await apiFunction();
  // Procesar resultado
} catch (error) {
  console.error('Error:', error);
  
  // Verificar si es error de autenticación
  if (error.message.includes('401') || error.message.includes('token')) {
    // Redirigir a login
    await logout();
    navigation.replace('Login');
  } else {
    // Mostrar error genérico
    Alert.alert('Error', error.message);
  }
}
```

## 🔐 Configuración de Desarrollo

### Agregar logging para debugging

```javascript
// En startup del app
import { healthCheck } from './api/client';

useEffect(() => {
  const checkBackend = async () => {
    const health = await healthCheck();
    console.log('Backend health:', health);
  };
  
  checkBackend();
}, []);
```

## 📝 Notas Importantes

1. **API Gateway URL**: Usar siempre `BASE_URL` del config
2. **Tokens**: Se guardan automáticamente, no necesita manejo manual
3. **Encuestas**: Se abren en navegador del dispositivo
4. **Chat**: Historial se sincroniza automáticamente
5. **Error 401**: Significa token expirado, redirigir a login

## 🔗 URLs para Testing

- Dashboard: http://localhost:8000/docs
- Swagger UI: http://localhost:PORT/docs
- Health Check: http://localhost:8000/health
