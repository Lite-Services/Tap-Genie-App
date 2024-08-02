var express = require("express");
var router = express.Router();

const tgMiddleware = require("../../middlewares/tg");
var reward = require("../../controllers/reward");

router.get("/claim",   reward.claim);
router.get("/upgrade",   reward.upgrade);

module.exports = router;
