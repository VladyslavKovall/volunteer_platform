const db = require('../config/db');


exports.createNewUser = (userName,email,hashedPassword,callback) => {
  const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  db.query(sql, [userName, email, hashedPassword], callback);
};

exports.findUserByEmail = (email,callback) => {
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql,[email],callback);
};
