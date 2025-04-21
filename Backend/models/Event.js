const db = require('../config/db');

exports.createEvent = (title, description, date, location, callback) => {
    const sql = 'INSERT INTO events (title, description, date, location) VALUES (?, ?, ?, ?)';
    db.query(sql, [title, description, date, location], callback);
};

exports.getAllEvents = (callback) => {
    const sql = 'SELECT * FROM events ORDER BY date ASC';
    db.query(sql, callback);
};

exports.updateEvent = (id, title, description, date, location, callback) => {
    const sql = 'UPDATE events SET title = ?, description = ?, date = ?, location = ? WHERE id = ?';
    db.query(sql, [title, description, date, location, id], callback);
};

exports.deleteEvent = (id, callback) => {
    const sql = 'DELETE FROM events WHERE id = ?';
    db.query(sql, [id], callback);
};
