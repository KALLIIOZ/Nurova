import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions } from 'react-native';
import { BarChart, LineChart, ProgressChart } from 'react-native-chart-kit';
import api from '../../services/api';

const DashboardScreen = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estructura de ejemplo (mock) para la vista de métricas
  const mockData = {
    global_score: 72,
    // Datos para la gráfica de línea de evolución
    mentalHealthTrend: {
      labels: ['Ene', 'Feb', 'Mar'], // Últimos 3 meses
      datasets: [{
        data: [85, 88, 82], // Índice de salud mental (0-100)
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`
      }],
      period: "90_days"
    },
    ia_interactions_pct: 0.29,
    evaluations: [8, 15, 20, 24],
    average_state: 'Calmado',
    engagement: {
      active: '82%',
      psych_sessions_pct: '24%'
    },
    summary: {
      trend: 'Estable',
      coverage: '77%',
      users: 2530
    },
    // Fallback specific field
    mood_trend: null
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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

  // Merge API data with mock data to ensure UI has all required fields
  // If API returns global_score (as mentalHealthScore), use it.
  const data = {
    ...mockData,
    ...dashboardData,
    // Map specific API fields if names differ
    global_score: dashboardData?.mentalHealthScore || mockData.global_score
  };

  // support both server key shapes: `mentalHealthTrend` (client) or `mood_trend` (server)
  const trendData = data.mentalHealthTrend || (data.mood_trend ? {
    labels: data.mood_trend.labels || [],
    datasets: [{ data: data.mood_trend.data || [] }]
  } : mockData.mentalHealthTrend);

  const evaluationsData = data.evaluations || mockData.evaluations;

  if (loading && !dashboardData) {
    // Optional: Show simplified loading or just render with mock default while loading
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.screenTitle}>Métricas</Text>

      <Text style={styles.sectionTitle}>Panel de Salud Mental</Text>

      <View style={styles.row}>
        {/* Score card */}
        <View style={[styles.smallCard, { width: (screenWidth - 60) * 0.4 }]}>
          <Text style={styles.smallLabel}>Puntaje de bienestar</Text>
          <Text style={styles.scoreValue}>{data.global_score}</Text>
          <Text style={styles.smallNote}>Actual</Text>
        </View>

        {/* Mood trend */}
        <View style={[styles.largeCard, { width: (screenWidth - 60) * 0.6 }]}>
          <Text style={styles.cardTitle}>Estado de ánimo</Text>
          <LineChart
            data={{
              labels: trendData.labels,
              datasets: trendData.datasets
            }}
            width={(screenWidth - 60) * 0.55}
            height={120}
            chartConfig={chartConfig}
            withDots={true}
            bezier
            style={{ paddingRight: 10 }}
          />
        </View>
      </View>

      <View style={styles.row}>
        {/* Interactions with AI */}
        <View style={[styles.smallCard, { width: (screenWidth - 60) * 0.4 }]}>
          <Text style={styles.smallLabel}>Interacciones con IA</Text>
          <ProgressChart
            data={{ labels: ['IA'], data: [data.ia_interactions_pct || 0] }}
            width={(screenWidth - 60) * 0.35}
            height={120}
            strokeWidth={8}
            radius={30}
            chartConfig={chartConfig}
            hideLegend={true}
          />
          <Text style={styles.smallPercent}>{data.ia_interactions_pct ? `${Math.round(data.ia_interactions_pct * 100)}%` : '0%'}</Text>
        </View>

        {/* Evaluations bar chart */}
        <View style={[styles.largeCard, { width: (screenWidth - 60) * 0.6 }]}>
          <Text style={styles.cardTitle}>Evaluaciones completadas</Text>
          <BarChart
            data={{
              labels: ['Abr 10', 'Abr 17', 'Abr 24', 'May 1'],
              datasets: [{ data: evaluationsData }]
            }}
            width={(screenWidth - 60) * 0.55}
            height={120}
            chartConfig={chartConfig}
            style={{ marginTop: 8 }}
            fromZero
            showValuesOnTopOfBars
          />
        </View>
      </View>

      {/* Emotional state + Recommendations */}
      <View style={styles.recommendRow}>
        <View style={[styles.recommendCard]}>
          <Text style={styles.smallLabel}>Estado emocional promedio</Text>
          <Text style={styles.bigState}>{data.average_state}</Text>
          <Text style={styles.recommendTitle}>Recomendaciones</Text>
          <View style={styles.recommendList}>
            <Text style={styles.recommendItem}>• Organiza una sesión de feedback</Text>
            <Text style={styles.recommendItem}>• Fomenta las pausas activas</Text>
            <Text style={styles.recommendItem}>• Comparte recursos de manejo del estrés</Text>
          </View>
        </View>

        <View style={[styles.engagementCard]}>
          <Text style={styles.cardTitle}>Engagement con la plataforma</Text>
          <View style={styles.engRow}>
            <View style={styles.engCol}>
              <Text style={styles.engLabel}>Empleados activos</Text>
              <Text style={styles.engValue}>{data.engagement?.active || '-'}</Text>
            </View>
            <View style={styles.engCol}>
              <Text style={styles.engLabel}>% con sesiones de psicólogo</Text>
              <Text style={styles.engValue}>{data.engagement?.psych_sessions_pct || '-'}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ height: 18 }} />

      <Text style={styles.sectionTitle}>Estado general de salud mental</Text>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Tendencia</Text>
          <Text style={styles.summaryValue}>{data.summary?.trend || '-'}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Cobertura</Text>
          <Text style={styles.summaryValue}>{data.summary?.coverage || '-'}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Usuarios</Text>
          <Text style={styles.summaryValue}>{data.summary?.users || '-'}</Text>
        </View>
      </View>

      <View style={{ height: 36 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF4FF' },
  screenTitle: { fontSize: 22, fontWeight: '800', color: '#003C67', marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#007AFF', marginTop: 6, marginBottom: 10 },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  smallCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    height: 180
  },
  largeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    height: 180
  },
  smallLabel: { color: '#66788A', fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  scoreValue: { fontSize: 44, fontWeight: '900', color: '#003C67' },
  smallNote: { color: '#9AA6B2', marginTop: 6 },
  smallPercent: { marginTop: 6, fontWeight: '800', color: '#6F5FB3' },

  cardTitle: { color: '#0E66FF', fontWeight: '700', fontSize: 14, marginBottom: 6 },

  recommendRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  recommendCard: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 12,
    width: '62%',
    elevation: 2,
  },
  engagementCard: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 12,
    width: '36%',
    elevation: 2,
  },
  bigState: { fontSize: 28, fontWeight: '800', color: '#003C67', marginVertical: 8 },
  recommendTitle: { fontWeight: '700', marginTop: 8, marginBottom: 8 },
  recommendList: { paddingLeft: 6 },
  recommendItem: { color: '#50606F', marginBottom: 6 },

  engRow: { flexDirection: 'column', alignItems: 'stretch' },
  engCol: { marginBottom: 12 },
  engLabel: { color: '#66788A', fontSize: 12 },
  engValue: { fontSize: 20, fontWeight: '800', color: '#003C67' },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  summaryItem: { backgroundColor: 'white', padding: 12, borderRadius: 10, width: '30%', alignItems: 'center', elevation: 2 },
  summaryLabel: { fontSize: 12, color: '#66788A' },
  summaryValue: { fontSize: 18, fontWeight: '800', color: '#003C67', marginTop: 6 },
});

export default DashboardScreen;