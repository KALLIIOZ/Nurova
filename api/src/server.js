const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const appointmentRoutes = require('./routes/appointments.routes');
const chatRoutes = require('./routes/chat.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Nurova API' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
