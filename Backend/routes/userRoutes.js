const Router = require("express");
const router = new Router();
const UserController = require("../controllers/userControllers");

router.post("/registration", UserController.registration);
router.post("/login", UserController.login);
router.get("/auth");

module.exports = router;
