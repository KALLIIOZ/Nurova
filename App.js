import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { DashboardIcon, DepartmentsIcon, ChatIcon, ProfileIcon } from './src/components/icons';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PsychologistHome from './src/screens/PsychologistHome';
import WorkerHome from './src/screens/WorkerHome';
import PatientsList from './src/screens/PatientsList';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import RegistrationCompleteScreen from './src/screens/RegistrationCompleteScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import AppointmentScreen from './src/screens/AppointmentScreen';
import DashboardScreen from './src/screens/analytics/DashboardScreen';
import ManagerHome from './src/screens/analytics/ManagerHome';
import DepartmentAnalyticsScreen from './src/screens/analytics/DepartmentAnalyticsScreen';
import PatientRecord from './src/screens/PatientRecord';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  // Leemos el rol guardado en AsyncStorage para mostrar tabs condicionales
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadRole = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        if (mounted) setUserRole(role);
      } catch (e) {
        console.warn('No se pudo leer userRole', e);
      }
    };
    loadRole();
    return () => { mounted = false; };
  }, []);

  return (
    <Tab.Navigator>
      {userRole === 'manager' || userRole === 'admin' ? (
        // Pestañas para administradores
        <>
          <Tab.Screen
            name="ManagerHome"
            component={ManagerHome}
            options={{
              title: 'Inicio',
              tabBarIcon: ({ color, size }) => (
                <DashboardIcon width={size} height={size} color={color} />
              )
            }}
          />
          <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              title: 'Resumen',
              tabBarIcon: ({ color, size }) => (
                <DepartmentsIcon width={size} height={size} color={color} />
              )
            }}
          />
          <Tab.Screen
            name="Departments"
            component={DepartmentAnalyticsScreen}
            options={{
              title: 'Departamentos',
              tabBarIcon: ({ color, size }) => (
                <DepartmentsIcon width={size} height={size} color={color} />
              )
            }}
          />
        </>
      ) : userRole === 'psychologist' ? (
        // Pestañas para psicólogos
        <>
          <Tab.Screen
            name="PsychHome"
            component={PsychologistHome}
            options={{
              title: 'Inicio',
              tabBarIcon: ({ color, size }) => (
                <ProfileIcon width={size} height={size} color={color} />
              )
            }}
          />
          <Tab.Screen
            name="Patients"
            component={PatientsList}
            options={{
              title: 'Pacientes',
              tabBarIcon: ({ color, size }) => (
                <DepartmentsIcon width={size} height={size} color={color} />
              )
            }}
          />
          {/* Psychologists don't have an 'Appointments' tab */}
        </>
      ) : (
        // Pestañas para usuarios normales (trabajador)
        <>
          <Tab.Screen
            name="Home"
            component={WorkerHome}
            options={{
              title: 'Inicio',
              tabBarIcon: ({ color, size }) => (
                <ProfileIcon width={size} height={size} color={color} />
              )
            }}
          />
          <Tab.Screen 
            name="Chat" 
            component={ChatScreen} 
            options={{
              title: 'Chat',
              tabBarIcon: ({ color, size }) => (
                <ChatIcon width={size} height={size} color={color} />
              )
            }}
          />
        </>
      )}
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <ProfileIcon width={size} height={size} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs}
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="RegistrationComplete"
          component={RegistrationCompleteScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen}
          options={{ 
            title: 'Editar Perfil',
            headerStyle: {
              backgroundColor: '#EAF4FF',
            },
          }} 
        />
        <Stack.Screen 
          name="Appointment" 
          component={AppointmentScreen}
          options={{ 
            title: 'Agendar Cita',
            headerStyle: {
              backgroundColor: '#EAF4FF',
            },
          }} 
        />
        <Stack.Screen
          name="PatientRecord"
          component={PatientRecord}
          options={{ title: 'Expediente' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
