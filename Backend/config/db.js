const mysql = require('mysql2');

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'qwertyuiop13.A',
    database: 'volunteer_db',
    port: 3306
});

db.connect(err => {
    if (err) {
        console.error(' Помилка підключення до MySQL:', err);
    } else {
        console.log('Підключено до MySQL');
    }
});

module.exports = db;
