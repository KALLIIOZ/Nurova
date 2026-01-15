const db = require('../config/db');

exports.getMessages = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, text, sender, created_at FROM messages WHERE user_id = $1 ORDER BY created_at ASC',
            [req.userId]
        );

        // Transform for frontend if needed (frontend expects { id, text, sender })
        const messages = result.rows.map(row => ({
            id: row.id.toString(),
            text: row.text,
            sender: row.sender
        }));

        res.json(messages);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.sendMessage = async (req, res) => {
    const { text } = req.body;
    try {
        // Save user message
        const userMsg = await db.query(
            'INSERT INTO messages (user_id, text, sender) VALUES ($1, $2, $3) RETURNING *',
            [req.userId, text, 'me']
        );

        // Simulate auto-reply after a slight delay (handled by frontend polling or pushing? 
        // For REST, we usually just return the user message and letting the bot reply async, 
        // but here we can just insert a bot reply immediately for the demo).

        let replyText = "Gracias por tu mensaje.";
        if (text.toLowerCase().includes('triste')) {
            replyText = "Lamento escuchar eso. ¿Quieres agendar una cita?";
        }

        const botMsg = await db.query(
            'INSERT INTO messages (user_id, text, sender) VALUES ($1, $2, $3) RETURNING *',
            [req.userId, replyText, 'other']
        );

        res.status(201).json({
            userMessage: { ...userMsg.rows[0], id: userMsg.rows[0].id.toString() },
            botMessage: { ...botMsg.rows[0], id: botMsg.rows[0].id.toString() }
        });

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
