const Router = require("express");
const router = new Router();
const eventRouter = require("./eventRoutes");
const userRouter = require("./userRoutes");

router.use("/events", eventRouter);
router.use("/users", userRouter);

module.exports = router;
