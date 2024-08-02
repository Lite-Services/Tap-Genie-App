var express = require("express");
var router = express.Router();

const tgMiddleware = require("../../middlewares/tg");
var Referral = require("../../controllers/Referral");

router.get("/list",   Referral.list);
router.post("/claim",   Referral.claim);
router.post("/claimall",   Referral.claimAll);


module.exports = router;