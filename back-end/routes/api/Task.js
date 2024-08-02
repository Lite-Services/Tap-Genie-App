var express = require("express");
var router = express.Router();

const tgMiddleware = require("../../middlewares/tg");
var Task = require("../../controllers/Task");

router.get("/list",   Task.list);
router.post("/claim",   Task.claim);
router.post("/checkin",   Task.checkin);


module.exports = router;