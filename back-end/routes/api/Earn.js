var express = require("express");
var router = express.Router();

const tgMiddleware = require("../../middlewares/tg");
var earn = require("../../controllers/Earn");

router.get("/getscore", earn.getscore);
router.post("/upscore", earn.upscore);

module.exports = router;