import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ManagerHome = ({ navigation }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadName = async () => {
      try {
        const stored = await AsyncStorage.getItem('userName');
        const last = await AsyncStorage.getItem('userLastName');
        if (!mounted) return;
        if (stored || last) setName([stored, last].filter(Boolean).join(' '));
      } catch (e) {
        console.warn('Error reading userName', e);
      }
    };
    loadName();
    return () => { mounted = false; };
  }, []);

  const openAnalytics = () => navigation.navigate('Dashboard');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{padding: 20}}>
      <Text style={styles.greeting}>Hola, {name || 'Jorge'}</Text>

      <View style={styles.indexCard}>
        <View style={{flex:1}}>
          <Text style={styles.indexLabel}>Índice de bienestar global</Text>
          <Text style={styles.indexValue}>76</Text>
          <Text style={styles.indexSub}>Riesgos psicológicos: <Text style={styles.highlight}>14%</Text></Text>
        </View>
        <TouchableOpacity style={styles.metricsButton} onPress={openAnalytics}>
          <Text style={styles.metricsButtonText}>Ver métricas</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.alertsCard}>
        <Text style={styles.cardTitle}>Alertas</Text>
        <View style={styles.alertRow}>
          <View style={{flex:1}}>
            <Text style={styles.alertDept}>Ventas — Alto riesgo</Text>
            <Text style={styles.alertTime}>Última actualización: 2 días</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Departments')}>
            <Text style={styles.seeMore}>Ver</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.miniDashboard}>
        <Text style={styles.cardTitle}>Resumen por departamento</Text>

        <View style={styles.miniRow}>
          <View style={styles.miniCol}>
            <Text style={styles.miniLabel}>Ventas</Text>
            <View style={styles.barBackground}><View style={[styles.barFill,{width: '75%'}]}/></View>
            <Text style={styles.miniValue}>76</Text>
          </View>

          <View style={styles.miniCol}>
            <Text style={styles.miniLabel}>Soporte</Text>
            <View style={styles.barBackground}><View style={[styles.barFill,{width: '58%'}]}/></View>
            <Text style={styles.miniValue}>58</Text>
          </View>
        </View>

        <View style={styles.miniRow}>
          <View style={styles.miniCol}>
            <Text style={styles.miniLabel}>Operaciones</Text>
            <View style={styles.barBackground}><View style={[styles.barFill,{width: '90%'}]}/></View>
            <Text style={styles.miniValue}>90</Text>
          </View>

          <View style={styles.miniCol}>
            <Text style={styles.miniLabel}>Marketing</Text>
            <View style={styles.barBackground}><View style={[styles.barFill,{width: '45%'}]}/></View>
            <Text style={styles.miniValue}>45</Text>
          </View>
        </View>

      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#EAF4FF', flex: 1 },
  greeting: { fontSize: 28, fontWeight: '700', color: '#003C67', marginBottom: 18 },
  indexCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 20,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  indexLabel: { color: '#007AFF', fontSize: 14, marginBottom: 6, fontWeight: '700' },
  indexValue: { fontSize: 54, fontWeight: '800', color: '#003C67' },
  indexSub: { color: '#666', marginTop: 6 },
  highlight: { color: '#FFA65C', fontWeight: '700' },
  metricsButton: {
    backgroundColor: '#6F5FB3',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginLeft: 12,
  },
  metricsButtonText: { color: 'white', fontWeight: '700' },

  alertsCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#007AFF', marginBottom: 8 },
  alertRow: { flexDirection: 'row', alignItems: 'center' },
  alertDept: { fontSize: 15, fontWeight: '700', color: '#111' },
  alertTime: { color: '#666', marginTop: 4 },
  seeMore: { color: '#6F5FB3', fontWeight: '700' },

  miniDashboard: { backgroundColor: 'white', borderRadius: 10, padding: 14, marginBottom: 28 },
  miniRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  miniCol: { width: (Dimensions.get('window').width - 80) / 2 },
  miniLabel: { color: '#007AFF', fontWeight: '700', marginBottom: 6 },
  barBackground: { height: 12, backgroundColor: '#F0F6FB', borderRadius: 8, overflow: 'hidden' },
  barFill: { height: 12, backgroundColor: '#FFA65C' },
  miniValue: { marginTop: 8, fontSize: 14, color: '#333', fontWeight: '700' },
});

export default ManagerHome;
