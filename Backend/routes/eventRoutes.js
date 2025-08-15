const Router = require("express");
const router = new Router();
const eventController = require("../controllers/eventControllers");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", eventController.getAll);
router.post(
  "/",
  authMiddleware(process.env.SECRET_KEY),
  eventController.createOne
);
router.put(
  "/:id",
  authMiddleware(process.env.SECRET_KEY),
  eventController.updateEvent
);
router.delete(
  "/:id",
  authMiddleware(process.env.SECRET_KEY),
  eventController.deleteEvent
);
router.post(
  "/:id/register",
  authMiddleware(process.env.SECRET_KEY),
  eventController.joinToEvent
);

router.get("/:id/volunteers", eventController.getAllVolonters);

module.exports = router;
