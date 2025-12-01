import React from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions } from 'react-native';
import { VictoryHeatMap } from 'victory-native';

const DepartmentAnalyticsScreen = () => {
  // Esta sería la estructura del JSON que esperarías de la API para esta vista
  const mockData = {
    // Datos para la tabla de departamentos
    departmentStats: {
      departments: [
        {
          name: "Tecnología",
          traffic_light: {
            green: 70,
            yellow: 20,
            red: 10
          },
          total_employees: 50,
          risk_score: 25 // 0-100
        },
        {
          name: "Recursos Humanos",
          traffic_light: {
            green: 60,
            yellow: 30,
            red: 10
          },
          total_employees: 30,
          risk_score: 35
        },
        {
          name: "Ventas",
          traffic_light: {
            green: 50,
            yellow: 35,
            red: 15
          },
          total_employees: 45,
          risk_score: 45
        }
      ]
    },
    // Datos para el mapa de calor
    heatmapData: {
      departments: [
        {
          name: "Tecnología",
          metrics: {
            stress_level: 30,
            work_life_balance: 25,
            job_satisfaction: 20,
            team_communication: 15
          }
        },
        {
          name: "Recursos Humanos",
          metrics: {
            stress_level: 35,
            work_life_balance: 30,
            job_satisfaction: 25,
            team_communication: 20
          }
        },
        {
          name: "Ventas",
          metrics: {
            stress_level: 45,
            work_life_balance: 40,
            job_satisfaction: 35,
            team_communication: 30
          }
        }
      ],
      metric_descriptions: {
        stress_level: "Nivel de Estrés",
        work_life_balance: "Balance Vida-Trabajo",
        job_satisfaction: "Satisfacción Laboral",
        team_communication: "Comunicación de Equipo"
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Análisis por Departamento</Text>

      {/* Tabla de Departamentos */}
      <View style={styles.tableContainer}>
        <Text style={styles.sectionTitle}>Estado por Departamento</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 2 }]}>Departamento</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Verde</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Amarillo</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Rojo</Text>
        </View>
        {mockData.departmentStats.departments.map((dept, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.cell, { flex: 2 }]}>{dept.name}</Text>
            <Text style={[styles.cell, { flex: 1 }]}>{dept.traffic_light.green}%</Text>
            <Text style={[styles.cell, { flex: 1 }]}>{dept.traffic_light.yellow}%</Text>
            <Text style={[styles.cell, { flex: 1 }]}>{dept.traffic_light.red}%</Text>
          </View>
        ))}
      </View>

      {/* Mapa de Calor */}
      <View style={styles.heatmapContainer}>
        <Text style={styles.sectionTitle}>Mapa de Riesgo por Área</Text>
        <View style={styles.heatmapLegend}>
          <Text style={styles.legendText}>Bajo Riesgo</Text>
          <View style={styles.legendGradient} />
          <Text style={styles.legendText}>Alto Riesgo</Text>
        </View>
        {/* Aquí iría el componente de HeatMap. Este es un ejemplo simplificado */}
        {mockData.heatmapData.departments.map((dept, index) => (
          <View key={index} style={styles.heatmapRow}>
            <Text style={styles.heatmapLabel}>{dept.name}</Text>
            <View style={styles.metricsContainer}>
              {Object.entries(dept.metrics).map(([key, value], i) => (
                <View
                  key={i}
                  style={[
                    styles.heatmapCell,
                    { backgroundColor: `rgba(255, 0, 0, ${value / 100})` }
                  ]}
                >
                  <Text style={styles.metricValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#007AFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#007AFF',
  },
  tableContainer: {
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
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
    marginBottom: 10,
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cell: {
    color: '#666',
  },
  heatmapContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  legendGradient: {
    width: 100,
    height: 10,
    marginHorizontal: 10,
    backgroundColor: 'linear-gradient(to right, green, red)',
  },
  legendText: {
    color: '#666',
    fontSize: 12,
  },
  heatmapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  heatmapLabel: {
    width: 120,
    fontSize: 14,
    color: '#333',
  },
  metricsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  heatmapCell: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 5,
  },
  metricValue: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default DepartmentAnalyticsScreen;