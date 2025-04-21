require('dotenv').config();
const express = require('express');
const db = require('./config/db'); // Підключення до бази
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); 
const authMiddleware = require('./middleware/authMiddleware');
const Event = require('./models/Event');
const cors = require('cors');

const app = express();
const PORT =  3000;

const SECRET_KEY = process.env.SECRET_KEY;

console.log(SECRET_KEY) 



app.use(cors({
    origin: true, 
    credentials: true
  }));
  
app.use(express.json());


// Головний маршрут
app.get('/', (req, res) => {
    res.send('Сервер працює!');
});

// ✅ РЕЄСТРАЦІЯ
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Заповніть всі поля' });
    }

    try {
        // Перевірка, чи вже існує email
        User.findUserByEmail(email, async (err, results) => {
            if (err) {
                console.error('DB error:', err);
                return res.status(500).json({ message: 'Помилка бази даних' });
            }
        
            if (results.length > 0) {
                return res.status(400).json({ message: 'Користувач вже існує',email,password });
            }
        
            const hashedPassword = await bcrypt.hash(password, 10);
        
            User.createNewUser(username, email, hashedPassword, (err, result) => {
                if (err) return res.status(500).json({ message: 'Помилка при створенні користувача' });
                res.status(201).json({ message: 'Користувач зареєстрований' });
            });
        });
    } catch (err) {
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

// ✅ ЛОГІН
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Введіть email і пароль' });
    }

    User.findUserByEmail(email, async (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ message: 'Користувача не знайдено' });
        }
    
        const user = results[0]; 
        console.log(user);
    
        if (!user.password) {
            return res.status(500).json({ message: 'Помилка: відсутній пароль у користувача' });
        }
    
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Невірний пароль' });
        }
    
        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '2h' });
        res.json({ message: 'Вхід успішний!', token });
    });
    
});

// ✅ ЗАХИЩЕНИЙ маршрут (приклад)
app.get('/profile', authMiddleware(SECRET_KEY), (req, res) => {
    res.json({ message: `Привіт, користувачу з ID: ${req.user.id}` });
});
app.get('/events', (req, res) => {
    Event.getAllEvents((err, results) => {
        if (err) return res.status(500).json({ error: 'Помилка сервера' });
        res.json(results);
    });
});

// Створити захід
app.post('/events', authMiddleware(SECRET_KEY), (req, res) => {

    const { title, description, date, location } = req.body;
    if (!title || !description || !date || !location) {
        return res.status(400).json({ error: 'Усі поля обов’язкові' });
    }
    Event.createEvent(title, description, date, location, (err, result) => {
        if (err) return res.status(500).json({ error: 'Помилка створення заходу' });
        res.status(201).json({ message: 'Захід створено' });
    });
});

// Оновити захід
app.put('/events/:id', authMiddleware(SECRET_KEY), (req, res) => {
    const { title, description, date, location } = req.body;
    const { id } = req.params;
    Event.updateEvent(id, title, description, date, location, (err, result) => {
        if (err) return res.status(500).json({ error: 'Помилка оновлення' });
        res.json({ message: 'Захід оновлено' });
    });
});

// Видалити захід
app.delete('/events/:id', authMiddleware(SECRET_KEY), (req, res) => {
    const { id } = req.params;
    Event.deleteEvent(id, (err, result) => {
        if (err) return res.status(500).json({ error: 'Помилка видалення' });
        res.json({ message: 'Захід видалено' });
    });
});

// ▶️ Запуск сервера
app.listen(PORT, () => {
    console.log(`✅ Сервер працює на порту ${PORT}`);
});
