const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getStatistics } = require("../controllers/statisticsController");

router.get("/", auth, getStatistics);

module.exports = router;
