import React from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';

const DashboardScreen = () => {
  // Esta sería la estructura del JSON que esperarías de la API para esta vista
  const mockData = {
    // Datos para la gráfica de barras de semáforo
    trafficLightData: {
      labels: ['Verde', 'Amarillo', 'Rojo'],
      datasets: [{
        data: [65, 25, 10] // Porcentajes
      }],
      total_employees: 200
    },
    // Datos para la gráfica de línea de evolución
    mentalHealthTrend: {
      labels: ['Ene', 'Feb', 'Mar'], // Últimos 3 meses
      datasets: [{
        data: [85, 88, 82], // Índice de salud mental (0-100)
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`
      }],
      period: "90_days"
    }
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard General</Text>
      
      {/* Gráfica de Barras - Semáforo */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Distribución por Nivel de Riesgo</Text>
        <BarChart
          data={{
            labels: mockData.trafficLightData.labels,
            datasets: [{
              data: mockData.trafficLightData.datasets[0].data
            }]
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            colors: ['#4CAF50', '#FFC107', '#FF5252']
          }}
          style={styles.chart}
          showValuesOnTopOfBars
        />
        <Text style={styles.chartNote}>
          Total de empleados: {mockData.trafficLightData.total_employees}
        </Text>
      </View>

      {/* Gráfica de Línea - Evolución */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Evolución de Salud Mental (90 días)</Text>
        <LineChart
          data={{
            labels: mockData.mentalHealthTrend.labels,
            datasets: mockData.mentalHealthTrend.datasets
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          bezier
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  chart: {
    borderRadius: 10,
    marginVertical: 8,
  },
  chartNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default DashboardScreen;