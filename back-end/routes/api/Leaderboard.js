var express = require("express");
var router = express.Router();

const tgMiddleware = require("../../middlewares/tg");
var Leaderboard = require("../../controllers/Leaderboard");

router.get("/allrank",   Leaderboard.allrank);



module.exports = router;