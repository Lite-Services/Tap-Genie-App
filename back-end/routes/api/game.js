const express = require("express");
const router = express.Router();

const gameController = require("../../controllers/game");
const tgMiddleware = require("../../middlewares/tg");

// Use POST for routes that accept request body data
router.post("/upscore",  gameController.upscore);
router.post("/getscore", gameController.getscore);
router.post("/getref", gameController.getref);
router.post("/refclaim", gameController.refclaim);
router.post("/getcheckin", gameController.getCheckin);
router.post("/upcheckin", gameController.upCheckin);
router.post("/usersrank",   gameController.getAllUserRank);



module.exports = router;