require('dotenv').config();
const express = require('express');
const db = require('./config/db'); 
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



app.get('/', (req, res) => {
    res.send('Сервер працює!');
});


app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Заповніть всі поля' });
    }

    try {
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
    
        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
        console.log(token);
        res.json({ message: 'Вхід успішний!', token });
    });
    
});



app.get('/profile', authMiddleware(SECRET_KEY), (req, res) => {
    res.json({ message: `Привіт, користувачу з ID: ${req.user.id}` });
});
app.get('/events', (req, res) => {
    Event.getAllEvents((err, results) => {
        if (err) return res.status(500).json({ error: 'Помилка сервера' });
        res.json(results);
    });
});


  
// створення заходу
app.post('/events', authMiddleware(SECRET_KEY), (req, res) => {
    const { title, description, date, location } = req.body;
    const userId = req.user.id; 
    if (!title || !description || !date || !location) {
        return res.status(400).json({ error: 'Усі поля обов’язкові' });
    }

    Event.createEvent(userId, title, description, date, location, (err, result) => {
        if (err) return res.status(500).json({ error: 'Помилка створення заходу' });
        res.status(201).json({ message: 'Захід створено' });
    });
});


// оновлення заходу
app.put('/events/:id', authMiddleware(SECRET_KEY), (req, res) => {
    const { title, description, date, location } = req.body;
    const { id } = req.params;
    const userId = req.user.id;

    Event.findEventById(id, (err, event) => {
        if (err || !event) return res.status(404).json({ error: 'Подія не знайдена' });
        if (event.user_id !== userId) return res.status(403).json({ error: 'Немає доступу' });

        Event.updateEvent(id, userId, title, description, date, location, (err, result) => {
            if (err) return res.status(500).json({ error: 'Помилка оновлення' });
            res.json({ message: 'Захід оновлено' });
        });
    });
});


// видалення заходу
app.delete('/events/:id', authMiddleware(SECRET_KEY), (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    Event.deleteEvent(id, userId, (err, result) => {
        if (err) return res.status(500).json({ error: 'Помилка видалення' });
        res.json({ message: 'Захід видалено' });
    });
});

// запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер працює на порту ${PORT}`);
});
