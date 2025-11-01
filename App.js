import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { DashboardIcon, DepartmentsIcon, ChatIcon, ProfileIcon } from './src/components/icons';

import LoginScreen from './src/screens/LoginScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import AppointmentScreen from './src/screens/AppointmentScreen';
import DashboardScreen from './src/screens/analytics/DashboardScreen';
import DepartmentAnalyticsScreen from './src/screens/analytics/DepartmentAnalyticsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  // Este valor vendría del estado de la aplicación después del login
  const userRole = 2; // Simulando que es un administrador

  return (
    <Tab.Navigator>
      {userRole === 2 ? (
        // Pestañas para administradores
        <>
          <Tab.Screen 
            name="Dashboard" 
            component={DashboardScreen} 
            options={{
              title: 'Resumen',
              tabBarIcon: ({ color, size }) => (
                <DashboardIcon width={size} height={size} color={color} />
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
      ) : (
        // Pestañas para usuarios normales
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
          name="MainTabs" 
          component={MainTabs}
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen}
          options={{ 
            title: 'Editar Perfil',
            headerStyle: {
              backgroundColor: '#f5f5f5',
            },
          }} 
        />
        <Stack.Screen 
          name="Appointment" 
          component={AppointmentScreen}
          options={{ 
            title: 'Agendar Cita',
            headerStyle: {
              backgroundColor: '#f5f5f5',
            },
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
