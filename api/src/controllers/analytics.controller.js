exports.getDashboardData = async (req, res) => {
    // Return the specific JSON structure required by the dashboard
    // In a real app, calculate this from DB
    const data = {
        trafficLightData: {
            labels: ['Verde', 'Amarillo', 'Rojo'],
            datasets: [{
                data: [65, 25, 10]
            }],
            total_employees: 200
        },
        mentalHealthTrend: {
            labels: ['Ene', 'Feb', 'Mar'],
            datasets: [{
                data: [85, 88, 82],
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`
            }],
            period: "90_days"
        }
    };
    res.json(data);
};

exports.getDepartmentData = async (req, res) => {
    // Mock data matching the frontend structure
    const data = {
        departmentStats: {
            departments: [
                {
                    name: "Tecnología",
                    traffic_light: { green: 70, yellow: 20, red: 10 },
                    total_employees: 50,
                    risk_score: 25
                },
                {
                    name: "Recursos Humanos",
                    traffic_light: { green: 60, yellow: 30, red: 10 },
                    total_employees: 30,
                    risk_score: 35
                },
                {
                    name: "Ventas",
                    traffic_light: { green: 50, yellow: 35, red: 15 },
                    total_employees: 45,
                    risk_score: 45
                }
            ]
        },
        heatmapData: {
            departments: [
                {
                    name: "Tecnología",
                    metrics: { stress_level: 30, work_life_balance: 25, job_satisfaction: 20, team_communication: 15 }
                },
                {
                    name: "Recursos Humanos",
                    metrics: { stress_level: 35, work_life_balance: 30, job_satisfaction: 25, team_communication: 20 }
                },
                {
                    name: "Ventas",
                    metrics: { stress_level: 45, work_life_balance: 40, job_satisfaction: 35, team_communication: 30 }
                }
            ]
        }
    };
    res.json(data);
};
