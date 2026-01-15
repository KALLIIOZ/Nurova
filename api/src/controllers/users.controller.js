const db = require('../config/db');

exports.getProfile = async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.userId]);
        if (result.rows.length === 0) {
            return res.status(404).send({ message: 'User not found.' });
        }
        res.status(200).send(result.rows[0]);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
