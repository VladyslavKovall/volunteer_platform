const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class UserController {
  async registration(req, res) {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Заповніть всі поля" });
    }
    try {
      User.findUserByEmail(email, async (err, results) => {
        if (err) {
          console.error("DB error:", err);
          return res.status(500).json({ message: "Помилка бази даних" });
        }

        if (results.length) {
          return res
            .status(400)
            .json({ message: "Користувач вже існує", email, password });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        User.createNewUser(username, email, hashedPassword, (err, result) => {
          if (err)
            return res
              .status(500)
              .json({ message: "Помилка при створенні користувача" });
          res.status(201).json({ message: "Користувач зареєстрований" });
        });
      });
    } catch (err) {
      res.status(500).json({ message: "Помилка сервера" });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Введіть email і пароль" });
    }

    User.findUserByEmail(email, async (err, results) => {
      if (err || results.length === 0) {
        return res.status(400).json({ message: "Користувача не знайдено" });
      }

      const user = results[0];

      if (!user.password) {
        return res
          .status(500)
          .json({ message: "Помилка: відсутній пароль у користувача" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Невірний пароль" });
      }

      const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
      console.log(token);
      res.json({ message: "Вхід успішний!", token });
    });
  }
}

module.exports = new UserController();
