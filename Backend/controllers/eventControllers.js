const Event = require("../models/Event");
const db = require("../config/db");

class EventController {
  async getAll(req, res) {
    Event.getAllEvents((err, results) => {
      if (err) return res.status(500).json({ error: "Помилка сервера" });
      res.json(results);
    });
  }
  async createOne(req, res) {
    const { title, description, date, location } = req.body;
    const userId = req.user.id;
    if (!title || !description || !date || !location) {
      return res.status(400).json({ error: "Усі поля обов’язкові" });
    }
    const mysqlDate = new Date(date)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    Event.createEvent(
      userId,
      title,
      description,
      mysqlDate,
      location,
      (err, result) => {
        if (err)
          return res.status(500).json({ error: "Помилка створення заходу" });
        res.status(201).json({ message: "Захід створено" });
      }
    );
  }

  async updateEvent(req, res) {
    const { title, description, date, location } = req.body;
    const { id } = req.params;
    const userId = req.user.id;

    Event.findEventById(id, (err, event) => {
      if (err || !event)
        return res.status(404).json({ error: "Подія не знайдена" });
      if (event.user_id !== userId)
        return res.status(403).json({ error: "Немає доступу" });
      const mysqlDate = new Date(date)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      Event.updateEvent(
        id,
        userId,
        title,
        description,
        mysqlDate,
        location,
        (err, result) => {
          console.log(err);
          if (err) return res.status(500).json({ error: "Помилка оновлення" });
          res.json({ message: "Захід оновлено" });
        }
      );
    });
  }
  async deleteEvent(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    Event.deleteEvent(id, userId, (err, result) => {
      if (err) return res.status(500).json({ error: "Помилка видалення" });
      res.json({ message: "Захід видалено" });
    });
  }
  async getAllVolonters(req, res) {
    const eventId = req.params.id;
    Event.getRegistrationsForEvent(eventId, (err, volunteers) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(volunteers);
    });
  }
  async joinToEvent(req, res) {
    const eventId = req.params.id;
    const userId = req.user.id;
    const sql = "INSERT INTO registrations (user_id, event_id) VALUES (?, ?)";
    db.query(sql, [userId, eventId], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res
            .status(400)
            .json({ message: "Ви вже приєдналися до цієї події" });
        }
        console.error(err);
        return res.status(500).json({ message: "Помилка сервера" });
      }
      res.status(201).json({ message: "Успішно приєднано до події" });
    });
  }
}

module.exports = new EventController();
