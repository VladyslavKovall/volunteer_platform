const db = require('../config/db');

exports.createEvent = (userId, title, description, date, location, callback) => {
    const sql = 'INSERT INTO events (user_id, title, description, date, location) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [userId, title, description, date, location], callback);
};

exports.getAllEvents = (callback) => {
    const sql = 'SELECT * FROM events ORDER BY date ASC';
    db.query(sql, callback);
};

exports.updateEvent = (id, userId, title, description, date, location, callback) => {
    const sql = 'UPDATE events SET title = ?, description = ?, date = ?, location = ? WHERE id = ? AND user_id = ?';
    db.query(sql, [title, description, date, location, id, userId], callback);
};

exports.deleteEvent = (id, userId, callback) => {
    const sql = 'DELETE FROM events WHERE id = ? AND user_id = ?';
    db.query(sql, [id, userId], callback);
};

exports.findEventById = (id, callback) => {
    const sql = 'SELECT * FROM events WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]); 
    });
};
