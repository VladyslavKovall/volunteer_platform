const jwt = require('jsonwebtoken');

const authMiddleware = (secret) => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) return res.status(401).json({ message: 'Немає токена' });

        jwt.verify(token, secret, (err, user) => {
            if (err) return res.status(403).json({ message: 'Невалідний токен' });
            req.user = user;
            next();
        });
    };
};

module.exports = authMiddleware;
