import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

const RegistrationCompleteScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.checkCircle}>
        <Text style={styles.checkMark}>✓</Text>
      </View>

      <Text style={styles.title}>Tu cuenta ha sido registrada</Text>
      <Text style={styles.subtitle}>Estamos validando tu identidad con la organización. Este proceso puede tardar entre 30 min a 24 horas.</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.replace('MainTabs')}>
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E7FAEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  checkMark: {
    color: '#0BBF67',
    fontSize: 36,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B3D91',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6C7DA6',
    textAlign: 'center',
    marginBottom: 28,
  },
  button: {
    backgroundColor: '#FFA65C',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default RegistrationCompleteScreen;
