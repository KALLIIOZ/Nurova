const db = require('../config/db');

exports.getPsychologist = async (req, res) => {
    // Return hardcoded psychologist for now, or fetch from a 'psychologists' table if we had one
    res.json({
        name: "Dra. María González",
        specialty: "Psicóloga Clínica",
        experience: "10 años de experiencia"
    });
};

exports.getAvailableSlots = async (req, res) => {
    // Determine available slots. For now, we return valid hours.
    // In a real app, we would query existing appointments for the date and exclude them.
    const { date } = req.query;
    const allSlots = ["09:00", "10:00", "11:00", "16:00", "17:00", "18:00"];

    // Mock: check if date is today, remove passed hours? For simplicity, return all.
    res.json(allSlots);
};

exports.bookAppointment = async (req, res) => {
    const { date, time } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO appointments (user_id, date, time) VALUES ($1, $2, $3) RETURNING *',
            [req.userId, date, time]
        );
        res.status(201).json({ message: 'Appointment booked successfully', appointment: result.rows[0] });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
